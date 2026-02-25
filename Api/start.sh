#!/bin/bash

echo "================================"
echo "🌱 Iniciando API de Riego"
echo "================================"
echo ""

# Verificar si existe el entorno virtual
if [ ! -d "venv" ]; then
    echo "⚠️  No se encontró entorno virtual"
    echo "📦 Creando entorno virtual..."
    python3 -m venv venv
    echo "✅ Entorno virtual creado"
    echo ""
fi

# Activar entorno virtual
echo "🔧 Activando entorno virtual..."
source venv/bin/activate

# Verificar si existen las dependencias
if [ ! -f "venv/bin/uvicorn" ]; then
    echo "📦 Instalando dependencias..."
    pip install -r requirements.txt
    echo "✅ Dependencias instaladas"
    echo ""
fi

# Verificar si existe .env
if [ ! -f ".env" ]; then
    echo "⚠️  No se encontró archivo .env"
    echo "📝 Copiando .env.example a .env"
    cp .env.example .env
    echo "⚠️  Por favor, edita el archivo .env con tus credenciales de MySQL"
    echo ""
    read -p "Presiona Enter después de configurar .env para continuar..."
fi

# Iniciar la API
echo "🚀 Iniciando API..."
echo "================================"
python main.py
