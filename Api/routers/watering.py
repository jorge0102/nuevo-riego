from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config.database import get_db_connection
from gpio_manager import set_relay
from scheduler import get_sector_timer, schedule_sector_stop, cancel_sector_timer

MAX_ACTIVE_VALVES = 2

router = APIRouter(prefix='/api/watering', tags=['Watering'])

class ManualWateringRequest(BaseModel):
    sectorId: int
    duration: int  # minutos

@router.get('/status')
async def get_watering_status():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id, name FROM sectors WHERE is_active = 1 ORDER BY id')
        active_rows = cursor.fetchall()
        conn.close()

        if not active_rows:
            return {
                'isWatering': False,
                'sectorId': None,
                'sectorName': None,
                'timeRemaining': '00:00',
                'remainingSeconds': 0,
                'activeSectors': [],
                'activeCount': 0,
            }

        active_sectors = []
        for row in active_rows:
            timer = get_sector_timer(row['id'])
            if timer.get('scheduled') and timer.get('totalRemainingSeconds') is not None:
                remaining = max(0, int(timer['totalRemainingSeconds']))
            else:
                remaining = 0
            hours = remaining // 3600
            mins = (remaining % 3600) // 60
            secs = remaining % 60
            if hours > 0:
                time_str = f'{hours:02d}:{mins:02d}:{secs:02d}'
            else:
                time_str = f'{mins:02d}:{secs:02d}'
            active_sectors.append({
                'id': row['id'],
                'name': row['name'],
                'timeRemaining': time_str,
                'remainingSeconds': remaining,
            })

        first = active_sectors[0]
        return {
            'isWatering': True,
            'sectorId': first['id'],
            'sectorName': first['name'],
            'timeRemaining': first['timeRemaining'],
            'remainingSeconds': first['remainingSeconds'],
            'activeSectors': active_sectors,
            'activeCount': len(active_sectors),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/pause')
async def pause_watering():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM sectors WHERE is_active = 1')
        active_sectors = cursor.fetchall()
        cursor.execute('UPDATE sectors SET is_active = 0')
        conn.commit()
        conn.close()
        for s in active_sectors:
            set_relay(s['id'], False)
            cancel_sector_timer(s['id'])
        return {'success': True, 'message': 'Riego pausado'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/resume')
async def resume_watering():
    try:
        return {'success': True, 'message': 'Usa riego manual para reanudar'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/manual')
async def start_manual_watering(data: ManualWateringRequest):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT id, name FROM sectors WHERE id = ?', (data.sectorId,))
        sector = cursor.fetchone()
        if not sector:
            conn.close()
            raise HTTPException(status_code=404, detail='Sector no encontrado')

        # Contar cuántos otros sectores están activos (sin contar este)
        cursor.execute('SELECT COUNT(*) as cnt FROM sectors WHERE is_active = 1 AND id != ?', (data.sectorId,))
        row = cursor.fetchone()
        others_active = row['cnt'] if row else 0

        if others_active >= MAX_ACTIVE_VALVES:
            conn.close()
            raise HTTPException(
                status_code=409,
                detail=f'Límite de {MAX_ACTIVE_VALVES} electroválvulas simultáneas alcanzado. Para una antes de arrancar otra.'
            )

        cursor.execute('UPDATE sectors SET is_active = 1 WHERE id = ?', (data.sectorId,))
        conn.commit()
        conn.close()

        set_relay(data.sectorId, True)
        schedule_sector_stop(data.sectorId, data.duration, sector['name'])
        timer_info = get_sector_timer(data.sectorId)

        return {
            'success': True,
            'message': 'Riego manual iniciado: ' + sector['name'] + ' por ' + str(data.duration) + ' min',
            'timer': timer_info
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
