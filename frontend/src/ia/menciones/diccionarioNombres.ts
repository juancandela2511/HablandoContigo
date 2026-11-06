/**
 * ============================================================================
 * DICCIONARIO DE NOMBRES HUMANOS Y STOPWORDS (diccionarioNombres.ts)
 * ============================================================================
 * Define palabras excluidas (incluyendo nombres de empresa como Contigo, Ontime,
 * Call Center, ciudades, áreas y verbos) y el catálogo de nombres y apellidos reales.
 */

import { esOpcionMultipleCerrada } from './filtroComentariosReales'

export const STOPWORDS_NOMBRES = new Set([
  // Nombres de empresa, sedes, ciudades y áreas (nunca son personas)
  'contigo', 'ontime', 'call', 'center', 'callcenter', 'hablandocontigo', 'hablando',
  'colombia', 'bogota', 'bogotá', 'medellin', 'medellín', 'cali', 'barranquilla', 'españa', 'madrid',
  'fontibon', 'fontibón', 'chapinero', 'centro', 'norte', 'sur', 'occidente', 'oriente',
  'compañia', 'compañía', 'empresa', 'organizacion', 'organización', 'corporacion', 'corporación',
  'operaciones', 'tecnologia', 'tecnología', 'sistemas', 'data', 'datos', 'software', 'finanzas',
  'administracion', 'administración', 'comercial', 'ventas', 'mercadeo', 'marketing', 'soporte',
  'servicio', 'backoffice', 'inbound', 'outbound', 'cobranzas', 'calidad', 'auditoria', 'auditoría',
  'recursos', 'humanos', 'gestion', 'gestión', 'humana', 'rrhh', 'gerencia', 'direccion', 'dirección',
  // Pronombres, preposiciones y conectores
  'me', 'te', 'se', 'nos', 'os', 'le', 'les', 'lo', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'el', 'ella', 'ellos', 'ellas', 'yo', 'tu', 'tú', 'de', 'del', 'al', 'con', 'sin', 'por', 'para',
  'hacia', 'hasta', 'en', 'entre', 'sobre', 'tras', 'muy', 'poco', 'mucho', 'mas', 'más', 'menos',
  'tan', 'tanto', 'tanta', 'como', 'cómo', 'cuando', 'donde', 'dónde', 'porque', 'porqué', 'aunque',
  'pero', 'sino', 'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas', 'aquel', 'aquella',
  'todo', 'toda', 'todos', 'todas', 'nada', 'algo', 'alguien', 'nadie', 'cada', 'cualquier', 'mismo',
  'misma', 'otro', 'otra', 'otros', 'otras', 'varios', 'varias', 'algunos', 'algunas', 'muchos', 'muchas',
  // Cargos, términos laborales y verbos comunes
  'lider', 'líder', 'lideres', 'líderes', 'jefe', 'jefa', 'jefes', 'supervisor', 'supervisora',
  'supervisores', 'coordinador', 'coordinadora', 'gerente', 'director', 'directora', 'compañero',
  'compañera', 'compañeros', 'compañeras', 'persona', 'personas', 'gente', 'cliente', 'clientes',
  'campaña', 'campañas', 'operacion', 'operación', 'turno', 'turnos', 'horario', 'horarios',
  'salario', 'sueldo', 'pago', 'pagos', 'bono', 'bonos', 'comision', 'comisiones', 'contrato',
  'herramienta', 'herramientas', 'equipo', 'equipos', 'computador', 'pc', 'internet', 'diadema',
  'silla', 'sillas', 'oficina', 'sede', 'piso', 'baño', 'baños', 'aire', 'acondicionado', 'ruido',
  'descanso', 'pausa', 'pausas', 'almuerzo', 'tiempo', 'hora', 'horas', 'dia', 'día', 'dias', 'días',
  'semana', 'semanas', 'mes', 'meses', 'año', 'años', 'hoy', 'ayer', 'mañana', 'tarde', 'noche',
  'siempre', 'nunca', 'jamas', 'jamás', 'veces', 'frecuentemente', 'ocasionalmente', 'parcialmente',
  'totalmente', 'normal', 'regular', 'bien', 'bueno', 'buena', 'mal', 'malo', 'mala', 'excelente',
  'pesimo', 'pésimo', 'injusto', 'injusta', 'favoritismo', 'rosca', 'acoso', 'acosa', 'acosar',
  'molesta', 'molesto', 'molestar', 'molestias', 'grita', 'gritar', 'gritos', 'maltrato', 'maltrata',
  'humilla', 'insulta', 'ignora', 'amenaza', 'presiona', 'exige', 'habla', 'dice', 'hace', 'trabaja',
  'trabajo', 'estudio', 'estudios', 'pregunta', 'bloque', 'ambiente', 'clima', 'area', 'área', 'puesto',
  'cargo', 'problema', 'problemas', 'situacion', 'situación', 'condiciones', 'crecimiento', 'retos',
  'nuevos', 'asumiendo', 'ascendiendo', 'creciendo', 'dentro', 'proximos', 'próximos', 'dos', 'tres'
])

