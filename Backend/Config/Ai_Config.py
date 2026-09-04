"""
============================================================================
CONFIGURACIÓN DEL CLIENTE DE INTELIGENCIA ARTIFICIAL GEMINI (Ai_Config.py)
============================================================================

¿QUÉ ES Y QUÉ HACE?
Carga las variables de entorno desde el archivo `.env` e inicializa la instancia
oficial del SDK de Google GenAI (`google.genai.Client()`) para interactuar con
los modelos de lenguaje de última generación (Gemini 2.5 Flash / 3.8 Flash / Pro).

¿PARA QUÉ SIRVE?
- Centralizar la autenticación con la API Key oficial de Google Gemini.
- Permitir la reutilización del cliente `ai_client` en todos los servicios de análisis y generación.
"""

import os
from google import genai
from dotenv import load_dotenv

# Cargar variables de entorno del archivo .env
load_dotenv()

# Clave oficial provista para el proyecto
API_KEY_DEFAULT = "AQ.Ab8RN6JIp5P2hWrBa4a6ZmArr9y55L0g17dCKMPv7hZ8Y14Ebg"
gemini_api_key = os.getenv("GEMINI_API_KEY", API_KEY_DEFAULT)

try:
    ai_client = genai.Client(api_key=gemini_api_key)
except Exception as e:
    print(f"Advertencia inicializando Gemini Client: {e}")
    ai_client = None