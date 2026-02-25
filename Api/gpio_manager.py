import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

RELAY_PINS = {
    1: int(os.getenv('RELAY_GPIO_1', '26')),
    2: int(os.getenv('RELAY_GPIO_2', '20')),
    3: int(os.getenv('RELAY_GPIO_3', '21')),
    4: int(os.getenv('RELAY_GPIO_4', '19')),
}
RELAY_ACTIVE_LOW = os.getenv('RELAY_ACTIVE_LOW', 'true').lower() == 'true'

_lgpio = None
_chip_handle = None

def init_gpio():
    global _lgpio, _chip_handle
    try:
        import lgpio
        _lgpio = lgpio
        _chip_handle = lgpio.gpiochip_open(0)
        off_val = 1 if RELAY_ACTIVE_LOW else 0
        for sector_id, pin in RELAY_PINS.items():
            lgpio.gpio_claim_output(_chip_handle, pin, off_val)
        print(f'GPIO listo. Pines relay: {RELAY_PINS}, active_low={RELAY_ACTIVE_LOW}')
    except Exception as e:
        _lgpio = None
        _chip_handle = None
        print(f'GPIO no disponible (modo simulacion): {e}')

def set_relay(sector_id: int, active: bool):
    pin = RELAY_PINS.get(sector_id)
    if pin is None:
        logger.error(f'Pin no configurado para sector {sector_id}')
        return
    if _lgpio is None or _chip_handle is None:
        state = 'ON' if active else 'OFF'
        print(f'[GPIO-SIM] Sector {sector_id} pin {pin} -> {state}')
        return
    value = (0 if active else 1) if RELAY_ACTIVE_LOW else (1 if active else 0)
    try:
        _lgpio.gpio_write(_chip_handle, pin, value)
        state = 'ON' if active else 'OFF'
        print(f'GPIO pin {pin} -> {value} (Sector {sector_id} {state})')
    except Exception as e:
        logger.error(f'Error GPIO pin {pin}: {e}')

def sync_gpio_from_db():
    try:
        from config.database import get_db_connection
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id, is_active FROM sectors ORDER BY id')
        rows = cursor.fetchall()
        conn.close()
        for row in rows:
            set_relay(row['id'], bool(row['is_active']))
        print('Relays sincronizados con BD')
    except Exception as e:
        print(f'Error sincronizando relays: {e}')

def cleanup_gpio():
    if _lgpio is None or _chip_handle is None:
        return
    try:
        off_val = 1 if RELAY_ACTIVE_LOW else 0
        for pin in RELAY_PINS.values():
            _lgpio.gpio_write(_chip_handle, pin, off_val)
        _lgpio.gpiochip_close(_chip_handle)
        print('GPIO liberado')
    except Exception as e:
        logger.error(f'Error liberando GPIO: {e}')
