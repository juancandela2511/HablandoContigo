/**
 * ============================================================================
 * DATOS GEOGRÁFICOS Y POLÍGONOS CONTINENTALES (datosGeograficos.ts)
 * ============================================================================
 * Contiene los contornos de alta fidelidad para el trazado de continentes
 * y países clave (Colombia y España) en el globo terráqueo 3D.
 * ============================================================================
 */

import * as THREE from 'three'

/** Algoritmo de punto en polígono (Ray-casting) para delimitar costas reales */
export function puntoEnPoligono(x: number, y: number, poligono: number[][]): boolean {
  let dentro = false
  const n = poligono.length
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const ptI = poligono[i]
    const ptJ = poligono[j]
    if (!ptI || !ptJ) continue
    const xi = ptI[0] ?? 0
    const yi = ptI[1] ?? 0
    const xj = ptJ[0] ?? 0
    const yj = ptJ[1] ?? 0
    const intersecta = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
    if (intersecta) dentro = !dentro
  }
  return dentro
}

/** Polígono detallado de Colombia (lat -4.2 a 12.5, lon -79.0 a -66.8) */
export const POLIGONO_COLOMBIA: number[][] = [
  [-79.0, 1.5], [-77.5, 5.5], [-77.2, 8.5], [-76.8, 8.8], [-73.5, 11.8], [-71.5, 12.5],
  [-71.8, 10.5], [-72.5, 9.2], [-71.8, 6.0], [-67.5, 6.2], [-67.0, 1.8], [-69.8, -1.2],
  [-70.0, -4.2], [-75.0, -0.3], [-77.8, 0.8], [-79.0, 1.5]
]

/** Polígono detallado de España (Península Ibérica, lat 36.0 a 43.8, lon -9.5 a 3.35) */
export const POLIGONO_ESPANA: number[][] = [
  [-9.5, 42.0], [-9.3, 43.8], [-6.0, 43.8], [-2.0, 43.5], [-1.8, 43.4],
  [3.35, 42.4], [3.2, 41.9], [2.2, 41.3], [0.8, 40.7], [0.3, 39.9], [-0.2, 38.6],
  [-0.8, 37.6], [-2.2, 36.7], [-5.4, 36.0], [-6.4, 36.8], [-7.4, 37.2],
  [-9.0, 37.0], [-9.6, 38.8], [-9.0, 41.8], [-9.5, 42.0]
]

/** Polígonos de los demás continentes del mundo para contornos costeros auténticos */
export const POLIGONOS_CONTINENTES: number[][][] = [
  // 1. Sudamérica (Costas reales desde el Caribe hasta la Patagonia)
  [
    [-81, -5], [-79, 1.5], [-77, 8], [-73, 12], [-61, 10], [-50, 0], [-35, -5],
    [-35, -9], [-38, -13], [-41, -21], [-48, -28], [-53, -33], [-65, -43],
    [-67, -55], [-75, -53], [-74, -45], [-71, -30], [-76, -14], [-81, -5]
  ],
  // 2. Norteamérica & Centroamérica (Alaska, Canadá, EE.UU., México, Florida)
  [
    [-168, 65], [-140, 70], [-100, 70], [-80, 62], [-60, 50], [-66, 44], [-75, 35],
    [-80, 25], [-82, 30], [-88, 30], [-97, 26], [-97, 20], [-87, 13], [-77, 8],
    [-83, 10], [-90, 14], [-105, 20], [-110, 23], [-117, 32], [-124, 40],
    [-125, 49], [-130, 55], [-140, 60], [-168, 65]
  ],
  // 3. Europa (Francia, Italia, Alemania, Escandinavia, Reino Unido, Balcanes)
  [
    [-10, 36], [3, 36], [10, 37], [15, 38], [18, 40], [20, 38], [25, 35], [29, 41],
    [35, 45], [40, 50], [35, 60], [28, 71], [15, 70], [5, 62], [8, 55], [0, 49],
    [-5, 48], [-9, 43], [-10, 36]
  ],
  // 4. Islas Británicas
  [
    [-6, 50], [2, 51], [0, 58], [-5, 58], [-6, 50]
  ],
  // 5. África (Sáhara, Golfo de Guinea, Cuerno de África, Sudáfrica)
  [
    [-17, 32], [-5, 36], [10, 37], [25, 32], [32, 31], [35, 27], [43, 12], [51, 12],
    [45, 0], [40, -10], [35, -20], [32, -28], [28, -34], [18, -34], [12, -20],
    [10, -5], [8, 4], [-13, 9], [-17, 15], [-17, 32]
  ],
  // 6. Madagascar
  [
    [43, -12], [50, -15], [47, -25], [43, -25], [43, -12]
  ],
  // 7. Asia (Península Arábiga, India, Sudeste Asiático, China, Siberia)
  [
    [26, 40], [40, 38], [55, 25], [60, 23], [70, 20], [77, 8], [85, 20], [90, 22],
    [100, 10], [104, 1], [108, 14], [118, 22], [122, 30], [122, 37], [129, 35],
    [130, 42], [140, 50], [150, 60], [170, 66], [140, 72], [100, 75], [70, 70],
    [50, 55], [35, 45], [26, 40]
  ],
  // 8. Japón
  [
    [130, 32], [132, 34], [137, 35], [141, 39], [142, 44], [145, 43], [140, 36], [131, 31], [130, 32]
  ],
  // 9. Australia y Oceanía
  [
    [113, -22], [120, -15], [135, -12], [142, -10], [146, -18], [153, -28], [150, -37],
    [140, -38], [135, -34], [125, -34], [115, -34], [113, -22]
  ]
]

/** Convierte coordenadas esféricas (Lat, Lon en grados) a Vector3 cartesiano */
export function latLonAVector3(latDeg: number, lonDeg: number, radio: number): THREE.Vector3 {
  const latRad = (latDeg * Math.PI) / 180
  const lonRad = (lonDeg * Math.PI) / 180
  const x = radio * Math.cos(latRad) * Math.sin(lonRad)
  const y = radio * Math.sin(latRad)
  const z = radio * Math.cos(latRad) * Math.cos(lonRad)
  return new THREE.Vector3(x, y, z)
}
