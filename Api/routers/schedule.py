from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from config.database import get_db_connection

router = APIRouter(prefix="/api", tags=["Schedule"])

class DayConfig(BaseModel):
    day: str
    label: str
    active: bool

class SectorConfiguration(BaseModel):
    id: int
    name: str
    icon: str
    isAuto: bool
    startTime: str
    duration: int
    repeatCycle: bool
    days: List[DayConfig]

@router.get("/schedule/weekly")
async def get_weekly_schedule():
    """Obtener el programa semanal"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT day_code, day_label, has_watering
            FROM weekly_schedule
            ORDER BY id
        """)
        schedule = cursor.fetchall()

        cursor.close()
        conn.close()

        result = []
        for day in schedule:
            result.append({
                "day": day["day_code"],
                "hasWatering": bool(day["has_watering"])
            })

        return {"schedule": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener programa semanal: {str(e)}")

@router.get("/sectors/{sector_id}/config")
async def get_sector_config(sector_id: int):
    """Obtener la configuración de un sector específico"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Obtener datos del sector
        cursor.execute("""
            SELECT s.id, s.name, s.icon, s.is_auto,
                   sc.start_time, sc.duration, sc.repeat_cycle
            FROM sectors s
            LEFT JOIN sector_config sc ON s.id = sc.id
            WHERE s.id = %s
        """, (sector_id,))
        sector = cursor.fetchone()

        if not sector:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Sector no encontrado")

        # Obtener días configurados
        cursor.execute("""
            SELECT day_code, day_label, active
            FROM sector_days
            WHERE sector_id = %s
            ORDER BY id
        """, (sector_id,))
        days = cursor.fetchall()

        cursor.close()
        conn.close()

        # Formatear tiempo (de TIME a HH:MM)
        start_time = str(sector["start_time"])
        if len(start_time) > 5:
            start_time = start_time[:5]  # Tomar solo HH:MM

        # Construir respuesta
        result = {
            "id": sector["id"],
            "name": sector["name"],
            "icon": sector["icon"],
            "isAuto": bool(sector["is_auto"]),
            "startTime": start_time,
            "duration": sector["duration"],
            "repeatCycle": bool(sector["repeat_cycle"]),
            "days": [
                {
                    "day": day["day_code"],
                    "label": day["day_label"],
                    "active": bool(day["active"])
                }
                for day in days
            ]
        }

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener configuración del sector: {str(e)}")

@router.put("/sectors/{sector_id}/config")
async def save_sector_config(sector_id: int, config: SectorConfiguration):
    """Guardar la configuración de un sector"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Actualizar sector
        cursor.execute("""
            UPDATE sectors
            SET name = %s, icon = %s, is_auto = %s
            WHERE id = %s
        """, (config.name, config.icon, config.isAuto, sector_id))

        # Actualizar configuración
        cursor.execute("""
            UPDATE sector_config
            SET start_time = %s, duration = %s, repeat_cycle = %s
            WHERE id = %s
        """, (config.startTime, config.duration, config.repeatCycle, sector_id))

        # Actualizar días
        for day in config.days:
            cursor.execute("""
                UPDATE sector_days
                SET active = %s
                WHERE sector_id = %s AND day_code = %s
            """, (day.active, sector_id, day.day))

        conn.commit()
        cursor.close()
        conn.close()

        return {"success": True, "message": "Configuración guardada correctamente"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar configuración: {str(e)}")
