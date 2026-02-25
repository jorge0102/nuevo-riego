# Sistema de Riego Automatizado — Documentación Completa

**Raspberry Pi + Keystudio 4CH Relay Shield**
**Última actualización:** Febrero 2026

---

## 1. Visión General

Sistema de riego automático para finca con 4 sectores (Aguacates, Mangos, Pencas, Pitayas). Controla electroválvulas de 24V a través de un relay shield sobre Raspberry Pi, con interfaz web en pantalla local y API REST accesible desde la red local.

```
┌─────────────────────────────────────────────────────────────┐
│                     Raspberry Pi 4B                         │
│                                                             │
│  ┌──────────────┐    ┌──────────────────────────────────┐  │
│  │  Chromium    │    │   FastAPI (Puerto 3000)           │  │
│  │  Kiosk       │───▶│   + SQLite DB                    │  │
│  │  localhost   │    │   + GPIO via lgpio                │  │
│  │  :5173       │    └──────────────┬───────────────────┘  │
│  └──────────────┘                   │                       │
│                                     │ GPIO BCM              │
└─────────────────────────────────────┼───────────────────────┘
                                      │
                         ┌────────────▼────────────────┐
                         │  Keystudio 4CH Relay Shield  │
                         │                              │
                         │  CH1 (GPIO 26) → EV Sector1 │
                         │  CH2 (GPIO 20) → EV Sector2 │
                         │  CH3 (GPIO 21) → [Sector 3  │
                         │                   sin EV]    │
                         │  CH4 (GPIO 19) → EV Sector4 │
                         └────────────┬────────────────┘
                                      │ 24V AC/DC
                         ┌────────────▼────────────────┐
                         │    Módulo 24V               │
                         │                             │
                         │  ⚡ EV1 — Aguacates         │
                         │  ⚡ EV2 — Mangos            │
                         │  ⚡ EV3 — Pitayas           │
                         │  🔵 Sonda nivel estanque    │
                         └─────────────────────────────┘
```

---

## 2. Hardware

### Raspberry Pi 4B
- OS: Raspberry Pi OS Bookworm (Debian 13 Trixie)
- Usuario: `riego`
- IP local: `192.168.0.19`
- Display: pantalla HDMI con Chromium en modo kiosk

### Keystudio RPI 4 Channel Relay Shield
- HAT sobre el Pi (GPIO directo)
- Relays opto-aislados, **activos en LOW** (GPIO LOW = relay ON = válvula ABIERTA)
- Tensión de carga: 24V

### Mapeado GPIO → Relay → Dispositivo

| Canal Relay | Pin GPIO (BCM) | Dispositivo actual | Estado |
|-------------|---------------|-------------------|--------|
| CH1 | GPIO 26 | Electroválvula Sector 1 (Aguacates) | ✅ Operativa |
| CH2 | GPIO 20 | Electroválvula Sector 2 (Mangos) | ✅ Operativa |
| CH3 | GPIO 21 | Sector 3 (Pencas) | ⚠️ Sin electroválvula aún |
| CH4 | GPIO 19 | Electroválvula Sector 4 (Pitayas) | ✅ Operativa |

### Lógica del Relay (activo en LOW)

```
GPIO LOW  (0) → Relay energizado → Electroválvula ABIERTA → Riego activo
GPIO HIGH (1) → Relay en reposo  → Electroválvula CERRADA → Riego parado
```

### Sonda de nivel del estanque ⚠️ PENDIENTE DE INTEGRAR

La sonda sumergida de 24V requiere:
1. **Alimentación**: un relay del shield (o fuente directa) para darle los 24V
2. **Lectura**: la señal de salida de la sonda (24V cuando hay agua) debe
   reducirse a 3.3V mediante **divisor de tensión** antes de llegar a un GPIO INPUT del Pi.

```
Sonda ──── 24V (relay alimentación)
      └─── Señal ──[R1=10kΩ]──┬── GPIO_INPUT (Pi)
                               │
                             [R2=2.2kΩ]
                               │
                              GND

Voltaje en GPIO = 24V × (2200 / 12200) ≈ 3.3V ✅
```

