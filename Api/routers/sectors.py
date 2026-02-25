from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config.database import get_db_connection
from gpio_manager import set_relay
from scheduler import schedule_sector_stop, cancel_sector_timer, get_sector_timer

router = APIRouter(prefix='/api/sectors', tags=['Sectors'])

class SectorToggle(BaseModel):
    isActive: bool

class SectorMode(BaseModel):
    isAuto: bool

def _get_sector_duration(sector_id: int) -> tuple:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT s.name, sc.duration FROM sectors s JOIN sector_config sc ON s.id = sc.id WHERE s.id = ?',
        (sector_id,)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return row['name'], row['duration']
    return 'Sector ' + str(sector_id), 30

@router.get('')
async def get_sectors():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id, name, icon, is_active, is_auto, color FROM sectors ORDER BY id')
        rows = cursor.fetchall()
        conn.close()
        sectors = []
        for r in rows:
            sector = {
                'id': r['id'], 'name': r['name'], 'icon': r['icon'],
                'isActive': bool(r['is_active']), 'isAuto': bool(r['is_auto']),
                'color': r['color'],
                'timer': get_sector_timer(r['id'])
            }
            sectors.append(sector)
        return {'sectors': sectors}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/{sector_id}/toggle')
async def toggle_sector(sector_id: int, data: SectorToggle):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE sectors SET is_active = ? WHERE id = ?', (int(data.isActive), sector_id))
        conn.commit()
        if cursor.rowcount == 0:
            conn.close()
            raise HTTPException(status_code=404, detail='Sector no encontrado')
        conn.close()

        set_relay(sector_id, data.isActive)

        timer_info = None
        if data.isActive:
            name, duration = _get_sector_duration(sector_id)
            schedule_sector_stop(sector_id, duration, name)
            timer_info = get_sector_timer(sector_id)
            estado = 'activado'
        else:
            cancel_sector_timer(sector_id)
            estado = 'desactivado'

        return {
            'success': True,
            'message': 'Sector ' + str(sector_id) + ' ' + estado,
            'timer': timer_info
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/{sector_id}/mode')
async def toggle_mode(sector_id: int, data: SectorMode):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE sectors SET is_auto = ? WHERE id = ?', (int(data.isAuto), sector_id))
        conn.commit()
        if cursor.rowcount == 0:
            conn.close()
            raise HTTPException(status_code=404, detail='Sector no encontrado')
        conn.close()
        modo = 'auto' if data.isAuto else 'manual'
        return {'success': True, 'message': 'Sector ' + str(sector_id) + ' modo ' + modo}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/{sector_id}/timer')
async def get_timer(sector_id: int):
    return get_sector_timer(sector_id)
