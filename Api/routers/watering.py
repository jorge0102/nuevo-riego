from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config.database import get_db_connection

router = APIRouter(prefix="/api/watering", tags=["Watering"])

class ManualWateringRequest(BaseModel):
    duration: int

@router.get("/status")
async def get_watering_status():
    """Obtener el estado actual del riego"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT is_watering, time_remaining FROM watering_status ORDER BY id DESC LIMIT 1")
        result = cursor.fetchone()

        cursor.close()
        conn.close()

        if not result:
            raise HTTPException(status_code=404, detail="No se encontró estado de riego")

        return {
            "isWatering": bool(result["is_watering"]),
            "timeRemaining": result["time_remaining"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener estado de riego: {str(e)}")

@router.post("/pause")
async def pause_watering():
    """Pausar el riego"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("UPDATE watering_status SET is_watering = FALSE WHERE id = 1")
        conn.commit()

        cursor.close()
        conn.close()

        return {"success": True, "message": "Riego pausado"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al pausar el riego: {str(e)}")

@router.post("/resume")
async def resume_watering():
    """Reanudar el riego"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("UPDATE watering_status SET is_watering = TRUE WHERE id = 1")
        conn.commit()

        cursor.close()
        conn.close()

        return {"success": True, "message": "Riego reanudado"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al reanudar el riego: {str(e)}")

@router.post("/manual")
async def start_manual_watering(data: ManualWateringRequest):
    """Iniciar riego manual"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Formatear el tiempo (convertir minutos a formato MM:SS)
        hours = data.duration // 60
        minutes = data.duration % 60
        time_str = f"{hours:02d}:{minutes:02d}"

        cursor.execute(
            "UPDATE watering_status SET is_watering = TRUE, time_remaining = %s WHERE id = 1",
            (time_str,)
        )
        conn.commit()

        cursor.close()
        conn.close()

        return {"success": True, "message": f"Riego manual iniciado por {data.duration} minutos"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al iniciar riego manual: {str(e)}")
