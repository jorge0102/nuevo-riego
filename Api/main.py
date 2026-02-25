from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv

from config.database import test_connection, init_db
from gpio_manager import init_gpio, sync_gpio_from_db, cleanup_gpio
from scheduler import start_scheduler, stop_scheduler
from routers import tank, watering, sectors, schedule

load_dotenv()

API_KEY = os.getenv('API_KEY', '')
PUBLIC_PATHS = {'/', '/health', '/docs', '/openapi.json', '/redoc'}

app = FastAPI(
    title='Riego API',
    description='API REST para sistema de riego automatizado',
    version='1.0.0'
)

@app.middleware('http')
async def api_key_middleware(request: Request, call_next):
    client_host = request.client.host if request.client else ''
    if client_host in ('127.0.0.1', '::1'):
        return await call_next(request)
    if request.url.path in PUBLIC_PATHS:
        return await call_next(request)
    provided_key = (
        request.headers.get('X-API-Key') or
        request.query_params.get('api_key')
    )
    if not API_KEY or provided_key != API_KEY:
        return JSONResponse(
            status_code=401,
            content={'detail': 'API key invalida o ausente. Usa el header X-API-Key.'}
        )
    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*', 'X-API-Key'],
)

app.include_router(tank.router)
app.include_router(watering.router)
app.include_router(sectors.router)
app.include_router(schedule.router)

@app.on_event('startup')
async def startup_event():
    print('=' * 50)
    print('Iniciando API de Riego')
    print('=' * 50)
    init_db()
    test_connection()
    init_gpio()
    sync_gpio_from_db()
    start_scheduler()
    if API_KEY:
        print('Seguridad: API Key activa')
    print('=' * 50)

@app.on_event('shutdown')
async def shutdown_event():
    stop_scheduler()
    cleanup_gpio()

@app.get('/')
async def root():
    return {'message': 'API de Riego funcionando', 'version': '1.0.0', 'docs': '/docs'}

@app.get('/health')
async def health_check():
    return {'status': 'healthy'}

if __name__ == '__main__':
    port = int(os.getenv('API_PORT', 3000))
    uvicorn.run('main:app', host='0.0.0.0', port=port, reload=False)
