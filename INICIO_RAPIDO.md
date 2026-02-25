# 🚀 Guía de Inicio Rápido

## ⚡ Instalación en 3 Pasos

### Paso 1: Configurar la Base de Datos MySQL

```bash
# Accede a MySQL
mysql -u root -p

# Ejecuta el script (desde la carpeta raíz del proyecto)
source database/schema.sql
# O si prefieres:
exit
mysql -u root -p < database/schema.sql
```

### Paso 2: Configurar y Ejecutar la API

```bash
# Ve a la carpeta Api
cd Api

# Ejecuta el script de inicio automático
./start.sh
```

El script automáticamente:
- ✅ Crea el entorno virtual si no existe
- ✅ Instala las dependencias
- ✅ Copia el archivo .env.example a .env
- ✅ Inicia la API

**IMPORTANTE**: Cuando el script te lo pida, edita el archivo `.env` con tus credenciales de MySQL:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_NAME=riego_db
DB_PORT=3306
API_PORT=3000
```

### Paso 3: Ejecutar el Frontend

```bash
# En otra terminal, ve a la carpeta front
cd front

# Instala dependencias (solo la primera vez)
npm install

# Inicia el frontend
npm run dev
```

## ✅ Verificar que Todo Funciona

1. **API**: Abre http://localhost:3000/docs - Deberías ver la documentación Swagger
2. **Frontend**: Abre http://localhost:5173 - Deberías ver la interfaz de riego
3. **Base de Datos**: Ejecuta `mysql -u root -p riego_db -e "SELECT * FROM sectors;"` - Deberías ver 4 sectores

## 🔗 Conectar Frontend con API

Por defecto, el frontend usa datos mock. Para usar la API real:

**Opción 1: Cambiar todos los servicios manualmente**

Edita estos archivos en `front/src/`:
- `Home/home.state.ts` línea 158
- `Schedule/schedule.state.ts` línea 119
- `SectorConfig/sector-config.state.ts` línea 62

Cambia `true` a `false` en:
```typescript
export const homeService = new HomeService('http://localhost:3000/api', false);
export const scheduleService = new ScheduleService('http://localhost:3000/api', false);
export const sectorConfigService = new SectorConfigService('http://localhost:3000/api', false);
```

**Opción 2: Usar la consola del navegador**

Abre la consola del navegador (F12) y ejecuta:
```javascript
homeService.setMockMode(false)
scheduleService.setMockMode(false)
sectorConfigService.setMockMode(false)
```

## 🎯 Endpoints Principales

Una vez que la API esté corriendo, puedes probar:

```bash
# Ver nivel del tanque
curl http://localhost:3000/api/tank/level

# Ver sectores
curl http://localhost:3000/api/sectors

# Ver estado del riego
curl http://localhost:3000/api/watering/status
```

## ❗ Problemas Comunes

### Error: "Can't connect to MySQL"
- Verifica que MySQL esté corriendo: `mysql --version`
- Revisa las credenciales en `Api/.env`

### Error: "Port 3000 already in use"
- Cambia el puerto en `Api/.env`: `API_PORT=3001`
- Actualiza la URL en los servicios del frontend

### Frontend muestra datos mock
- Cambia `useMock` a `false` en los servicios
- Verifica que la API esté corriendo
- Revisa la consola del navegador (F12)

## 📚 Próximos Pasos

1. Explora la documentación de la API: http://localhost:3000/docs
2. Revisa el README completo: `README.md`
3. Lee la documentación de la API: `Api/README.md`

## 🆘 Ayuda

Si tienes problemas, revisa:
- `README.md` - Documentación completa
- `Api/README.md` - Documentación de la API
- Logs de la API en la terminal
- Consola del navegador para errores del frontend