**GPIO recomendado para lectura de sonda:** GPIO 17 (pin 11) — configurable en `.env`

Actualmente el nivel del tanque se actualiza **manualmente** via `PUT /api/tank/level`.

---

## 3. Estructura del Proyecto

```
/home/riego/nuevo-riego/
│
├── Api/                          # Backend Python (FastAPI)
│   ├── main.py                   # Entrada, middleware seguridad, startup
│   ├── gpio_manager.py           # Control GPIO / relays
│   ├── requirements.txt          # Dependencias Python
│   ├── .env                      # Variables de entorno (no en git)
│   ├── config/
│   │   ├── __init__.py
│   │   └── database.py           # SQLite: conexión, init_db()
│   └── routers/
│       ├── __init__.py
│       ├── sectors.py            # Sectores + control relay
│       ├── watering.py           # Estado de riego general
│       ├── tank.py               # Nivel del tanque
│       └── schedule.py          # Programación semanal y config sectores
│
├── front/                        # Frontend React (Vite)
│   ├── src/
│   │   ├── Home/
│   │   │   ├── home.state.ts     # Estado y llamadas API del Home
│   │   │   ├── home.module.ts    # Tipos e interfaces del Home
│   │   │   ├── home.mocks.ts     # Datos mock (useMock=false, no se usan)
│   │   │   └── components/
│   │   │       ├── actions-bar.component.tsx      # Botones pausa/inicio
│   │   │       ├── header.componet.tsx            # Cabecera
│   │   │       ├── main-status-card.component.tsx # Tarjeta estado principal
│   │   │       ├── tank-level-card.component.tsx  # Nivel del tanque
│   │   │       └── weekly-schedule.component.tsx  # Vista semanal
│   │   ├── Schedule/
│   │   │   ├── schedule.state.ts      # Estado y llamadas API del Schedule
│   │   │   ├── schedule.module.ts
│   │   │   ├── schedule.mocks.ts      # (no activo)
│   │   │   └── components/
│   │   │       ├── schedule-header.component.tsx
│   │   │       └── sector-card.component.tsx      # Tarjeta por sector
│   │   └── SectorConfig/
│   │       ├── sector-config.state.ts  # Estado y llamadas API de config
│   │       ├── sector-config.module.ts
│   │       ├── sector-config.mocks.ts  # (no activo)
│   │       └── components/
│   │           ├── config-header.component.tsx
│   │           ├── days-selector.component.tsx    # Selector de días
│   │           ├── mode-toggle.component.tsx      # Manual / Auto
│   │           ├── repeat-cycle.component.tsx     # Ciclo repetición
│   │           └── time-duration.component.tsx    # Hora inicio + duración
│   └── package.json              # React 19, Vite 7, Jotai, React Router 7
│
├── database/
│   ├── schema.sql                # Schema MySQL original (referencia)
│   └── riego.db                  # Base de datos SQLite activa
│
└── mobile/                       # App React Native (ignorar)
```

---

## 4. Servicios del Sistema

### 4.1 API Python — `riego-api.service`

```ini
# /etc/systemd/system/riego-api.service
WorkingDirectory = /home/riego/nuevo-riego/Api
ExecStart       = venv/bin/uvicorn main:app --host 0.0.0.0 --port 3000
User            = riego / Group = gpio
```

**Comandos:**
```bash
sudo systemctl status riego-api    # Estado
sudo systemctl restart riego-api   # Reiniciar
sudo journalctl -u riego-api -f    # Logs en tiempo real
```

**Al arrancar hace:**
1. `init_db()` — crea tablas SQLite si no existen, inserta datos iniciales
2. `test_connection()` — verifica que SQLite responde
3. `init_gpio()` — reclama los 4 pines GPIO como OUTPUT, los pone en OFF
4. `sync_gpio_from_db()` — lee la BD y sincroniza el estado físico de los relays

### 4.2 Frontend Vite — `pm2-riego.service`

```ini
# /etc/systemd/system/pm2-riego.service
WorkingDirectory = /home/riego/nuevo-riego/front
ExecStart       = npm run dev -- --host 0.0.0.0
After           = riego-api.service
```

