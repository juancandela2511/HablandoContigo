"""
============================================================================
ENRUTADOR Y CONTROLADOR DE LA API DE ENCUESTAS (Encuestas_Rutas.py)
============================================================================

¿QUÉ ES Y QUÉ HACE?
Controlador FastAPI que expone los endpoints REST para:
- `POST /api/encuesta/generar`: Genera preguntas con IA a partir de un prompt.
- `POST /api/encuesta/guardar`: Almacena una encuesta creada por el administrador.
- `GET /api/encuesta/listar`: Retorna el catálogo de encuestas disponibles.
- `GET /api/encuesta/obtener/{id_encuesta}`: Retorna el contenido de una encuesta específica.
- `POST /api/encuesta/responder`: Registra respuestas anónimas con UUID.
- `GET /api/encuesta/respuestas/{id_encuesta}`: Lista las respuestas recolectadas.
- `GET /api/encuesta/estadisticas/avanzadas`: Retorna el dataset multidimensional de clima laboral.
- `GET /api/encuesta/buscar`: Motor de búsqueda y catálogo para el Spotlight global.

¿PARA QUÉ SIRVE?
- Servir de puente API entre la base de datos/servicios analíticos y el frontend en Vue 3.

¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
- Encuesta_Modelo.py: Validación de contratos Pydantic.
- Encuestas_Servicios.py: Ejecución de lógica de negocio y cálculo estadístico.
- main.py: Registrado con `app.include_router(router)`.
- Frontend (iaEncuestasService.ts, useEncuestas.ts, useEstadisticas.ts).
"""

from fastapi import APIRouter, HTTPException, Query
from Modelos.Encuesta_Modelo import (
    ContextoRequest, 
    EncuestaModelo, 
    RegistroRespuestaAnonima,
    RefinarEncuestaRequest,
    EvaluarRespuestasRequest
)
from Servicios.Encuestas_Servicios import (
    generar_preguntas_clima_laboral, 
    calcular_estadisticas_avanzadas,
    optimizar_encuesta_base,
    evaluar_respuestas_estricto_gemini
)
from typing import List, Dict, Any

router = APIRouter(prefix="/api/encuesta", tags=["Encuesta"])

# Base de datos en memoria para persistencia y demostración rápida
ENCUESTAS_DB: Dict[str, Any] = {}
RESPUESTAS_DB: List[Dict[str, Any]] = []
ALERTAS_GEMINI_DB: List[Dict[str, Any]] = []

@router.post("/generar")
def crear_encuesta_por_contexto(data: ContextoRequest):
    """
    Genera un set estructurado de preguntas de clima laboral a partir del prompt del usuario
    """
    try:
        resultado = generar_preguntas_clima_laboral(data.contexto)
        return {"success": True, "data": resultado}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimizar-base")
def refinar_encuesta_base_con_ia(data: RefinarEncuestaRequest):
    """
    MÓDULO 2: Optimiza una encuesta base redactada por el usuario garantizando neutralidad,
    cero sesgo, estructuración lógica y soporte de ramificación condicional.
    """
    try:
        resultado = optimizar_encuesta_base(data.encuesta_base, data.departamento or "General")
        return {"success": True, "data": resultado}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluar-alerta")
def evaluar_respuestas_colaborador(data: EvaluarRespuestasRequest):
    """
    MÓDULO 4: Motor de análisis estricto con Gemini (Criterio Cero Falsas Alarmas)
    """
    try:
        respuestas_dict = [r.model_dump() for r in data.respuestas]
        resultado = evaluar_respuestas_estricto_gemini(
            respuestas=respuestas_dict,
            id_encuesta=data.idEncuesta,
            titulo_encuesta=data.tituloEncuesta or "Encuesta",
            dispositivo_uuid=data.dispositivoUUID,
            departamento=data.departamento or "General"
        )
        if resultado.get("hayAlertas"):
            for al in resultado.get("alertas", []):
                ALERTAS_GEMINI_DB.append(al)
        return {"success": True, "data": resultado}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/guardar")
