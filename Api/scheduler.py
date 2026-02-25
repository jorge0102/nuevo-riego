from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()

def start_scheduler():
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
            'remainingSeconds': secs
        }
    return {'scheduled': False}

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
