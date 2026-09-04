"""
============================================================================
SERVIDOR PRINCIPAL FASTAPI (Backend/main.py)
============================================================================

¿QUÉ ES Y QUÉ HACE?
Punto de entrada de la aplicación FastAPI.
- Configura los encabezados CORS para habilitar peticiones cross-origin desde Vite / Vue 3.
- Incluye el enrutador `/api/encuesta` proveniente de `Encuestas_Rutas.py`.
- Expone un endpoint de comprobación de salud (`GET /`).
- Ejecuta el servidor ASGI `uvicorn` en el puerto 8000.

¿PARA QUÉ SIRVE?
- Levantar el servidor web y despachar las solicitudes de red del frontend.

¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
- Encuestas_Rutas.py: Enrutador de la API REST.
- Uvicorn: Servidor ASGI para Python.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Rutas.Encuestas_Rutas import router as enrutador_encuestas

app = FastAPI(
    title="HablandoContigo API",
    description="Backend para generación de encuestas de clima laboral con IA y registro anónimo seguro con UUID",
    version="1.0.0"
)

# Configurar CORS para permitir comunicación fluida con Vue / Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir las rutas de encuestas
app.include_router(enrutador_encuestas)

@app.get("/")
def comprobacion_salud():
    """
    Endpoint básico de Health Check para verificar disponibilidad del backend
    """
    return {
        "status": "online",
        "service": "HablandoContigo API",
        "description": "Servidor de Clima Laboral y Encuestas Anónimas con IA"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
