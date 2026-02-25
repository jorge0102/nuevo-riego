from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config.database import get_db_connection

router = APIRouter(prefix="/api/sectors", tags=["Sectors"])

class SectorToggle(BaseModel):
    isActive: bool

class SectorMode(BaseModel):
    isAuto: bool

@router.get("")
async def get_sectors():
    """Obtener todos los sectores"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, name, icon, is_active, is_auto, color
            FROM sectors
            ORDER BY id
        """)
        sectors = cursor.fetchall()

        cursor.close()
        conn.close()

        # Convertir a formato frontend
        result = []
        for sector in sectors:
            result.append({
                "id": sector["id"],
                "name": sector["name"],
                "icon": sector["icon"],
                "isActive": bool(sector["is_active"]),
                "isAuto": bool(sector["is_auto"]),
                "color": sector["color"]
            })

        return {"sectors": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener sectores: {str(e)}")

@router.post("/{sector_id}/toggle")
async def toggle_sector(sector_id: int, data: SectorToggle):
    """Activar/desactivar un sector"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "UPDATE sectors SET is_active = %s WHERE id = %s",
            (data.isActive, sector_id)
        )
        conn.commit()

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Sector no encontrado")

        cursor.close()
        conn.close()

        return {"success": True, "message": f"Sector {sector_id} {'activado' if data.isActive else 'desactivado'}"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al cambiar estado del sector: {str(e)}")

@router.post("/{sector_id}/mode")
async def toggle_mode(sector_id: int, data: SectorMode):
    """Cambiar modo automático/manual de un sector"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "UPDATE sectors SET is_auto = %s WHERE id = %s",
            (data.isAuto, sector_id)
        )
        conn.commit()

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Sector no encontrado")

        cursor.close()
        conn.close()

        return {"success": True, "message": f"Sector {sector_id} en modo {'automático' if data.isAuto else 'manual'}"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al cambiar modo del sector: {str(e)}")
