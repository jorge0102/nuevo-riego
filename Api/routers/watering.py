from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config.database import get_db_connection

router = APIRouter(prefix='/api/watering', tags=['Watering'])

class ManualWateringRequest(BaseModel):
    duration: int

@router.get('/status')
async def get_watering_status():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT is_watering, time_remaining FROM watering_status ORDER BY id DESC LIMIT 1')
        result = cursor.fetchone()
        conn.close()
        if not result:
            raise HTTPException(status_code=404, detail='No se encontro estado de riego')
        return {'isWatering': bool(result['is_watering']), 'timeRemaining': result['time_remaining']}
    except HTTPException:
        raise
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