**Comandos:**
```bash
sudo systemctl status pm2-riego    # Estado
sudo systemctl restart pm2-riego   # Reiniciar
```

### 4.3 Chromium Kiosk (autostart con el escritorio)

```bash
# /etc/xdg/openbox/autostart
chromium --kiosk --incognito --noerrdialogs \
  --disable-infobars http://localhost:5173
```

Se lanza automáticamente al iniciar sesión gráfica. Apunta a `localhost:5173`.

### 4.4 Firewall — nftables

Solo estos puertos están abiertos desde el exterior:

| Puerto | Protocolo | Servicio |
|--------|-----------|---------|
| 22 | TCP | SSH |
| 3000 | TCP | API REST (con API Key) |
| 5173 | TCP | Frontend Vite |

---

## 5. Base de Datos (SQLite)

**Ruta:** `/home/riego/nuevo-riego/database/riego.db`

### Tablas

#### `sectors`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | 1=Aguacates, 2=Mangos, 3=Pencas, 4=Pitayas |
| name | TEXT | Nombre del sector |
| icon | TEXT | Icono Material UI |
| is_active | INTEGER | 1=relay ON/válvula abierta, 0=cerrada |
| is_auto | INTEGER | 1=modo automático, 0=manual |
| color | TEXT | 'primary' o 'secondary' |

#### `sector_config`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK FK→sectors | ID del sector |
| start_time | TEXT | Hora inicio programado "HH:MM" |
| duration | INTEGER | Duración en minutos |
| repeat_cycle | INTEGER | 1=ciclo repetición activado |

#### `sector_days`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| sector_id | INTEGER FK | Sector al que pertenece |
| day_code | TEXT | L/M/X/J/V/S/D |
| day_label | TEXT | Lunes/Martes... |
| active | INTEGER | 1=activo ese día |

#### `tank_status`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| level | INTEGER | Nivel 0-100% (manual actualmente) |

#### `watering_status`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| is_watering | INTEGER | 1=regando, 0=parado |
| time_remaining | TEXT | Tiempo restante "HH:MM" |

#### `weekly_schedule`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| day_code | TEXT | L/M/X/J/V/S/D |
| has_watering | INTEGER | 1=hay riego programado ese día |

---

## 6. API REST — Referencia Completa

**Base URL:** `http://192.168.0.19:3000`
**Autenticación:** Header `X-API-Key: <clave>` (no requerido desde localhost)

### 6.1 Sistema

#### `GET /health`
Sin autenticación. Verifica que la API está viva.
```json
{ "status": "healthy" }
```

#### `GET /`
Sin autenticación. Info general.
```json
{ "message": "API de Riego funcionando", "version": "1.0.0" }
```

---

### 6.2 Sectores

#### `GET /api/sectors`
Devuelve los 4 sectores con su estado actual.
```json
{
  "sectors": [
    {
      "id": 1,
      "name": "Sector 1: Aguacates",
      "icon": "yard",
      "isActive": true,
      "isAuto": true,
      "color": "secondary"
    },
    ...
  ]
}
```
> `isActive: true` = relay ON = electroválvula ABIERTA = regando

#### `POST /api/sectors/{id}/toggle`
Activa o desactiva un sector. Controla el relay físico en tiempo real.

| id | Sector | GPIO | Relay |
|----|--------|------|-------|
| 1 | Aguacates | 26 | CH1 |
| 2 | Mangos | 20 | CH2 |
| 3 | Pencas | 21 | CH3 (sin EV) |
| 4 | Pitayas | 19 | CH4 |

**Body:**
```json
{ "isActive": true }
```
**Respuesta:**
```json
{ "success": true, "message": "Sector 1 activado" }
```

#### `POST /api/sectors/{id}/mode`
Cambia entre modo automático y manual.
```json
{ "isAuto": false }
```

---

### 6.3 Configuración de Sectores

