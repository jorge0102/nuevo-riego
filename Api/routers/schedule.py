from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from config.database import get_db_connection

router = APIRouter(prefix='/api', tags=['Schedule'])

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

@router.get('/schedule/weekly')
async def get_weekly_schedule():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Dias con al menos un sector en modo auto y activo ese dia
        cursor.execute('''
            SELECT DISTINCT sd.day_code
            FROM sector_days sd
            JOIN sectors s ON sd.sector_id = s.id
            WHERE sd.active = 1 AND s.is_auto = 1
        ''')
        active_days = {r['day_code'] for r in cursor.fetchall()}
        conn.close()
        all_days = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
        return {'schedule': [{'day': d, 'hasWatering': d in active_days} for d in all_days]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/schedule/weekly-by-sector')
async def get_weekly_by_sector():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT s.id, s.name, sc.start_time, sc.duration
            FROM sectors s
            LEFT JOIN sector_config sc ON s.id = sc.id
            ORDER BY s.id
        ''')
        sectors = cursor.fetchall()
        result = []
        for sector in sectors:
            cursor.execute(
                'SELECT day_code, active FROM sector_days WHERE sector_id = ? ORDER BY id',
                (sector['id'],)
            )
            days = cursor.fetchall()
            result.append({
                'id': sector['id'],
                'name': sector['name'],
                'startTime': str(sector['start_time'])[:5] if sector['start_time'] else '06:00',
                'duration': sector['duration'] or 30,
                'days': [{'day': d['day_code'], 'active': bool(d['active'])} for d in days],
            })
        conn.close()
        return {'sectors': result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/sectors/{sector_id}/config')
async def get_sector_config(sector_id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT s.id, s.name, s.icon, s.is_auto,
                   sc.start_time, sc.duration, sc.repeat_cycle
            FROM sectors s
            LEFT JOIN sector_config sc ON s.id = sc.id
            WHERE s.id = ?
        ''', (sector_id,))
        sector = cursor.fetchone()
        if not sector:
            conn.close()
            raise HTTPException(status_code=404, detail='Sector no encontrado')
        cursor.execute('SELECT day_code, day_label, active FROM sector_days WHERE sector_id = ? ORDER BY id', (sector_id,))
        days = cursor.fetchall()
        conn.close()
        return {
            'id': sector['id'], 'name': sector['name'], 'icon': sector['icon'],
            'isAuto': bool(sector['is_auto']),
            'startTime': str(sector['start_time'])[:5] if sector['start_time'] else '06:00',
            'duration': sector['duration'] or 30,
            'repeatCycle': bool(sector['repeat_cycle']),
            'days': [{'day': d['day_code'], 'label': d['day_label'], 'active': bool(d['active'])} for d in days]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put('/sectors/{sector_id}/config')
async def save_sector_config(sector_id: int, config: SectorConfiguration):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE sectors SET name = ?, icon = ?, is_auto = ? WHERE id = ?',
                       (config.name, config.icon, int(config.isAuto), sector_id))
        cursor.execute('UPDATE sector_config SET start_time = ?, duration = ?, repeat_cycle = ? WHERE id = ?',
                       (config.startTime, config.duration, int(config.repeatCycle), sector_id))
        for day in config.days:
            cursor.execute('UPDATE sector_days SET active = ? WHERE sector_id = ? AND day_code = ?',
                           (int(day.active), sector_id, day.day))
        conn.commit()
        conn.close()
        return {'success': True, 'message': 'Configuracion guardada'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
