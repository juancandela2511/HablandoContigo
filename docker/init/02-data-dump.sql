-- ============================================================================
-- CONFIGURACION INICIAL Y PREGUNTAS - HABLANDO CONTIGO
-- Fecha de generación: 2026-10-13T16:45:40.281Z
-- Compatible con: PostgreSQL 16+ con pgcrypto y uuid-ossp
-- ============================================================================

-- 1. TABLA: usuarios (1 registros)
INSERT INTO usuarios (id, nombre, email, password_hash, rol, departamento, avatar, foto_url, biografia, telefono, estado)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Juan Sebastián Candela', 'jscandela@ontime.es', '$2a$10$KJmUoEl3i0BO.2Wl8Q/ycub8bJbfexdKIanxlahZzbs3VI3WwRPfC', 'Super Administrador', 'Tecnología & Soporte TI', '', '', 'Administración y gestión integral de clima organizacional.', '', 'Activo')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- 2. TABLA: encuestas (1 registros)
INSERT INTO encuestas (id, titulo, descripcion, departamento, creado_por, fecha_creacion, estado, total_respuestas, alertas_registradas, puntaje_promedio)
VALUES ('enc-001', 'ENCUESTA DE CLIMA LABORAL Y DESARROLLO ORGANIZACIONAL — CONTIGO CALL CENTER', 'Nota de confidencialidad: Esta encuesta es 100% anónima. Su objetivo es identificar áreas de mejora y optimizar las condiciones de trabajo basándonos en tu opinión sincera.', 'Operaciones & Clima Laboral', 'Super Administrador', '15 Sep 2026', 'Activa', 0, 0, 0.0)
ON CONFLICT (id) DO UPDATE SET total_respuestas = EXCLUDED.total_respuestas, alertas_registradas = EXCLUDED.alertas_registradas, puntaje_promedio = EXCLUDED.puntaje_promedio;