#### `GET /api/sectors/{id}/config`
Devuelve la configuración completa de un sector.
```json
{
  "id": 1,
  "name": "Sector 1: Aguacates",
  "icon": "yard",
  "isAuto": true,
  "startTime": "06:30",
  "duration": 45,
  "repeatCycle": false,
  "days": [
    { "day": "L", "label": "Lunes",     "active": false },
    { "day": "M", "label": "Martes",    "active": true  },
    { "day": "X", "label": "Miercoles", "active": false },
    { "day": "J", "label": "Jueves",    "active": true  },
    { "day": "V", "label": "Viernes",   "active": false },
    { "day": "S", "label": "Sabado",    "active": true  },
    { "day": "D", "label": "Domingo",   "active": false }
  ]
}
```

#### `PUT /api/sectors/{id}/config`
Guarda la configuración de un sector. Mismo formato que el GET.

---

### 6.4 Programación Semanal

#### `GET /api/schedule/weekly`
Resumen de qué días hay riego programado.
```json
{
  "schedule": [
    { "day": "L", "hasWatering": false },
    { "day": "M", "hasWatering": true  },
    { "day": "X", "hasWatering": false },
    { "day": "J", "hasWatering": true  },
    { "day": "V", "hasWatering": false },
    { "day": "S", "hasWatering": true  },
    { "day": "D", "hasWatering": false }
  ]
}
```

---

### 6.5 Tanque

#### `GET /api/tank/level`
```json
{ "level": 75 }
```
> Valor 0-100. Actualmente se actualiza manualmente.
> **Pendiente:** leer de la sonda física.

#### `PUT /api/tank/level`
```json
{ "level": 80 }
```

---

### 6.6 Riego General

#### `GET /api/watering/status`
```json
{ "isWatering": false, "timeRemaining": "00:00" }
```

#### `POST /api/watering/pause`
Pausa el riego. Sin body.

#### `POST /api/watering/resume`
Reanuda el riego. Sin body.

#### `POST /api/watering/manual`
Inicia riego manual. `duration` en minutos.
```json
{ "duration": 30 }
```

---

## 7. Seguridad

### API Key
- Requerida en todas las llamadas desde fuera del Pi
- Header: `X-API-Key: JRGXfNm5bmFF4fD_VhPW22nCl0r09bNuhIBvfXCjSJc`
- Las llamadas desde `127.0.0.1` (el propio Pi/frontend) pasan sin clave
- Rutas públicas (sin key): `/`, `/health`, `/docs`, `/openapi.json`

### Firewall (nftables)
- Policy por defecto: DROP (todo bloqueado por defecto)
- Solo abiertos: SSH (22), API (3000), Frontend (5173)
- Config: `/etc/nftables.conf`

### Para cambiar la API Key
```bash
nano /home/riego/nuevo-riego/Api/.env
# Cambia API_KEY=...
sudo systemctl restart riego-api
```

---

## 8. Variables de Entorno — `.env`

**Ruta:** `/home/riego/nuevo-riego/Api/.env`

```env
# Base de datos
DB_PATH=/home/riego/nuevo-riego/database/riego.db

# Servidor
API_PORT=3000

# GPIO pines BCM (relay activo en LOW)
RELAY_GPIO_1=26    # CH1 → Electroválvula Sector 1 (Aguacates)
RELAY_GPIO_2=20    # CH2 → Electroválvula Sector 2 (Mangos)
RELAY_GPIO_3=21    # CH3 → Sector 3 Pencas (sin EV aún)
RELAY_GPIO_4=19    # CH4 → Electroválvula Sector 4 (Pitayas)
RELAY_ACTIVE_LOW=true

# Sonda nivel estanque (PENDIENTE)
# TANK_PROBE_GPIO=17      # GPIO INPUT para señal de la sonda
# TANK_PROBE_ENABLED=false

# Seguridad
API_KEY=JRGXfNm5bmFF4fD_VhPW22nCl0r09bNuhIBvfXCjSJc
```

---

## 9. Frontend — Módulos y Conexión con API

Todos los servicios tienen `useMock = false`. Toda la data viene de la API real en `http://localhost:3000/api`.

