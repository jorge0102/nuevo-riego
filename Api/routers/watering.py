from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config.database import get_db_connection
from scheduler import get_sector_timer

router = APIRouter(prefix='/api/watering', tags=['Watering'])

class ManualWateringRequest(BaseModel):
    duration: int

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
        cursor.execute('UPDATE watering_status SET is_watering = 0 WHERE id = 1')
        conn.commit()
        conn.close()
        return {'success': True, 'message': 'Riego pausado'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/resume')
async def resume_watering():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE watering_status SET is_watering = 1 WHERE id = 1')
        conn.commit()
        conn.close()
        return {'success': True, 'message': 'Riego reanudado'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/manual')
async def start_manual_watering(data: ManualWateringRequest):
    try:
        hours = data.duration // 60
        minutes = data.duration % 60
        time_str = f'{hours:02d}:{minutes:02d}'
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE watering_status SET is_watering = 1, time_remaining = ? WHERE id = 1', (time_str,))
        conn.commit()
        conn.close()
        return {'success': True, 'message': f'Riego manual iniciado por {data.duration} minutos'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
