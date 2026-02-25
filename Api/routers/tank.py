from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config.database import get_db_connection

router = APIRouter(prefix='/api/tank', tags=['Tank'])

class TankLevelUpdate(BaseModel):
    level: int

@router.get('/level')
async def get_tank_level():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT level FROM tank_status ORDER BY id DESC LIMIT 1')
        result = cursor.fetchone()
        conn.close()
        if not result:
            raise HTTPException(status_code=404, detail='No se encontro info del tanque')
        return {'level': result['level']}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put('/level')
async def update_tank_level(data: TankLevelUpdate):
    if data.level < 0 or data.level > 100:
        raise HTTPException(status_code=400, detail='El nivel debe estar entre 0 y 100')
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE tank_status SET level = ? WHERE id = 1', (data.level,))
        conn.commit()
        conn.close()
        return {'success': True, 'level': data.level}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
