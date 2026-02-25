from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config.database import get_db_connection

router = APIRouter(prefix="/api/tank", tags=["Tank"])

class TankLevelUpdate(BaseModel):
    level: int

@router.get("/level")
async def get_tank_level():
    """Obtener el nivel actual del tanque"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT level FROM tank_status ORDER BY id DESC LIMIT 1")
        result = cursor.fetchone()

        cursor.close()
        conn.close()

        if not result:
            raise HTTPException(status_code=404, detail="No se encontró información del tanque")

        return {"level": result["level"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener nivel del tanque: {str(e)}")

@router.put("/level")
async def update_tank_level(data: TankLevelUpdate):
    """Actualizar el nivel del tanque"""
    if data.level < 0 or data.level > 100:
        raise HTTPException(status_code=400, detail="El nivel debe estar entre 0 y 100")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("UPDATE tank_status SET level = %s WHERE id = 1", (data.level,))
        conn.commit()

        cursor.close()
        conn.close()

        return {"success": True, "level": data.level}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar nivel del tanque: {str(e)}")
