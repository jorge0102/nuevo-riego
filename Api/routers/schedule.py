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
        cursor.execute('SELECT day_code, day_label, has_watering FROM weekly_schedule ORDER BY id')
        rows = cursor.fetchall()
        conn.close()
        return {'schedule': [{'day': r['day_code'], 'hasWatering': bool(r['has_watering'])} for r in rows]}
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
