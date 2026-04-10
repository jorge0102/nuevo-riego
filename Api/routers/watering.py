from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config.database import get_db_connection
from gpio_manager import set_relay
from scheduler import get_sector_timer, schedule_sector_stop, cancel_sector_timer

router = APIRouter(prefix='/api/watering', tags=['Watering'])

class ManualWateringRequest(BaseModel):
    sectorId: int
    duration: int  # minutos

@router.get('/status')
async def get_watering_status():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id, name FROM sectors WHERE is_active = 1 LIMIT 1')
        active = cursor.fetchone()
        conn.close()

        if not active:
            return {'isWatering': False, 'sectorId': None, 'sectorName': None, 'timeRemaining': '00:00'}

        timer = get_sector_timer(active['id'])
        if timer.get('scheduled') and timer.get('remaining_seconds') is not None:
            remaining = int(timer['remaining_seconds'])
            mins = remaining // 60
            secs = remaining % 60
            time_str = f'{mins:02d}:{secs:02d}'
        else:
            time_str = '00:00'

        return {
            'isWatering': True,
            'sectorId': active['id'],
            'sectorName': active['name'],
            'timeRemaining': time_str,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/pause')
async def pause_watering():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Desactivar todos los sectores activos
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

        # Verificar que el sector existe
        cursor.execute('SELECT id, name FROM sectors WHERE id = ?', (data.sectorId,))
        sector = cursor.fetchone()
        if not sector:
            conn.close()
            raise HTTPException(status_code=404, detail='Sector no encontrado')

        # Parar cualquier sector activo antes de arrancar el nuevo (1 electroválvula a la vez)
        cursor.execute('SELECT id FROM sectors WHERE is_active = 1 AND id != ?', (data.sectorId,))
        active_others = cursor.fetchall()
        if active_others:
            cursor.execute('UPDATE sectors SET is_active = 0 WHERE is_active = 1 AND id != ?', (data.sectorId,))
            conn.commit()
            for s in active_others:
                set_relay(s['id'], False)
                cancel_sector_timer(s['id'])

        # Activar el sector nuevo en la BD
        cursor.execute('UPDATE sectors SET is_active = 1 WHERE id = ?', (data.sectorId,))
        conn.commit()
        conn.close()

        # Activar el relé GPIO
        set_relay(data.sectorId, True)

        # Programar parada automática con la duración indicada
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
