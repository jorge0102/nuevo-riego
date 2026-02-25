# 🌱 Sistema de Riego Automatizado

Sistema completo de riego automatizado con frontend en React y backend en Python + MySQL.

## 📁 Estructura del Proyecto

```
riego/
├── front/              # Frontend React + TypeScript + Vite
├── Api/                # Backend FastAPI + Python
├── database/           # Scripts SQL de base de datos
└── README.md          # Este archivo
```

## 🚀 Instalación Rápida

### 1. Base de Datos MySQL

```bash
# Crear la base de datos
mysql -u root -p < database/schema.sql
```

### 2. Backend (API Python)

```bash
cd Api

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MySQL

# Ejecutar la API
python main.py
```

La API estará en: http://localhost:3000

### 3. Frontend (React)

```bash
cd front

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

El frontend estará en: http://localhost:5173

## 📋 Características

### Frontend
- ✅ Dashboard principal con estado del tanque
- ✅ Control de sectores de riego
- ✅ Programación semanal
- ✅ Configuración individual de sectores
- ✅ Modo manual y automático
- ✅ Interfaz responsive

### Backend
- ✅ API REST completa con FastAPI
- ✅ Conexión a MySQL con pool de conexiones
- ✅ Endpoints para todos los módulos
- ✅ Documentación automática (Swagger)
- ✅ Validación de datos con Pydantic

### Base de Datos
- ✅ Tablas normalizadas
- ✅ Relaciones con claves foráneas
- ✅ Datos de ejemplo incluidos
- ✅ Índices para optimización

## 🔧 Configuración

### Conectar el Frontend con la API

Por defecto, el frontend usa datos mock. Para conectarlo a la API real:

1. Ve a cada archivo `.state.ts` en `front/src/`
2. Cambia `useMock: true` a `useMock: false` en las instancias de los servicios

Ejemplo en `front/src/Home/home.state.ts`:
```typescript
export const homeService = new HomeService('http://localhost:3000/api', false);
```

## 📚 Documentación

- **API Docs (Swagger)**: http://localhost:3000/docs
- **API ReDoc**: http://localhost:3000/redoc
- **Frontend**: Ejecuta `npm run dev` y abre http://localhost:5173

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 19
- TypeScript
- Vite
- Jotai (gestión de estado)
- React Router

### Backend
- Python 3.8+
- FastAPI
- MySQL Connector
- Uvicorn
- Pydantic

### Base de Datos
- MySQL 5.7+

## 📊 Modelo de Datos

### Tablas Principales

1. **tank_status**: Estado del tanque de agua
2. **watering_status**: Estado actual del riego
3. **sectors**: Información de cada sector
4. **sector_config**: Configuración de horarios y duración
5. **sector_days**: Días activos para cada sector
6. **weekly_schedule**: Programación semanal general

## 🔐 Seguridad

- Variables de entorno para credenciales sensibles
- Pool de conexiones para optimizar acceso a DB
- Validación de datos en API
- CORS configurado (ajustar para producción)

## 📝 Comandos Útiles

### Backend
```bash
# Ejecutar API en modo desarrollo
python main.py

# Ejecutar con Uvicorn directamente
uvicorn main:app --reload --port 3000
```

### Frontend
```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

### Base de Datos
```bash
# Importar schema
mysql -u root -p < database/schema.sql

# Conectar a la base de datos
mysql -u root -p riego_db

# Backup
mysqldump -u root -p riego_db > backup.sql
```

## 🐛 Solución de Problemas

### La API no se conecta a MySQL
- Verifica que MySQL esté corriendo
- Revisa las credenciales en `Api/.env`
- Confirma que la base de datos existe

### El frontend no muestra datos
- Verifica que la API esté corriendo en el puerto 3000
- Cambia `useMock` a `false` en los servicios
- Revisa la consola del navegador para errores

### Error de CORS
- Verifica que CORS esté configurado en `Api/main.py`
- En desarrollo, debería estar configurado para permitir todos los orígenes

## 📄 Licencia

Este proyecto es de código abierto.

## 👨‍💻 Autor

Sistema de Riego Automatizado - 2025