def guardar_encuesta(encuesta: EncuestaModelo):
    """
    Almacena una encuesta diseñada por el administrador
    """
    try:
        ENCUESTAS_DB[encuesta.id] = encuesta.model_dump()
        return {"success": True, "message": "Encuesta guardada con éxito", "id": encuesta.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/listar")
def listar_encuestas():
    """
    Lista todas las encuestas creadas en el sistema
    """
    return {"success": True, "encuestas": list(ENCUESTAS_DB.values())}

@router.get("/obtener/{id_encuesta}")
def obtener_encuesta(id_encuesta: str):
    """
    Obtiene los datos detallados de una encuesta por su identificador único
    """
    if id_encuesta in ENCUESTAS_DB:
        return {"success": True, "data": ENCUESTAS_DB[id_encuesta]}
    return {"success": False, "message": "Encuesta no encontrada en el backend"}

@router.post("/responder")
def registrar_respuesta_anonima(registro: RegistroRespuestaAnonima):
    """
    Almacena la respuesta anónima de un colaborador capturando su UUID de hardware
    y ejecuta la evaluación analítica estricta con Gemini.
    """
    try:
        # Evaluación analítica estricta con Gemini (Cero Falsas Alarmas)
        respuestas_dict = [r.model_dump() for r in registro.respuestas]
        analisis_gemini = evaluar_respuestas_estricto_gemini(
            respuestas=respuestas_dict,
            id_encuesta=registro.idEncuesta,
            titulo_encuesta=registro.tituloEncuesta or "Encuesta",
            dispositivo_uuid=registro.dispositivoUUID
        )
        
        alertas_activadas = analisis_gemini.get("alertas", [])
        if alertas_activadas:
            for al in alertas_activadas:
                ALERTAS_GEMINI_DB.append(al)
                registro.alertasDetectadas.append(al.get("tipoAlerta", "Alerta Crítica"))

        RESPUESTAS_DB.append(registro.model_dump())
        return {
            "success": True, 
            "message": "Respuesta anónima registrada exitosamente",
            "dispositivoUUID": registro.dispositivoUUID,
            "fecha": registro.fecha,
            "hora": registro.hora,
            "totalAlertas": len(registro.alertasDetectadas),
            "analisisGemini": analisis_gemini
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/respuestas/{id_encuesta}")
def listar_respuestas_encuesta(id_encuesta: str):
    """
    Retorna el historial de respuestas confidenciales recolectadas para una encuesta
    """
    filtradas = [r for r in RESPUESTAS_DB if r.get("idEncuesta") == id_encuesta]
    return {"success": True, "total": len(filtradas), "respuestas": filtradas}

@router.get("/estadisticas/avanzadas")
def obtener_estadisticas_completas():
    """
    Genera el dataset estadístico multidimensional (6 ejes radiales, matriz de calor, eNPS, comparativas)
    """
    try:
        estadisticas = calcular_estadisticas_avanzadas(RESPUESTAS_DB)
        return {"success": True, "data": estadisticas}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/buscar")
def buscar_elementos_globales(q: str = Query(..., min_length=1)):
    """
    Buscador global para Spotlight que indexa encuestas, áreas, alertas y métricas en tiempo real
    """
    termino = q.lower()
    resultados = []
    
    # 1. Buscar en catálogo de encuestas
    for enc_id, enc in ENCUESTAS_DB.items():
        if termino in enc.get("titulo", "").lower() or termino in enc.get("departamento", "").lower():
            resultados.append({
                "tipo": "encuesta",
                "titulo": enc.get("titulo"),
                "subtitulo": f"Departamento: {enc.get('departamento')}",
                "ruta": f"/proyectos",
                "idElemento": enc_id
            })

    # 2. Palabras clave de navegación rápida del sistema
    palabras_clave = [
        {"palabra": "acoso", "tipo": "alerta", "titulo": "Protocolo de Prevención de Acoso Laboral", "subtitulo": "Dashboard de Alertas de Convivencia", "ruta": "/dashboard", "idElemento": "seccion-alertas"},
        {"palabra": "dashboard", "tipo": "seccion", "titulo": "Dashboard Analítico & Estadísticas", "subtitulo": "Métricas Radiales y de Barras", "ruta": "/dashboard", "idElemento": "seccion-metricas"},
        {"palabra": "proyectos", "tipo": "seccion", "titulo": "Estudio de Proyectos con IA", "subtitulo": "Creación y publicación de encuestas", "ruta": "/proyectos", "idElemento": "seccion-proyectos"},
        {"palabra": "cuentas", "tipo": "seccion", "titulo": "Administrador de Cuentas", "subtitulo": "Gestión de roles y accesos", "ruta": "/admin/cuentas", "idElemento": "seccion-cuentas"},
        {"palabra": "perfil", "tipo": "seccion", "titulo": "Configuración de Perfil y Foto", "subtitulo": "Ajustes de cuenta de administrador", "ruta": "/configuracion", "idElemento": "seccion-perfil"}
    ]

    for k in palabras_clave:
        if termino in k["palabra"] or k["palabra"] in termino:
            resultados.append(k)

    return {"success": True, "total": len(resultados), "resultados": resultados}