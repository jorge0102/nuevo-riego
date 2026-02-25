from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

from config.database import test_connection
from routers import tank, watering, sectors, schedule

load_dotenv()

app = FastAPI(
    title="Riego API",
    description="API REST para sistema de riego automatizado",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(tank.router)
app.include_router(watering.router)
app.include_router(sectors.router)
app.include_router(schedule.router)

@app.on_event("startup")
async def startup_event():
    """Evento al iniciar la aplicación"""
    print("=" * 50)
    print("🚀 Iniciando API de Riego")
    print("=" * 50)
    test_connection()
    print("=" * 50)

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "API de Riego funcionando correctamente",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Endpoint de salud"""
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.getenv("API_PORT", 3000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