| Módulo | Archivo state | Endpoints que consume |
|--------|--------------|----------------------|
| Home | `Home/home.state.ts` | GET /watering/status, GET /tank/level, GET /schedule/weekly, POST /watering/pause\|resume\|manual |
| Schedule | `Schedule/schedule.state.ts` | GET /tank/level, GET /sectors, POST /sectors/{id}/toggle, POST /sectors/{id}/mode |
| SectorConfig | `SectorConfig/sector-config.state.ts` | GET /sectors/{id}/config, PUT /sectors/{id}/config |

### Cambiar URL de la API
En los tres archivos `.state.ts`, cambiar la URL si la IP del Pi cambia:
```typescript
// Home/home.state.ts (línea final)
export const homeService = new HomeService('http://localhost:3000/api', false);

// Schedule/schedule.state.ts
export const scheduleService = new ScheduleService('http://localhost:3000/api', false);

// SectorConfig/sector-config.state.ts
export const sectorConfigService = new SectorConfigService('http://localhost:3000/api', false);
```

---

## 10. Limitaciones Actuales y Pendientes

### ⚠️ CRÍTICO: Los sectores NO paran automáticamente

Cuando se activa un sector, el relay queda abierto indefinidamente.
El campo `duration` se guarda en la BD pero **ningún proceso lo ejecuta**.

**Para implementar el auto-stop** habría que añadir APScheduler a la API:
- Al activar un sector → programar una tarea para desactivarlo tras `duration` minutos
- Al desactivar manualmente → cancelar la tarea programada

### ⚠️ Sonda de nivel del estanque — no integrada
El nivel del tanque se actualiza manualmente vía API.
Cuando se conecte la sonda física necesita:
1. Divisor de tensión 24V → 3.3V
2. GPIO INPUT configurado en `.env` (`TANK_PROBE_GPIO`)
3. Nuevo endpoint o polling periódico para leer y actualizar la BD

### ⚠️ Sector 3 (Pencas) sin electroválvula
El relay CH3 (GPIO 21) está configurado pero no tiene carga conectada.
Cuando se instale la electroválvula, funcionará automáticamente sin cambios de código.

### ⚠️ Modo automático no implementado
El campo `is_auto` se guarda pero no hay scheduler que ejecute el riego
según el horario configurado (`start_time`, `duration`, `days`).
Requiere APScheduler + lógica de planificación.

---

## 11. Comandos Útiles

```bash
# Estado de todos los servicios
sudo systemctl status riego-api pm2-riego nftables

# Reiniciar todo
sudo systemctl restart riego-api pm2-riego

# Ver logs de la API en tiempo real
sudo journalctl -u riego-api -f

# Consultar BD directamente
python3 -c "
import sqlite3
conn = sqlite3.connect('/home/riego/nuevo-riego/database/riego.db')
conn.row_factory = sqlite3.Row
for r in conn.execute('SELECT * FROM sectors').fetchall():
    print(dict(r))
"

# Probar API desde el Pi
curl http://localhost:3000/api/sectors
curl http://localhost:3000/api/tank/level

# Probar API desde fuera (con API key)
curl -H "X-API-Key: JRGXfNm5bmFF4fD_VhPW22nCl0r09bNuhIBvfXCjSJc" \
     http://192.168.0.19:3000/api/sectors

# Ver estado GPIO (relays)
sudo journalctl -u riego-api --no-pager | grep GPIO
```

---

## 12. Dependencias y Versiones

### Backend (Python)
| Paquete | Versión | Uso |
|---------|---------|-----|
| fastapi | <0.100 | Framework API REST |
| uvicorn | latest | Servidor ASGI |
| pydantic | <2.0 | Validación de datos |
| python-dotenv | latest | Variables de entorno |
| lgpio | latest | Control GPIO |
| sqlite3 | built-in | Base de datos |

**Python:** 3.13
**Entorno virtual:** `/home/riego/nuevo-riego/Api/venv` (con `--system-site-packages`)

### Frontend (Node)
| Paquete | Versión | Uso |
|---------|---------|-----|
| react | 19.x | UI framework |
| react-router-dom | 7.x | Navegación |
| jotai | 2.x | Estado global |
| vite | 7.x | Build tool / dev server |
| typescript | 5.9 | Tipado |

**Node:** v24.11.1 (via nvm)
