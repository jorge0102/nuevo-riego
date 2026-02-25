# API de Riego - FastAPI + MySQL

API REST desarrollada en Python con FastAPI para el sistema de riego automatizado.

## 📋 Requisitos Previos

- Python 3.8 o superior
- MySQL 5.7 o superior
- pip (gestor de paquetes de Python)

## 🚀 Instalación

### 1. Instalar MySQL

Si no tienes MySQL instalado, descárgalo desde: https://dev.mysql.com/downloads/

### 2. Crear la base de datos

Ejecuta el script SQL para crear la base de datos y las tablas:

```bash
mysql -u root -p < ../database/schema.sql
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configúralo con tus credenciales:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus datos:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=riego_db
DB_PORT=3306

API_PORT=3000
```

### 4. Crear entorno virtual (opcional pero recomendado)

```bash
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

### 5. Instalar dependencias

```bash
pip install -r requirements.txt
```

## ▶️ Ejecutar la API

### Modo desarrollo (con auto-reload)

```bash
python main.py
```

### Modo producción

```bash
uvicorn main:app --host 0.0.0.0 --port 3000
```

La API estará disponible en: `http://localhost:3000`

## 📚 Documentación

Una vez iniciada la API, puedes acceder a:

- **Swagger UI**: http://localhost:3000/docs
- **ReDoc**: http://localhost:3000/redoc

## 🛣️ Endpoints Disponibles

### Tanque
- `GET /api/tank/level` - Obtener nivel del tanque
- `PUT /api/tank/level` - Actualizar nivel del tanque

### Riego
- `GET /api/watering/status` - Obtener estado del riego
- `POST /api/watering/pause` - Pausar el riego
- `POST /api/watering/resume` - Reanudar el riego
- `POST /api/watering/manual` - Iniciar riego manual

### Sectores
- `GET /api/sectors` - Obtener todos los sectores
- `POST /api/sectors/{sector_id}/toggle` - Activar/desactivar sector
- `POST /api/sectors/{sector_id}/mode` - Cambiar modo automático/manual

### Programación
- `GET /api/schedule/weekly` - Obtener programa semanal
- `GET /api/sectors/{sector_id}/config` - Obtener configuración de un sector
- `PUT /api/sectors/{sector_id}/config` - Guardar configuración de un sector

## 🔧 Estructura del Proyecto

```
Api/
├── config/
│   ├── __init__.py
│   └── database.py       # Configuración de conexión a MySQL
├── routers/
│   ├── __init__.py
│   ├── tank.py          # Endpoints del tanque
│   ├── watering.py      # Endpoints de riego
│   ├── sectors.py       # Endpoints de sectores
│   └── schedule.py      # Endpoints de programación
├── main.py              # Punto de entrada de la aplicación
├── requirements.txt     # Dependencias
├── .env.example        # Ejemplo de variables de entorno
└── README.md           # Este archivo
```

## 🧪 Probar la API

### Con curl

```bash
# Obtener nivel del tanque
curl http://localhost:3000/api/tank/level

# Obtener sectores
curl http://localhost:3000/api/sectors

# Pausar riego
curl -X POST http://localhost:3000/api/watering/pause
```

### Con el frontend

1. Ve a la carpeta `front`
2. Edita los archivos de servicios para cambiar `useMock: true` a `useMock: false`
3. Ejecuta el frontend y verás los datos desde la API

## ❗ Solución de Problemas

### Error de conexión a MySQL

Si ves el error `✗ Error al conectar a MySQL`:

1. Verifica que MySQL esté corriendo: `mysql --version`
2. Verifica las credenciales en el archivo `.env`
3. Asegúrate de que la base de datos exista: `mysql -u root -p -e "SHOW DATABASES;"`

### Error de puerto en uso

Si el puerto 3000 está ocupado, cambia `API_PORT` en el archivo `.env`

### Errores de importación

Asegúrate de estar en el entorno virtual y que las dependencias estén instaladas:

```bash
pip install -r requirements.txt
```

## 📝 Notas

- La API usa CORS configurado para permitir todas las orígenes (`*`). En producción, deberías especificar solo los dominios permitidos.
- El pool de conexiones está configurado con un máximo de 5 conexiones. Ajusta según tus necesidades en `config/database.py`.
