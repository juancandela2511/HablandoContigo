"""
============================================================================
MODELOS DE DATOS PYDANTIC PARA ENCUESTAS Y CLIMA LABORAL (Encuesta_Modelo.py)
============================================================================

¿QUÉ ES Y QUÉ HACE?
Define los esquemas y contratos de datos fuertemente tipados utilizando Pydantic.
Modela:
- Solicitudes de generación contextual con IA (`ContextoRequest`).
- Opciones y preguntas adaptativas con detección de balizas de acoso (`PreguntaModelo`).
- Encuestas estructuradas (`EncuestaModelo`).
- Respuestas anónimas capturadas con UUID de hardware (`RegistroRespuestaAnonima`).
- Notificaciones de alerta e incidentes de acoso (`AlertaNotificacion`).
- Datos de visualización de barras y radiales (`EstadisticasBarrasResponse`).

¿PARA QUÉ SIRVE?
- Validar las cargas útiles (payloads) entrantes y salientes de la API FastAPI.
- Garantizar la integridad de los reportes y evitar corrupción de datos.

¿CON QUÉ ESTÁ VINCULADO / CONECTADO?
- Encuestas_Rutas.py: Valida los endpoints de la API REST.
- Encuestas_Servicios.py: Instancia y procesa estos modelos.
- Frontend (useEncuestas.ts, useEstadisticas.ts, iaEncuestasService.ts):
  Estructura espejo de TypeScript.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ContextoRequest(BaseModel):
    """Payload de entrada para solicitar a Gemini la redacción de una encuesta"""
    contexto: str = Field(..., description="Prompt o necesidad en lenguaje natural del administrador")
    departamento: Optional[str] = Field("General", description="Área destino de la evaluación")
    nivel_profundidad: Optional[str] = Field("medio", description="Nivel de granularidad del cuestionario")

class OpcionRespuesta(BaseModel):
    """Opción individual dentro de una pregunta de selección o escala"""
    id: str
    texto: str
    valor: int = Field(..., ge=1, le=5, description="Valor ponderado en escala Likert (1 a 5)")
    esAlerta: Optional[bool] = Field(False, description="Indica si esta opción dispara un protocolo de alerta de acoso")

class PreguntaModelo(BaseModel):
    """Estructura atómica de una pregunta de clima o bienestar"""
    id: str
    categoria: str
    texto: str
    tipo: str = Field("escala", description="Tipo de input: 'escala', 'multiple', 'texto', 'si_no'")
    opciones: Optional[List[OpcionRespuesta]] = []
    esRelleno: Optional[bool] = Field(False, description="Se descarta si la satisfacción previa es alta")
    esSensibleAcoso: Optional[bool] = Field(False, description="Activa preguntas profundas de seguimiento ante bajas notas")
    preguntaSeguimientoId: Optional[str] = None
    condicionDisparo: Optional[Dict[str, Any]] = None

class EncuestaModelo(BaseModel):
    """Modelo completo de una campaña o proyecto de encuesta publicada"""
    id: str
    titulo: str
    descripcion: str
    departamento: str
    creadoPor: str
    fechaCreacion: str
    preguntas: List[PreguntaModelo]
    preguntasSeguimiento: Optional[List[PreguntaModelo]] = []
    estado: str = Field("Activa", description="Estado operativo: 'Activa', 'Cerrada', 'Borrador'")

class RespuestaDetalle(BaseModel):
    """Respuesta desglosada para una pregunta puntual"""
    idPregunta: str
    textoPregunta: str
    categoria: str
    respuesta: Any
    valor: Optional[int] = None
    esAlerta: Optional[bool] = False
    comentario: Optional[str] = None

class RegistroRespuestaAnonima(BaseModel):
    """Registro confidencial de una sesión de encuesta enviada por un colaborador"""
    idRespuesta: str
    idEncuesta: str
    tituloEncuesta: Optional[str] = "Encuesta de Clima Laboral"
    dispositivoUUID: str = Field(..., description="UUID anónimo único generado para el hardware")
    fecha: str
    hora: str
    respuestas: List[RespuestaDetalle]
    alertasDetectadas: List[str] = []
    puntajeGeneral: Optional[float] = 0.0

class AlertaNotificacion(BaseModel):
    """Notificación de incidente de acoso laboral, sobrecarga o riesgo psicosocial encasillada por IA"""
    id: str
    idEncuesta: str
    tituloEncuesta: str
    dispositivoUUID: str
    tipoAlerta: str = Field(..., description="'Mala Gestión de los Jefes', 'Acoso Laboral', etc.")
    departamento: str
    nivel: Optional[int] = Field(1, ge=1, le=4, description="Nivel de alerta (1: Crítica, 2: Alta, 3: Moderada, 4: Preventiva)")
    modo_enfoque: Optional[str] = Field("especifico", description="'especifico' ('Enfócate en...') o 'general' ('Pendiente de todo')")
    enfoque_detalle: Optional[str] = None
    severidad: str = Field(..., description="'Baja', 'Moderada', 'Alta', 'Crítica'")
    mensaje: str
    fecha: str
    hora: str
    estado: str = Field("Detectada", description="'Detectada', 'En Revisión', 'Atendida', 'Descartada'")
    detalleRespuesta: Optional[str] = None
    # Estructura obligatoria requerida por Gemini
    estadoAlerta: Optional[str] = Field("Activada", description="Estado de la Alerta: Activada")
    mensajeCapturado: Optional[str] = Field(None, description="Texto literal o selección exacta del usuario")
    clasificacion: Optional[str] = Field("Mala", description="'Buena' o 'Mala'")
    motivoDetallado: Optional[str] = Field(None, description="Explicación analítica redactada por Gemini")

class AlertaGeminiEstricta(BaseModel):
    """Estructura Obligatoria de Alerta generada por el motor analítico de Gemini"""
    id: Optional[str] = None
    estadoAlerta: str = Field("Activada", description="Estado de la Alerta (con indicador visual de prioridad)")
    mensajeCapturado: str = Field(..., description="El texto literal o la selección exacta del usuario que motivó el aviso")
    clasificacion: str = Field(..., description="Clasificación asignada: 'Buena' o 'Mala'")
    motivoDetallado: str = Field(..., description="Explicación analítica y redactada por Gemini donde especifica exactamente por qué se activó")
    prioridad: str = Field("Crítica", description="'Crítica', 'Alta', 'Moderada'")
    tipoAlerta: Optional[str] = "Alerta de Clima & Convivencia"
    idPregunta: Optional[str] = None
    categoria: Optional[str] = None

class RefinarEncuestaRequest(BaseModel):
    """Solicitud para que Gemini optimice y estructure una encuesta base redactada por el usuario"""
    encuesta_base: str = Field(..., description="Borrador o preguntas en lenguaje natural del usuario")
    departamento: Optional[str] = Field("General", description="Área destino de la encuesta")
    instrucciones_adicionales: Optional[str] = Field(None, description="Instrucciones adicionales de estilo o enfoque")

class EvaluarRespuestasRequest(BaseModel):
    """Solicitud de evaluación analítica estricta de respuestas finalizadas"""
    idEncuesta: str
    tituloEncuesta: Optional[str] = "Encuesta de Clima Laboral"
    dispositivoUUID: str
    departamento: Optional[str] = "General"
    respuestas: List[RespuestaDetalle]

class ItemBarraGrafica(BaseModel):
    """Elemento individual para renderizar gráficos de barras comparativas"""
    categoria: str
    puntaje: float
    porcentaje: int
    respuestas: int
    nivelAlerta: str = Field("Optimo", description="'Optimo', 'Atencion', 'Moderado', 'Riesgo'")

class EstadisticasBarrasResponse(BaseModel):
    """Respuesta agregada de métricas de barras y comparativas temporales"""
    dimensiones: List[ItemBarraGrafica]
    departamentos: List[ItemBarraGrafica]
    periodos: Dict[str, Any]