-- 3. TABLA: alertas_config (3 registros)
INSERT INTO alertas_config (id, nombre, nivel, severidad, icono, color_hex, activa)
VALUES ('alt-1', 'Acoso o Conflicto Laboral', 1, 'Crítica', 'AlertTriangle', '#ef4444', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO alertas_config (id, nombre, nivel, severidad, icono, color_hex, activa)
VALUES ('alt-2', 'Sobrecarga y Burnout', 2, 'Alta', 'Zap', '#f97316', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO alertas_config (id, nombre, nivel, severidad, icono, color_hex, activa)
VALUES ('alt-3', 'Insatisfacción Salarial / Beneficios', 3, 'Moderada', 'TrendingDown', '#eab308', true)
ON CONFLICT (id) DO NOTHING;

-- 4. TABLA: preguntas (44 registros oficiales con opciones JSONB)
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b1-p1-antiguedad', 'enc-001', 1, 'bloque-1', 'Bloque 1: Datos de Contexto y Segmentación', 'Pregunta 1 — ¿Cuánto tiempo tienes laborando en la empresa?', 'multiple', '[{"id":"ant-1","texto":"Menos de 6 meses","valor":1,"esAlerta":false},{"id":"ant-2","texto":"De 6 meses a 1 año","valor":2,"esAlerta":false},{"id":"ant-3","texto":"De 1 a 3 años","valor":3,"esAlerta":false},{"id":"ant-4","texto":"Más de 3 años","valor":4,"esAlerta":false}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b1-p2-area', 'enc-001', 2, 'bloque-1', 'Bloque 1: Datos de Contexto y Segmentación', 'Pregunta 2 — ¿A qué departamento o área perteneces?', 'multiple', '[{"id":"area-1","texto":"Operaciones / Call Center","valor":1,"esAlerta":false},{"id":"area-2","texto":"Gestión Humana / RRHH","valor":2,"esAlerta":false},{"id":"area-3","texto":"Tecnología / IT","valor":3,"esAlerta":false},{"id":"area-4","texto":"Administrativo / Gerencia","valor":4,"esAlerta":false},{"id":"area-5","texto":"Otro","valor":5,"esAlerta":false}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b2-p3-gusto', 'enc-001', 3, 'bloque-2', 'Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo', 'Pregunta 3 — ¿Cómo te sientes en tu entorno y puesto de trabajo actual?', 'multiple', '[{"id":"b2p3-1","texto":"Muy a gusto y motivado/a","valor":5,"esAlerta":false},{"id":"b2p3-2","texto":"Satisfecho/a de manera regular","valor":3,"esAlerta":false},{"id":"b2p3-3","texto":"Poco a gusto / Indiferente","valor":2,"esAlerta":true},{"id":"b2p3-4","texto":"Nada a gusto / Incómodo/a","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b2-p4-estres', 'enc-001', 5, 'bloque-2', 'Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo', 'Pregunta 4 — ¿Sientes niveles de estrés elevados en tus labores diarias?', 'multiple', '[{"id":"b2p4-si","texto":"Sí","valor":1,"esAlerta":true,"nombreAlerta":"Estrés Severo y Agotamiento Crónico","tipoAlertaId":"tipo-depresion","severidadAlerta":"Crítica"},{"id":"b2p4-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b2p4-no","texto":"No","valor":5,"esAlerta":false}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b2-p5-fatiga', 'enc-001', 6, 'bloque-2', 'Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo', 'Pregunta 5 — ¿Sientes fatiga o cansancio físico/mental constante asociado a tu trabajo?', 'multiple', '[{"id":"b2p5-si","texto":"Sí","valor":1,"esAlerta":true,"nombreAlerta":"Estrés Severo y Agotamiento Crónico","tipoAlertaId":"tipo-depresion","severidadAlerta":"Crítica"},{"id":"b2p5-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b2p5-no","texto":"No","valor":5,"esAlerta":false}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b2-p6-herramientas', 'enc-001', 7, 'bloque-2', 'Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo', 'Pregunta 6 — ¿Consideras que las herramientas y equipos de trabajo son adecuados para desempeñar tu labor?', 'multiple', '[{"id":"b2p6-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b2p6-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b2p6-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b2-p7-condiciones-fisicas', 'enc-001', 8, 'bloque-2', 'Bloque 2: Bienestar Emocional, Estrés y Condiciones de Trabajo', 'Pregunta 7 — ¿Las condiciones físicas de tu puesto (silla, iluminación, ruido, temperatura) son cómodas y adecuadas?', 'multiple', '[{"id":"b2p7-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b2p7-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b2p7-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b3-p8-colaboracion', 'enc-001', 9, 'bloque-3', 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo', 'Pregunta 8 — ¿Existe una buena colaboración y disposición de ayuda mutua entre los integrantes de tu equipo?', 'multiple', '[{"id":"b3p8-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b3p8-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b3p8-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b3-p9-respeto', 'enc-001', 10, 'bloque-3', 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo', 'Pregunta 9 — ¿Sientes que en tu entorno de trabajo prevalece un ambiente libre de gritos, humillaciones o acoso?', 'multiple', '[{"id":"b3p9-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b3p9-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b3p9-no","texto":"No","valor":1,"esAlerta":true,"nombreAlerta":"Acoso Laboral y Hostigamiento","tipoAlertaId":"tipo-acoso","severidadAlerta":"Crítica"}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b3-p10-comunicacion', 'enc-001', 11, 'bloque-3', 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo', 'Pregunta 10 — ¿La comunicación entre tus compañeros de área es fluida, asertiva y respetuosa?', 'multiple', '[{"id":"b3p10-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b3p10-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b3p10-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b3-p11-clima-convivencia', 'enc-001', 12, 'bloque-3', 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo', 'Pregunta 11 — ¿Cómo calificarías la convivencia general e integración interpersonal en tu área?', 'multiple', '[{"id":"b3p11-1","texto":"Excelente (ambiente de apoyo y armonía)","valor":5,"esAlerta":false},{"id":"b3p11-2","texto":"Buena (relación cordial)","valor":4,"esAlerta":false},{"id":"b3p11-3","texto":"Regular (hay indiferencia o poca cooperación)","valor":2,"esAlerta":true},{"id":"b3p11-4","texto":"Mala (existen tensiones o fricciones frecuentes)","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b3-p12-conflictos', 'enc-001', 13, 'bloque-3', 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo', 'Pregunta 12 — ¿Has presenciado o experimentado situaciones de fricción o desacuerdos no resueltos en tu equipo?', 'multiple', '[{"id":"b3p12-no","texto":"No, ninguno","valor":5,"esAlerta":false},{"id":"b3p12-si","texto":"Sí","valor":1,"esAlerta":true,"nombreAlerta":"Conflictos Interpersonales","tipoAlertaId":"tipo-acoso","severidadAlerta":"Alta"}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b3-p12b-conflictos-detalle', 'enc-001', 14, 'bloque-3', 'Bloque 3: Convivencia, Compañerismo y Trabajo en Equipo', 'Pregunta 12b — Especifique de forma totalmente confidencial la situación de conflicto presenciada:', 'texto', '[]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b4-p13-instrucciones-claras', 'enc-001', 15, 'bloque-4', 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato', 'Pregunta 13 — ¿Tu jefe o líder inmediato proporciona instrucciones claras y comprensibles sobre tus funciones?', 'multiple', '[{"id":"b4p13-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b4p13-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b4p13-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b4-p14-instrucciones-estructuradas', 'enc-001', 16, 'bloque-4', 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato', 'Pregunta 14 — ¿Las metas y prioridades asignadas por tu jefe directo están bien organizadas y definidas?', 'multiple', '[{"id":"b4p14-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b4p14-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b4p14-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b4-p15-reconocimiento', 'enc-001', 17, 'bloque-4', 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato', 'Pregunta 15 — ¿Tu jefe inmediato reconoce públicamente o en privado tus aciertos y logros laborales?', 'multiple', '[{"id":"b4p15-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b4p15-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b4p15-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b4-p16-valoracion-esfuerzo', 'enc-001', 18, 'bloque-4', 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato', 'Pregunta 16 — ¿Sientes que el esfuerzo y dedicación que inviertes en tu trabajo es valorado por la supervisión?', 'multiple', '[{"id":"b4p16-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b4p16-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b4p16-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b4-p17-accesibilidad-dudas', 'enc-001', 19, 'bloque-4', 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato', 'Pregunta 17 — ¿Tu jefe directo es accesible y está disponible cuando requieres orientación o resolver dudas operativas?', 'multiple', '[{"id":"b4p17-1","texto":"Sí, es muy accesible y abierto/a","valor":5,"esAlerta":false},{"id":"b4p17-2","texto":"Más o menos / Depende del momento","valor":3,"esAlerta":false},{"id":"b4p17-3","texto":"No, resulta poco accesible o intimidante","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b4-p18-escucha-inquietudes', 'enc-001', 20, 'bloque-4', 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato', 'Pregunta 18 — ¿Tu jefe inmediato escucha con respeto e interés tus sugerencias o propuestas de mejora?', 'multiple', '[{"id":"b4p18-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b4p18-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b4p18-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b4-p19-confianza', 'enc-001', 21, 'bloque-4', 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato', 'Pregunta 19 — ¿Existe un ambiente de confianza recíproca entre tú y tu líder directo?', 'multiple', '[{"id":"b4p19-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b4p19-av","texto":"A veces","valor":3,"esAlerta":false},{"id":"b4p19-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b4-p20-feedback', 'enc-001', 22, 'bloque-4', 'Bloque 4: Liderazgo, Instrucciones y Feedback del Jefe Inmediato', 'Pregunta 20 — ¿Recibes retroalimentación periódica (feedback) orientada al desarrollo continuo y mejora en tu puesto?', 'multiple', '[{"id":"b4p20-1","texto":"Sí, de manera constante","valor":5,"esAlerta":false},{"id":"b4p20-2","texto":"Solo cuando hay errores","valor":2,"esAlerta":false},{"id":"b4p20-3","texto":"No, nunca recibo feedback","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b5-p21-capacitacion', 'enc-001', 23, 'bloque-5', 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana', 'Pregunta 21 — ¿La empresa te brinda capacitaciones útiles y actualizadas para realizar mejor tu trabajo?', 'multiple', '[{"id":"b5p21-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p21-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p21-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b5-p22-plan-carrera', 'enc-001', 24, 'bloque-5', 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana', 'Pregunta 22 — ¿Conoces las oportunidades y requisitos para crecer o ascender profesionalmente dentro de la organización?', 'multiple', '[{"id":"b5p22-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p22-av","texto":"Parcialmente","valor":3,"esAlerta":false},{"id":"b5p22-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b5-p23-beneficios', 'enc-001', 25, 'bloque-5', 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana', 'Pregunta 23 — ¿Consideras atractivos y convenientes los programas de bienestar y beneficios corporativos ofrecidos?', 'multiple', '[{"id":"b5p23-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p23-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p23-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b5-p24-compensaciones', 'enc-001', 26, 'bloque-5', 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana', 'Pregunta 24 — ¿Consideras satisfactorias las compensaciones económicas recibidas por tu trabajo?', 'multiple', '[{"id":"b5p24-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p24-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p24-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b5-p25-rrhh-respuesta', 'enc-001', 27, 'bloque-5', 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana', 'Pregunta 25 — ¿El área de Gestión Humana / RRHH brinda respuesta oportuna a tus solicitudes o inquietudes?', 'multiple', '[{"id":"b5p25-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p25-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p25-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b5-p26-procesos-agiles', 'enc-001', 28, 'bloque-5', 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana', 'Pregunta 26 — ¿Consideras que los procesos y trámites internos de la empresa son ágiles?', 'multiple', '[{"id":"b5p26-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p26-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p26-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b5-p27-procesos-claros', 'enc-001', 29, 'bloque-5', 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana', 'Pregunta 27 — ¿Los procedimientos e instructivos de la empresa son claros y comprensibles?', 'multiple', '[{"id":"b5p27-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p27-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p27-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b5-p28-equidad-tareas', 'enc-001', 30, 'bloque-5', 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana', 'Pregunta 28 — ¿Existe equidad en la asignación y distribución de tareas en tu área?', 'multiple', '[{"id":"b5p28-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p28-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p28-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b5-p29-equidad-oportunidades', 'enc-001', 31, 'bloque-5', 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana', 'Pregunta 29 — ¿Existe igualdad de oportunidades de desarrollo y crecimiento para todos en la empresa?', 'multiple', '[{"id":"b5p29-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p29-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p29-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b5-p30-equilibrio-vida', 'enc-001', 32, 'bloque-5', 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana', 'Pregunta 30 — ¿Consideras que la empresa se preocupa por el equilibrio entre la vida laboral y personal de sus empleados?', 'multiple', '[{"id":"b5p30-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p30-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p30-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b5-p31-comunicacion-interna', 'enc-001', 33, 'bloque-5', 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana', 'Pregunta 31 — ¿Los canales de comunicación interna de la compañía son efectivos?', 'multiple', '[{"id":"b5p31-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p31-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p31-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b5-p32-respaldo-organizacion', 'enc-001', 34, 'bloque-5', 'Bloque 5: Capacitación, Plan Carrera, Beneficios y Gestión Humana', 'Pregunta 32 — ¿Te sientes respaldado/a por la organización ante situaciones imprevistas o dificultades operativas?', 'multiple', '[{"id":"b5p32-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b5p32-av","texto":"Algunas veces","valor":3,"esAlerta":false},{"id":"b5p32-no","texto":"No","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b6-p33-estudia', 'enc-001', 35, 'bloque-6', 'Bloque 6: Nivel Académico, Estudios y Talento Humano', 'Pregunta 33 — ¿Te encuentras actualmente cursando algún estudio técnico, tecnológico, profesional o posgrado?', 'multiple', '[{"id":"b6p33-si","texto":"Sí","valor":5,"esAlerta":false},{"id":"b6p33-no","texto":"No (Pase directamente al Bloque 7)","valor":1,"esAlerta":false}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b6-p33b-que-estudia', 'enc-001', 36, 'bloque-6', 'Bloque 6: Nivel Académico, Estudios y Talento Humano', 'Pregunta 33b — Especifique qué área o programa de estudios se encuentra cursando actualmente:', 'texto', '[]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b6-p34-talento-aprovechado', 'enc-001', 37, 'bloque-6', 'Bloque 6: Nivel Académico, Estudios y Talento Humano', 'Pregunta 34 — ¿Consideras que tu nivel académico actual es aprovechado por la empresa?', 'multiple', '[{"id":"b6p34-1","texto":"Sí, totalmente aprovechados en mi rol o en proyecciones internas","valor":5,"esAlerta":false},{"id":"b6p34-2","texto":"Parcialmente (solo se usa una parte)","valor":3,"esAlerta":false},{"id":"b6p34-3","texto":"No, siento que mi perfil o nivel de estudios está subutilizado en mi puesto actual","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b7-p35-vision-2anos', 'enc-001', 38, 'bloque-7', 'Bloque 7: Proyección a Futuro y Visión en la Empresa', 'Pregunta 35 — ¿Cómo te visualizas a ti mismo/a y a tu crecimiento profesional dentro de la compañía en los próximos dos años?', 'texto', '[]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b7-p36-permanencia', 'enc-001', 39, 'bloque-7', 'Bloque 7: Proyección a Futuro y Visión en la Empresa', 'Pregunta 36 — ¿Te motiva permanecer y consolidar tu carrera a largo plazo en Contigo Call Center?', 'multiple', '[{"id":"b7p36-1","texto":"Sí, me motiva mucho crecer aquí si hay planes claros","valor":5,"esAlerta":false},{"id":"b7p36-2","texto":"Tengo dudas, depende de cómo evolucionen las condiciones, salarios y vacantes","valor":3,"esAlerta":false},{"id":"b7p36-3","texto":"No, no visualizo un crecimiento a largo plazo en la empresa","valor":1,"esAlerta":true}]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b8-p37-mejoras-infraestructura', 'enc-001', 40, 'bloque-8', 'Bloque 8: Propuestas de Mejora y Diagnóstico Abierto', 'Pregunta 37 — ¿Qué cambiarías o mejorarías de manera prioritaria en la infraestructura física y puestos de trabajo del Call Center?', 'texto', '[]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b8-p38-mejoras-procesos', 'enc-001', 41, 'bloque-8', 'Bloque 8: Propuestas de Mejora y Diagnóstico Abierto', 'Pregunta 38 — ¿Qué propuestas o cambios prioritarios implementarías en los procesos operativos del Call Center?', 'texto', '[]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b8-p39-sugerencias-direccion', 'enc-001', 42, 'bloque-8', 'Bloque 8: Propuestas de Mejora y Diagnóstico Abierto', 'Pregunta 39 — ¿Qué sugerencias le darías a la Alta Dirección para incrementar el bienestar y liderazgo organizacional?', 'texto', '[]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b8-p40-sugerencias-rrhh', 'enc-001', 43, 'bloque-8', 'Bloque 8: Propuestas de Mejora y Diagnóstico Abierto', 'Pregunta 40 — ¿Qué recomendaciones le darías a Gestión Humana / RRHH para incrementar el bienestar y la motivación general?', 'texto', '[]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;
INSERT INTO preguntas (id, id_encuesta, secuencia, bloque_id, categoria, texto, tipo, opciones, es_obligatoria)
VALUES ('b8-p41-comentarios-libres', 'enc-001', 44, 'bloque-8', 'Bloque 8: Propuestas de Mejora y Diagnóstico Abierto', 'Pregunta 41 — Escribe cualquier otro comentario, sugerencia o inquietud adicional que consideres relevante y no se haya mencionado en la encuesta:', 'texto', '[]'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET texto = EXCLUDED.texto, opciones = EXCLUDED.opciones, secuencia = EXCLUDED.secuencia;

