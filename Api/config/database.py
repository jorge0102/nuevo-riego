import sqlite3
import os
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.getenv('DB_PATH', '/home/riego/nuevo-riego/database/riego.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA journal_mode=WAL')
    return conn

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.executescript('''
        CREATE TABLE IF NOT EXISTS tank_status (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            level INTEGER NOT NULL DEFAULT 75
        );
        CREATE TABLE IF NOT EXISTS watering_status (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            is_watering INTEGER NOT NULL DEFAULT 0,
            time_remaining TEXT DEFAULT '00:00'
        );
        CREATE TABLE IF NOT EXISTS sectors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            icon TEXT NOT NULL DEFAULT 'yard',
            is_active INTEGER NOT NULL DEFAULT 0,
            is_auto INTEGER NOT NULL DEFAULT 1,
            color TEXT DEFAULT 'primary'
        );
        CREATE TABLE IF NOT EXISTS sector_config (
            id INTEGER PRIMARY KEY,
            start_time TEXT NOT NULL DEFAULT '06:00',
            duration INTEGER NOT NULL DEFAULT 30,
            repeat_cycle INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (id) REFERENCES sectors(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS sector_days (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sector_id INTEGER NOT NULL,
            day_code TEXT NOT NULL,
            day_label TEXT NOT NULL,
            active INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE,
            UNIQUE(sector_id, day_code)
        );
        CREATE TABLE IF NOT EXISTS weekly_schedule (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            day_code TEXT NOT NULL UNIQUE,
            day_label TEXT NOT NULL,
            has_watering INTEGER NOT NULL DEFAULT 0
        );
    ''')

    cursor.execute('SELECT COUNT(*) FROM tank_status')
    if cursor.fetchone()[0] == 0:
        cursor.execute('INSERT INTO tank_status (level) VALUES (75)')

    cursor.execute('SELECT COUNT(*) FROM watering_status')
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO watering_status (is_watering, time_remaining) VALUES (0, '00:00')")

    cursor.execute('SELECT COUNT(*) FROM sectors')
    if cursor.fetchone()[0] == 0:
        cursor.executescript("""
            INSERT INTO sectors (id, name, icon, is_active, is_auto, color) VALUES
            (1, 'Sector 1: Aguacates', 'yard', 1, 1, 'secondary'),
            (2, 'Sector 2: Mangos', 'local_florist', 0, 1, 'primary'),
            (3, 'Sector 3: Pencas', 'potted_plant', 0, 1, 'primary'),
            (4, 'Sector 4: Pitayas', 'grass', 1, 0, 'secondary');

            INSERT INTO sector_config (id, start_time, duration, repeat_cycle) VALUES
            (1, '06:30', 45, 0), (2, '07:00', 30, 0),
            (3, '06:00', 60, 1), (4, '18:00', 20, 0);

            INSERT INTO sector_days (sector_id, day_code, day_label, active) VALUES
            (1,'L','Lunes',0),(1,'M','Martes',1),(1,'X','Miercoles',0),
            (1,'J','Jueves',1),(1,'V','Viernes',0),(1,'S','Sabado',1),(1,'D','Domingo',0),
            (2,'L','Lunes',1),(2,'M','Martes',0),(2,'X','Miercoles',0),
            (2,'J','Jueves',1),(2,'V','Viernes',0),(2,'S','Sabado',0),(2,'D','Domingo',0),
            (3,'L','Lunes',1),(3,'M','Martes',1),(3,'X','Miercoles',1),
            (3,'J','Jueves',1),(3,'V','Viernes',1),(3,'S','Sabado',1),(3,'D','Domingo',1),
            (4,'L','Lunes',1),(4,'M','Martes',1),(4,'X','Miercoles',1),
            (4,'J','Jueves',1),(4,'V','Viernes',1),(4,'S','Sabado',1),(4,'D','Domingo',0);

            INSERT INTO weekly_schedule (day_code, day_label, has_watering) VALUES
            ('L','Lunes',0),('M','Martes',1),('X','Miercoles',0),
            ('J','Jueves',1),('V','Viernes',0),('S','Sabado',1),('D','Domingo',0);
        """)

    conn.commit()
    conn.close()
    print('Base de datos SQLite lista:', DB_PATH)

def test_connection():
    try:
        conn = get_db_connection()
        conn.execute('SELECT 1')
        conn.close()
        print('Conexion SQLite correcta')
        return True
    except Exception as e:
        print(f'Error SQLite: {e}')
        return False
