# Sistema de Riego Automatizado — Documentación Completa
> Para reproducción en masa. Versión: Marzo 2026

---

## ÍNDICE
1. [Resumen del sistema](#1-resumen-del-sistema)
2. [Hardware necesario](#2-hardware-necesario)
3. [Sistema operativo y configuración base](#3-sistema-operativo-y-configuración-base)
4. [Estructura del proyecto](#4-estructura-del-proyecto)
5. [Base de datos SQLite](#5-base-de-datos-sqlite)
6. [API REST (FastAPI)](#6-api-rest-fastapi)
7. [GPIO — Control de relés](#7-gpio--control-de-relés)
8. [Scheduler — Automatización y temporizadores](#8-scheduler--automatización-y-temporizadores)
9. [Frontend Web (React + Vite)](#9-frontend-web-react--vite)
10. [App Móvil (React Native + Expo)](#10-app-móvil-react-native--expo)
11. [Seguridad — API Key](#11-seguridad--api-key)
12. [Servicio systemd (arranque automático)](#12-servicio-systemd-arranque-automático)
13. [Acceso remoto con Tailscale](#13-acceso-remoto-con-tailscale)
14. [Puertos y conexiones](#14-puertos-y-conexiones)
15. [Guía de instalación desde cero](#15-guía-de-instalación-desde-cero)
16. [Endpoints de la API](#16-endpoints-de-la-api)
17. [Variables de entorno](#17-variables-de-entorno)
18. [Resolución de problemas](#18-resolución-de-problemas)

---

## 1. Resumen del sistema

Sistema completo de riego automatizado para finca. Controla 4 sectores de riego mediante relés conectados a una Raspberry Pi. Incluye:

- **API REST** en Python (FastAPI) escuchando en el puerto 3000
- **Frontend web** React corriendo en el puerto 5173 (acceso desde navegador)
- **App móvil** React Native / Expo (iOS y Android)
- **Automatización** por día de la semana y hora (sin cron, usando APScheduler)
- **Acceso remoto** vía Tailscale (VPN mesh)
- **Base de datos** SQLite local (sin dependencias externas)
- **Control GPIO** directo de pines de la Raspberry Pi vía `lgpio`

---

## 2. Hardware necesario

| Componente | Especificación | Notas |
|---|---|---|
| Raspberry Pi | Modelo 4 o 5 (aarch64) | Funciona también con Pi 3 |
| Tarjeta SD | 16 GB mínimo clase 10 | Recomendado 32 GB |
| Módulo relé 4 canales | 5V, activo en HIGH | Ver configuración de pines |
| Electroválvulas | 24V AC o 12V DC | Una por sector |
| Fuente alimentación | 5V 3A para Pi + 12V para válvulas | Separadas |
| Cable red o WiFi | Para conexión LAN/Tailscale | — |

### Conexión GPIO — Pines de relé

| Sector | Pin GPIO (BCM) | Configuración |
|---|---|---|
| Sector 1 | GPIO 4 | Activo en HIGH (active_low=False) |
| Sector 2 | GPIO 22 | Activo en HIGH |
| Sector 3 | GPIO 6 | Activo en HIGH |
| Sector 4 | GPIO 26 | Activo en HIGH |

> **Nota sobre active_low**: Si tu módulo relé es activo en LOW (mayoría de módulos chinos de 4 relés),
> cambia `RELAY_ACTIVE_LOW=true` en el `.env`. El código lo gestiona automáticamente.

---

## 3. Sistema operativo y configuración base

**SO instalado:** Debian GNU/Linux 13 (Trixie) — Raspberry Pi OS de 64 bits
**Kernel:** Linux 6.12.47+rpt-rpi-v8 (aarch64)
**Python:** 3.13.5
**Node.js:** v24.11.1

### Usuario del sistema

```bash
# Se usa un usuario dedicado llamado 'riego'
sudo adduser riego
sudo usermod -aG gpio riego   # IMPRESCINDIBLE para acceso GPIO
sudo usermod -aG sudo riego   # Opcional, para administración
```

### Instalaciones base necesarias

```bash
sudo apt update && sudo apt upgrade -y

# Python y herramientas
sudo apt install -y python3 python3-pip python3-venv python3-lgpio git

# Node.js (versión 24 LTS)
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

# Tailscale (acceso remoto)
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
# → Abrir la URL que aparece en el navegador para autorizar el dispositivo
```

---

## 4. Estructura del proyecto

```
/home/riego/nuevo-riego/
├── Api/                          ← Backend Python (FastAPI)
│   ├── main.py                   ← Punto de entrada, middlewares, arranque
│   ├── gpio_manager.py           ← Control de pines GPIO (lgpio)
│   ├── scheduler.py              ← Cron jobs y temporizadores
│   ├── requirements.txt          ← Dependencias Python
│   ├── start.sh                  ← Script de arranque manual
│   ├── .env                      ← Variables de entorno (NO en git)
│   ├── .env.example              ← Plantilla de variables
│   ├── config/
│   │   └── database.py           ← Conexión SQLite, init_db, tablas
│   ├── routers/
│   │   ├── sectors.py            ← CRUD sectores + toggle + timer
│   │   ├── watering.py           ← Estado riego, pausa, reanuda, manual
│   │   ├── tank.py               ← Nivel del depósito
│   │   └── schedule.py           ← Programa semanal + config por sector
│   └── venv/                     ← Entorno virtual Python (no en git)
├── database/
│   ├── riego.db                  ← Base de datos SQLite (no en git)
│   └── schema.sql                ← Schema de referencia (MySQL, histórico)
├── front/                        ← Frontend web React + TypeScript + Vite
│   ├── src/
│   │   ├── Home/                 ← Pantalla principal (estado, tanque, semana)
│   │   ├── Schedule/             ← Pantalla programa semanal
│   │   └── SectorConfig/         ← Pantalla configuración de sector
│   ├── package.json
│   └── vite.config.ts
└── mobile/                       ← App móvil React Native + Expo
    ├── app/
    │   ├── _layout.tsx           ← Navegación (Stack)
    │   ├── index.tsx             ← Pantalla Home
    │   ├── schedule.tsx          ← Pantalla Programa
    │   └── sector/[id].tsx       ← Pantalla Config Sector
    ├── src/
    │   ├── Home/                 ← Componentes y estado Home
    │   ├── Schedule/             ← Componentes y estado Schedule
    │   ├── SectorConfig/         ← Componentes y estado SectorConfig
    │   ├── config/api.ts         ← URL base de la API
    │   └── theme/colors.ts       ← Colores de la app
    └── package.json
```

---

## 5. Base de datos SQLite

**Ruta:** `/home/riego/nuevo-riego/database/riego.db`
**Motor:** SQLite 3 con WAL mode (mejor rendimiento en escrituras concurrentes)

### Tablas

#### `sectors` — Sectores de riego
```sql
CREATE TABLE sectors (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT NOT NULL,           -- Ej: "Sector 1: Aguacates"
    icon     TEXT NOT NULL DEFAULT 'yard',  -- Material Icons
    is_active INTEGER NOT NULL DEFAULT 0,  -- 1=regando ahora
    is_auto   INTEGER NOT NULL DEFAULT 1,  -- 1=automático, 0=manual
    color    TEXT DEFAULT 'primary'        -- 'primary' o 'secondary'
);
```

#### `sector_config` — Configuración por sector
```sql
CREATE TABLE sector_config (
    id           INTEGER PRIMARY KEY,  -- mismo id que sectors
    start_time   TEXT NOT NULL DEFAULT '06:00',  -- hora de inicio HH:MM
    duration     INTEGER NOT NULL DEFAULT 30,     -- minutos de riego
    repeat_cycle INTEGER NOT NULL DEFAULT 0,      -- 1=ciclo repetido
    FOREIGN KEY (id) REFERENCES sectors(id) ON DELETE CASCADE
);
```

#### `sector_days` — Días activos por sector
```sql
CREATE TABLE sector_days (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    sector_id  INTEGER NOT NULL,
    day_code   TEXT NOT NULL,    -- L, M, X, J, V, S, D
    day_label  TEXT NOT NULL,    -- Lunes, Martes...
    active     INTEGER NOT NULL DEFAULT 0,  -- 1=activo ese día
    UNIQUE(sector_id, day_code),
    FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE
);
```

#### `tank_status` — Nivel del depósito
```sql
CREATE TABLE tank_status (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    level INTEGER NOT NULL DEFAULT 75  -- 0-100 (porcentaje)
);
```

#### `watering_status` — Estado general de riego (legacy)
```sql
CREATE TABLE watering_status (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    is_watering    INTEGER NOT NULL DEFAULT 0,
    time_remaining TEXT DEFAULT '00:00'
);
```

#### `weekly_schedule` — Resumen semanal (calculado dinámicamente)
```sql
CREATE TABLE weekly_schedule (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    day_code     TEXT NOT NULL UNIQUE,
    day_label    TEXT NOT NULL,
    has_watering INTEGER NOT NULL DEFAULT 0
);
```

### Datos iniciales (4 sectores de ejemplo)
```
Sector 1: Aguacates  → GPIO 4  → L/M/J/V/S  → 06:30 → 45 min
Sector 2: Mangos     → GPIO 22 → L/J         → 07:00 → 30 min
Sector 3: Pencas     → GPIO 6  → todos       → 06:00 → 60 min
Sector 4: Pitayas    → GPIO 26 → L-S         → 18:00 → 20 min
```

---

## 6. API REST (FastAPI)

**Versión FastAPI:** <0.100 (compatible con Pydantic v1)
**Puerto:** 3000
**Documentación interactiva:** `http://IP:3000/docs`

### Dependencias Python (`requirements.txt`)
```
fastapi<0.100
uvicorn[standard]
python-dotenv
pydantic<2.0
lgpio
apscheduler==3.10.4
```

### Instalación del entorno virtual
```bash
cd /home/riego/nuevo-riego/Api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Arquitectura de la API

```
main.py
  ├── Middleware API Key      → valida X-API-Key en todas las rutas (excepto / y /health)
  │   └── Excepción: peticiones desde 127.0.0.1 pasan sin key (para el frontend local)
  ├── CORS habilitado para *  → permite peticiones desde cualquier origen
  ├── startup_event           → init_db → init_gpio → sync_gpio_from_db → start_scheduler
  └── shutdown_event          → stop_scheduler → cleanup_gpio
```

---

## 7. GPIO — Control de relés

**Librería:** `lgpio` (reemplaza a RPi.GPIO en Raspberry Pi OS moderno)
**Modo:** `active_low=False` por defecto (relé activa en HIGH)

### Lógica de control

```python
# Activar sector (encender relé)
set_relay(sector_id=1, active=True)   # GPIO 4 → HIGH

# Desactivar sector (apagar relé)  
set_relay(sector_id=1, active=False)  # GPIO 4 → LOW
```

### Modo simulación
Si `lgpio` no está disponible (p.ej. desarrollo en Mac/PC), el sistema entra en **modo simulación** automáticamente: imprime los cambios por consola pero no falla. Permite desarrollar sin hardware.

### Sincronización al arrancar
Al iniciar la API, `sync_gpio_from_db()` lee el estado `is_active` de cada sector en la BD y pone los pines en el estado correcto. Esto evita desincronías si la Pi se reinicia mientras un sector estaba regando.

---

## 8. Scheduler — Automatización y temporizadores

**Librería:** APScheduler 3.10.4 (`AsyncIOScheduler`)
**Sin cron del sistema** — todo se gestiona internamente en el proceso Python.

### Jobs en ejecución

#### Job 1: `auto_start_check` — Comprueba cada minuto
```
Trigger: cron, minute='*' (cada minuto)
Función: _check_auto_start()
```
**Lógica:**
1. Obtiene hora actual en formato `HH:MM` y día de la semana (`L/M/X/J/V/S/D`)
2. Consulta sectores donde:
   - `is_auto = 1` (modo automático)
   - `start_time = hora_actual`
   - `sector_days.active = 1` para el día actual
   - `is_active = 0` (no está ya regando)
3. Para cada sector encontrado:
   - Activa el relé físico
   - Actualiza `is_active = 1` en la BD
   - Programa el **Job 2** para parar automáticamente

#### Job 2: `stop_sector_{id}` — Parada programada (uno por sector)
```
Trigger: date (fecha/hora exacta)
Función: _stop_sector_job(sector_id)
```
Se crea dinámicamente al activar un sector (automático o manual).
Apaga el relé y actualiza `is_active = 0` en la BD cuando llega el tiempo.

### Consultar tiempo restante de un sector
```bash
GET /api/sectors/{id}/timer
# Respuesta:
{
  "scheduled": true,
  "runsAt": "07:45:00",
  "remainingMinutes": 12,
  "remainingSeconds": 45
}
```

---

## 9. Frontend Web (React + Vite)

**Tecnologías:** React 19, TypeScript, Vite 7, React Router v7, Jotai (estado global)
**Puerto:** 5173
**Acceso:** `http://100.125.188.123:5173` (Tailscale) o `http://192.168.1.103:5173` (LAN)

### Pantallas

| Pantalla | Ruta | Descripción |
|---|---|---|
| Home | `/` | Estado general, nivel tanque, programa semanal, estado sectores |
| Programa | `/schedule` | Vista semanal de todos los sectores |
| Config Sector | `/sector/:id` | Configurar hora, duración, días, modo auto/manual |

### Estado global (Jotai atoms)
Cada módulo tiene su propio archivo `.state.ts` con atoms de Jotai para gestionar el estado sin prop drilling.

### Cómo arrancar en producción (modo permanente)
```bash
cd /home/riego/nuevo-riego/front
npm install
npm run dev -- --host 0.0.0.0
```
> Para que arranque automáticamente al boot, crear un servicio systemd similar al de la API (ver sección 12).

---

## 10. App Móvil (React Native + Expo)

**Framework:** Expo SDK 54, React Native
**Navegación:** Expo Router (file-based routing)
**Estado:** hooks locales (useState/useEffect)

### Pantallas

| Archivo | Descripción |
|---|---|
| `app/index.tsx` | Home — estado sectores, tanque, programa semanal |
| `app/schedule.tsx` | Programa semanal detallado |
| `app/sector/[id].tsx` | Configuración individual de sector |

### URL de la API (`src/config/api.ts`)
```typescript
export const API_BASE_URL = 'http://100.125.188.123:3000';
export const API_KEY = 'TU_API_KEY';
```
> **Atención:** Para producción fuera de la red local, usar la IP de Tailscale (`100.125.188.123`).
> Para uso solo en LAN, usar `192.168.1.103`.

### Cómo ejecutar la app
```bash
cd /home/riego/nuevo-riego/mobile  # o en tu Mac
npm install
npx expo start
# → Escanear QR con Expo Go (iOS/Android)
```

### Dependencias clave
```json
"expo": "~54.x",
"expo-router": "~4.x",
"react-native": "0.76.x",
"@expo/vector-icons": "^14.x"
```

---

## 11. Seguridad — API Key

Todas las peticiones externas (no desde `127.0.0.1`) requieren una API Key.

### Configurar la API Key
```bash
# En /home/riego/nuevo-riego/Api/.env
API_KEY=tu_clave_secreta_aqui
```

### Cómo enviar la API Key en las peticiones
```bash
# Header HTTP
curl -H "X-API-Key: tu_clave" http://100.125.188.123:3000/api/sectors

# O como parámetro en la URL
curl http://100.125.188.123:3000/api/sectors?api_key=tu_clave
```

### Rutas públicas (sin API Key)
- `GET /` — info de la API
- `GET /health` — health check
- `GET /docs` — documentación Swagger
- `GET /openapi.json`
- `GET /redoc`

---

## 12. Servicio systemd (arranque automático)

El servicio `riego-api` arranca automáticamente al encender la Raspberry Pi.

**Archivo:** `/etc/systemd/system/riego-api.service`

```ini
[Unit]
Description=Sistema de Riego API (FastAPI + GPIO)
After=network.target

[Service]
Type=simple
User=riego
Group=gpio
WorkingDirectory=/home/riego/nuevo-riego/Api
Environment=PATH=/home/riego/nuevo-riego/Api/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ExecStart=/home/riego/nuevo-riego/Api/venv/bin/uvicorn main:app --host 0.0.0.0 --port 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Comandos de gestión
```bash
sudo systemctl start riego-api      # Arrancar
sudo systemctl stop riego-api       # Parar
sudo systemctl restart riego-api    # Reiniciar
sudo systemctl status riego-api     # Ver estado
sudo journalctl -u riego-api -f     # Ver logs en tiempo real
sudo journalctl -u riego-api -n 100 # Últimas 100 líneas de log
```

### Crear el servicio en una nueva Pi
```bash
sudo nano /etc/systemd/system/riego-api.service
# → pegar el contenido de arriba

sudo systemctl daemon-reload
sudo systemctl enable riego-api    # Arrancar en boot
sudo systemctl start riego-api
```

---

## 13. Acceso remoto con Tailscale

Tailscale crea una VPN mesh privada. Cada dispositivo tiene una IP fija tipo `100.x.x.x`.

### IPs Tailscale actuales
| Dispositivo | IP Tailscale | Sistema |
|---|---|---|
| raspberrypi (servidor) | `100.125.188.123` | Linux (Raspberry Pi) |
| MacBook Air de Jorge | `100.66.40.59` | macOS |

### Instalar Tailscale en nueva Pi
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
# → Copiar la URL que aparece y abrirla en el navegador para autorizar
```

### Instalar Tailscale en iPhone/Android
1. Descargar **Tailscale** desde App Store o Google Play
2. Iniciar sesión con la misma cuenta (Google/GitHub)
3. Activar la VPN
4. La Pi aparecerá automáticamente como `raspberrypi (100.125.188.123)`

### Acceso desde fuera de casa
```bash
# SSH
ssh riego@100.125.188.123

# API
curl http://100.125.188.123:3000/api/sectors

# Frontend web
http://100.125.188.123:5173
```

---

## 14. Puertos y conexiones

| Puerto | Servicio | Acceso | Descripción |
|---|---|---|---|
| `22` | SSH | LAN + Tailscale | Administración remota |
| `3000` | FastAPI | LAN + Tailscale | API REST del sistema |
| `5173` | Vite (React) | LAN + Tailscale | Frontend web |

> **No hay port forwarding al router** — el acceso externo es **exclusivamente via Tailscale**.
> Esto es más seguro que abrir puertos públicos.

---

## 15. Guía de instalación desde cero

### Paso 1 — Preparar la Raspberry Pi
```bash
# Flash Raspberry Pi OS 64-bit (Debian Trixie) en la SD
# Habilitar SSH en el flasheador (Raspberry Pi Imager)
# Configurar WiFi si no hay cable ethernet
# Primer arranque y login:
ssh pi@192.168.1.xxx   # IP asignada por el router
```

### Paso 2 — Crear usuario y clonar el repo
```bash
sudo adduser riego
sudo usermod -aG gpio riego
sudo su - riego

git clone https://github.com/jorge0102/nuevo-riego.git
cd nuevo-riego
```

### Paso 3 — Instalar dependencias Python
```bash
sudo apt install -y python3-venv python3-lgpio
cd Api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Paso 4 — Configurar variables de entorno
```bash
cp .env.example .env
nano .env
```
Contenido del `.env`:
```env
DB_PATH=/home/riego/nuevo-riego/database/riego.db
API_PORT=3000
API_KEY=pon_aqui_una_clave_segura
RELAY_GPIO_1=4
RELAY_GPIO_2=22
RELAY_GPIO_3=6
RELAY_GPIO_4=26
RELAY_ACTIVE_LOW=false
```

### Paso 5 — Crear el servicio systemd
```bash
sudo nano /etc/systemd/system/riego-api.service
# → pegar el contenido de la sección 12
sudo systemctl daemon-reload
sudo systemctl enable riego-api
sudo systemctl start riego-api
```

### Paso 6 — Instalar y arrancar el frontend
```bash
sudo apt install -y nodejs npm
cd /home/riego/nuevo-riego/front
npm install
npm run dev -- --host 0.0.0.0
```

### Paso 7 — Instalar Tailscale
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
# → Autorizar en el navegador
tailscale ip   # Anotar la IP asignada
```

### Paso 8 — Verificar que todo funciona
```bash
# API respondiendo
curl http://localhost:3000/health
# → {"status":"healthy"}

# Sectores
curl http://localhost:3000/api/sectors
# → {"sectors":[...]}

# Servicio activo
sudo systemctl status riego-api
```

---

## 16. Endpoints de la API

### Sectores
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/sectors` | Listar todos los sectores con estado y timer |
| `POST` | `/api/sectors/{id}/toggle` | Activar/desactivar sector `{"isActive": true}` |
| `POST` | `/api/sectors/{id}/mode` | Cambiar modo `{"isAuto": true}` |
| `GET` | `/api/sectors/{id}/timer` | Tiempo restante del sector |

### Configuración
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/sectors/{id}/config` | Obtener configuración completa del sector |
| `PUT` | `/api/sectors/{id}/config` | Guardar configuración (días, hora, duración) |

### Programa semanal
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/schedule/weekly` | Días con/sin riego (calculado desde sector_days) |

### Depósito
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/tank/level` | Nivel actual `{"level": 75}` |
| `PUT` | `/api/tank/level` | Actualizar nivel `{"level": 80}` |

### Estado de riego
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/watering/status` | Sector activo y tiempo restante |
| `POST` | `/api/watering/pause` | Pausar riego |
| `POST` | `/api/watering/resume` | Reanudar riego |
| `POST` | `/api/watering/manual` | Riego manual `{"duration": 30}` |

---

## 17. Variables de entorno

Archivo: `/home/riego/nuevo-riego/Api/.env`

| Variable | Por defecto | Descripción |
|---|---|---|
| `DB_PATH` | `/home/riego/nuevo-riego/database/riego.db` | Ruta a la BD SQLite |
| `API_PORT` | `3000` | Puerto de la API |
| `API_KEY` | `""` (sin seguridad) | Clave de acceso a la API |
| `RELAY_GPIO_1` | `4` | Pin GPIO sector 1 |
| `RELAY_GPIO_2` | `22` | Pin GPIO sector 2 |
| `RELAY_GPIO_3` | `6` | Pin GPIO sector 3 |
| `RELAY_GPIO_4` | `26` | Pin GPIO sector 4 |
| `RELAY_ACTIVE_LOW` | `false` | `true` si el módulo relé es activo en LOW |

---

## 18. Resolución de problemas

### La API no arranca
```bash
sudo journalctl -u riego-api -n 50
# Buscar errores de importación o permisos GPIO
```
**Causa frecuente:** el usuario `riego` no está en el grupo `gpio`.
```bash
sudo usermod -aG gpio riego
sudo reboot
```

### Los relés no responden
```bash
# Verificar que lgpio está instalado
python3 -c "import lgpio; print('OK')"

# Si falla:
sudo apt install -y python3-lgpio
# O via pip dentro del venv:
pip install lgpio
```

### El frontend web no carga desde fuera
- Verificar que Tailscale está activo: `tailscale status`
- El proceso Vite debe estar corriendo: `ps aux | grep vite`
- Arrancar si no está: `cd front && npm run dev -- --host 0.0.0.0`

### La app móvil se queda en spinner infinito
- La app está intentando conectar a una IP no accesible
- Verificar en `mobile/src/config/api.ts` que la URL sea la correcta
- En casa: usar `http://192.168.1.103:3000`
- Fuera de casa con Tailscale: usar `http://100.125.188.123:3000`

### Sector no se activa automáticamente
1. Verificar que el sector tiene `is_auto = 1` en la BD
2. Verificar que `sector_days.active = 1` para el día correspondiente
3. Verificar que `sector_config.start_time` coincide exactamente con la hora (HH:MM)
4. Ver logs del scheduler: `sudo journalctl -u riego-api -f`
   - Buscar `AUTO-START: Sector X`

### Ver el estado actual de la BD
```bash
sqlite3 /home/riego/nuevo-riego/database/riego.db
.tables
SELECT id, name, is_active, is_auto FROM sectors;
SELECT * FROM sector_config;
SELECT * FROM sector_days WHERE active=1;
.quit
```

---

*Documentación generada el 16 de marzo de 2026*
*Repositorio: https://github.com/jorge0102/nuevo-riego*
