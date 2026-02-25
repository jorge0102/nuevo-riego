import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración del pool de conexiones
db_config = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "riego_db"),
    "port": int(os.getenv("DB_PORT", 3306))
}

# Crear pool de conexiones
connection_pool = pooling.MySQLConnectionPool(
    pool_name="riego_pool",
    pool_size=5,
    pool_reset_session=True,
    **db_config
)

def get_db_connection():
    """Obtiene una conexión del pool"""
    try:
        return connection_pool.get_connection()
    except mysql.connector.Error as err:
        print(f"Error al obtener conexión: {err}")
        raise

def test_connection():
    """Prueba la conexión a la base de datos"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        conn.close()
        print("✓ Conexión a MySQL exitosa")
        return True
    except Exception as e:
        print(f"✗ Error al conectar a MySQL: {e}")
        return False