export const NOMBRES_COMUNES = new Set([
  // Nombres propios frecuentes
  'omar', 'daniel', 'carlos', 'juan', 'andres', 'andrés', 'camila', 'maria', 'maría', 'laura',
  'valentina', 'santiago', 'sebastian', 'sebastián', 'diego', 'alejandro', 'alejandra', 'paola',
  'carolina', 'julian', 'julián', 'jorge', 'luis', 'pedro', 'roberto', 'javier', 'fernando',
  'ricardo', 'miguel', 'david', 'cristian', 'christian', 'camilo', 'nicolas', 'nicolás', 'oscar', 'óscar',
  'mauricio', 'sergio', 'ivan', 'iván', 'hector', 'héctor', 'angie', 'natalia', 'diana', 'claudia',
  'patricia', 'sandra', 'monica', 'mónica', 'andrea', 'tatiana', 'karen', 'luisa', 'fernanda',
  'gabriela', 'daniela', 'sofia', 'sofía', 'catalina', 'esteban', 'felipe', 'mateo', 'samuel',
  'kevin', 'brayan', 'brian', 'bryan', 'steven', 'stiven', 'jhon', 'john', 'edwin', 'edward',
  'wilson', 'william', 'nelson', 'milton', 'fabian', 'fabián', 'gustavo', 'alvaro', 'álvaro',
  'arturo', 'cesar', 'césar', 'raul', 'raúl', 'hugo', 'manuel', 'antonio', 'francisco', 'jose', 'josé',
  'jesus', 'jesús', 'jaime', 'hernan', 'hernán', 'german', 'germán', 'ruben', 'rubén', 'dario', 'darío',
  'leonardo', 'jairo', 'ramiro', 'victor', 'víctor', 'henry', 'alex', 'alexander', 'jeison', 'yeison',
  'johan', 'johana', 'viviana', 'liliana', 'adriana', 'marcela', 'lina', 'juliana', 'manuela', 'mariana',
  'sara', 'valeria', 'isabella', 'lucia', 'lucía', 'elena', 'marta', 'martha', 'gloria', 'esperanza',
  'rocio', 'rocío', 'pilar', 'luz', 'alba', 'blanca', 'rosa', 'carmen', 'ana', 'lorena', 'milena',
  'ximena', 'jimena', 'jenny', 'yenny', 'jessica', 'yesica', 'cindy', 'wendy', 'kelly', 'leidy',
  'deisy', 'ingrid', 'astrid', 'heidy', 'erika', 'veronica', 'verónica', 'melissa', 'vanessa',
  'estefania', 'estefanía', 'gina', 'yuli', 'yuliana', 'zulma', 'sonia', 'olga', 'nancy', 'nubia',
  'armando', 'ernesto', 'gerardo', 'guillermo', 'humberto', 'ignacio', 'julio', 'marcos', 'mario',
  'martin', 'martín', 'nestor', 'néstor', 'orlando', 'pablo', 'rafael', 'ramon', 'ramón', 'rodolfo',
  'rodrigo', 'rolando', 'salvador', 'simon', 'simón', 'tomas', 'tomás', 'vicente', 'walter', 'wilmer',
  // Apellidos frecuentes
  'perez', 'pérez', 'gomez', 'gómez', 'rodriguez', 'rodríguez', 'martinez', 'martínez', 'garcia', 'garcía',
  'lopez', 'lópez', 'hernandez', 'hernández', 'gonzalez', 'gonzález', 'sanchez', 'sánchez', 'ramirez', 'ramírez',
  'torres', 'flores', 'florez', 'flórez', 'rivera', 'morales', 'ortiz', 'gutierrez', 'gutiérrez',
  'ramos', 'vargas', 'castillo', 'jimenez', 'jiménez', 'moreno', 'romero', 'herrera', 'medina',
  'aguilar', 'suarez', 'suárez', 'castro', 'mendoza', 'ruiz', 'diaz', 'díaz', 'alvarez', 'álvarez', 'rojas',
  'muñoz', 'munoz', 'pineda', 'ospina', 'restrepo', 'giraldo', 'montoya', 'salazar', 'cardona',
  'valencia', 'arias', 'cortes', 'cortés', 'parra', 'peña', 'quintero', 'zambrano', 'rincon', 'rincón',
  'trujillo', 'beltran', 'beltrán', 'vega', 'navarro', 'molina', 'delgado', 'cabrera', 'contreras',
  'fuentes', 'miranda', 'maldonado', 'cruz', 'guerrero', 'estrada', 'cardenas', 'cárdenas', 'candela',
  'acosta', 'aguirre', 'amaya', 'arango', 'arenas', 'avila', 'ávila', 'ayala', 'baquero', 'barrera',
  'barrios', 'becerra', 'bedoya', 'benitez', 'benítez', 'bermudez', 'bermúdez', 'bernal', 'betancur',
  'bonilla', 'botero', 'bravo', 'buitrago', 'burgos', 'bustamante', 'caicedo', 'calderon', 'calderón',
  'camacho', 'camargo', 'cano', 'carvajal', 'castellanos', 'ceballos', 'celis', 'chaparro', 'cifuentes',
  'correa', 'cuellar', 'cuéllar', 'davila', 'dávila', 'daza', 'duarte', 'duque', 'duran', 'durán',
  'escobar', 'espinosa', 'fajardo', 'fernandez', 'fernández', 'figueroa', 'fonseca', 'forero', 'franco',
  'galindo', 'gallego', 'galvis', 'gamboa', 'garzon', 'garzón', 'gil', 'granados', 'guevara', 'guzman',
  'guzmán', 'henao', 'holguin', 'holguín', 'hoyos', 'hurtado', 'ibarra', 'jaimes', 'jaramillo', 'lara',
  'leal', 'leon', 'león', 'loaiza', 'londoño', 'londono', 'lozano', 'lugo', 'luna', 'marin', 'marín',
  'marquez', 'márquez', 'mejia', 'mejía', 'melo', 'mena', 'mendez', 'méndez', 'mercado', 'mesa', 'meza',
  'mojica', 'moncada', 'monroy', 'monsalve', 'montenegro', 'montero', 'montes', 'mora', 'mosquera',
  'murcia', 'murillo', 'naranjo', 'navia', 'nieto', 'novoa', 'nuñez', 'ocampo', 'ochoa', 'ojeda',
  'olaya', 'orozco', 'ortega', 'osorio', 'ovalle', 'oviedo', 'pacheco', 'padilla', 'paez', 'páez',
  'palacios', 'palomino', 'pardo', 'paredes', 'patiño', 'pedraza', 'peralta', 'perdomo', 'pinilla',
  'pinto', 'pinzon', 'pinzón', 'ponce', 'porras', 'posada', 'poveda', 'prada', 'prieto', 'pulido',
  'quijano', 'quintana', 'quiroga', 'quiroz', 'rangel', 'reina', 'rendon', 'rendón', 'rey', 'reyes',
  'rico', 'rios', 'ríos', 'rivas', 'roa', 'robles', 'rocha', 'roldan', 'roldán', 'roman', 'román',
  'rosales', 'rosas', 'rubio', 'rueda', 'saavedra', 'salamanca', 'salas', 'salcedo', 'salgado',
  'salinas', 'sanabria', 'sandoval', 'santamaria', 'santamaría', 'santana', 'sarmiento', 'segura',
  'sepulveda', 'sepúlveda', 'serna', 'serrano', 'sierra', 'silva', 'solano', 'soler', 'sosa', 'soto',
  'tabares', 'tamayo', 'tejada', 'tellez', 'téllez', 'tobon', 'tobón', 'toledo', 'toro', 'tovar',
  'triana', 'ulloa', 'urbina', 'uribe', 'urrego', 'urrutia', 'valderrama', 'valdes', 'valdés',
  'valero', 'vanegas', 'varela', 'vasquez', 'vásquez', 'velasco', 'velasquez', 'velásquez', 'velez',
  'vélez', 'vera', 'vergara', 'villalba', 'villamizar', 'villegas', 'yepes', 'zamora', 'zapata', 'zuleta'
])

export function esNombreValidoPersona(palabra: string): boolean {
  if (!palabra) return false
  const limpio = palabra.toLowerCase().trim().replace(/[^a-záéíóúñ]/g, '')
  if (limpio.length < 3) return false
  if (STOPWORDS_NOMBRES.has(limpio)) return false
  if (esOpcionMultipleCerrada(limpio)) return false
  if (/(?:ando|iendo|yendo|cion|ción|sion|sión|miento|dad|tad|tud|mente)$/.test(limpio)) {
    return false
  }
  return true
}
