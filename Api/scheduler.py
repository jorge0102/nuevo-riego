from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()

# Mapa de weekday() de Python a day_code de la BD
DAY_MAP = {0: 'L', 1: 'M', 2: 'X', 3: 'J', 4: 'V', 5: 'S', 6: 'D'}

def start_scheduler():
    # Job cada minuto: comprueba si hay sectores auto que deben arrancar
    scheduler.add_job(
        _check_auto_start,
        trigger='cron',
        minute='*',
        id='auto_start_check',
        replace_existing=True,
        misfire_grace_time=30
    )
    scheduler.start()
    print('Scheduler de riego iniciado')

def stop_scheduler():
    scheduler.shutdown(wait=False)
    print('Scheduler detenido')

def schedule_sector_stop(sector_id: int, duration_minutes: int, sector_name: str = ''):
    job_id = 'stop_sector_' + str(sector_id)
    if scheduler.get_job(job_id):
        scheduler.remove_job(job_id)

    run_at = datetime.now() + timedelta(minutes=duration_minutes)
    scheduler.add_job(
        _stop_sector_job,
        trigger='date',
        run_date=run_at,
        id=job_id,
        args=[sector_id],
        misfire_grace_time=60
    )
    hora = run_at.strftime('%H:%M:%S')
    print('Timer: Sector ' + str(sector_id) + ' (' + sector_name + ') parara en ' + str(duration_minutes) + ' min a las ' + hora)

def cancel_sector_timer(sector_id: int):
    job_id = 'stop_sector_' + str(sector_id)
    if scheduler.get_job(job_id):
        scheduler.remove_job(job_id)
        print('Timer cancelado para sector ' + str(sector_id))

def get_sector_timer(sector_id: int):
    job_id = 'stop_sector_' + str(sector_id)
    job = scheduler.get_job(job_id)
    if job and job.next_run_time:
        remaining = job.next_run_time - datetime.now(job.next_run_time.tzinfo)
        total_secs = max(0, int(remaining.total_seconds()))
        mins = total_secs // 60
        secs = total_secs % 60
        return {
            'scheduled': True,
            'runsAt': job.next_run_time.strftime('%H:%M:%S'),
            'remainingMinutes': mins,
            'remainingSeconds': secs,
            'totalRemainingSeconds': total_secs
        }
    return {'scheduled': False}

async def _check_auto_start():
    """Cada minuto: arranca los sectores auto cuya hora y día coinciden."""
    try:
        now = datetime.now()
        current_time = now.strftime('%H:%M')
        current_day = DAY_MAP[now.weekday()]

        from config.database import get_db_connection
        from gpio_manager import set_relay

        conn = get_db_connection()
        cursor = conn.cursor()

        # Busca sectores auto, activos en el día de hoy, con start_time == ahora
        cursor.execute('''
            SELECT s.id, s.name, sc.duration
            FROM sectors s
            JOIN sector_config sc ON s.id = sc.id
            JOIN sector_days sd ON sd.sector_id = s.id AND sd.day_code = ?
            WHERE s.is_auto = 1
              AND sc.start_time = ?
              AND sd.active = 1
              AND s.is_active = 0
        ''', (current_day, current_time))

        sectores = cursor.fetchall()

        for sector in sectores:
            sid = sector['id']
            sname = sector['name']
            duration = sector['duration']

            # Activar en BD
            cursor.execute('UPDATE sectors SET is_active = 1 WHERE id = ?', (sid,))
            conn.commit()

            # Activar relé
            set_relay(sid, True)

            # Programar parada automática
            schedule_sector_stop(sid, duration, sname)

            print(f'AUTO-START: Sector {sid} ({sname}) arrancado por {duration} min')

        conn.close()

    except Exception as e:
        logger.error(f'Error en auto-start check: {e}')

async def _stop_sector_job(sector_id: int):
    from config.database import get_db_connection
    from gpio_manager import set_relay
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE sectors SET is_active = 0 WHERE id = ?', (sector_id,))
        conn.commit()
        conn.close()
        set_relay(sector_id, False)
        print('AUTO-STOP: Sector ' + str(sector_id) + ' detenido por temporizador')
    except Exception as e:
        logger.error('Error en auto-stop sector ' + str(sector_id) + ': ' + str(e))
