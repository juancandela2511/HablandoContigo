/**
 * ============================================================================
 * MOTOR GEOMÉTRICO THREE.JS DEL PLANETA 3D (geometriaPlaneta.ts)
 * ============================================================================
 * Construye la escena WebGL, la esfera wireframe, los continentes con siluetas reales,
 * balizas, arcos y controla el ciclo de vida y renderizado.
 * ============================================================================
 */

import * as THREE from 'three'
import {
  puntoEnPoligono,
  POLIGONO_COLOMBIA,
  POLIGONO_ESPANA,
  POLIGONOS_CONTINENTES,
  latLonAVector3
} from './datosGeograficos'

export function crearEtiquetaSprite(texto: string, colorTexto: string = '#ffffff'): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.font = 'bold 24px Inter, Poppins, sans-serif'
    ctx.fillStyle = colorTexto
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur = 8
    ctx.fillText(texto, 128, 32)
  }
  const textura = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({ map: textura, transparent: true })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(0.7, 0.175, 1)
  return sprite
}

export interface InstanciaMundo3D {
  animar: () => void
  destruir: () => void
  actualizarTema: (oscuro: boolean) => void
  redimensionar: () => void
}

export function inicializarEscenaPlaneta(
  contenedor: HTMLElement,
  esOscuroInicial: boolean
): InstanciaMundo3D {
  const ancho = contenedor.clientWidth || 600
  const alto = contenedor.clientHeight || 600

  // 1. Escena y Cámara
  const escena = new THREE.Scene()
  const camara = new THREE.PerspectiveCamera(45, ancho / alto, 0.1, 1000)
  camara.position.set(0, 1.2, 5.2)

  // 2. Renderizador WebGL
  const renderizador = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderizador.setSize(ancho, alto)
  renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  contenedor.appendChild(renderizador.domElement)

  // 3. Grupo principal
  const grupoGlobo = new THREE.Group()
  escena.add(grupoGlobo)

  const radioGlobo = 2.05

  // 4. Retícula Wireframe
  const materialLineas = new THREE.LineBasicMaterial({
    color: esOscuroInicial ? 0xffffff : 0x475569,
    transparent: true,
    opacity: esOscuroInicial ? 0.16 : 0.22,
    linewidth: 1
  })

  // Paralelos
  const numParalelos = 14
  for (let i = 1; i < numParalelos; i++) {
    const lat = (Math.PI * i) / numParalelos - Math.PI / 2
    const radioAnillo = radioGlobo * Math.cos(lat)
    const y = radioGlobo * Math.sin(lat)
    const curvaCirculo = new THREE.EllipseCurve(0, 0, radioAnillo, radioAnillo, 0, 2 * Math.PI, false, 0)
    const puntosCirculo = curvaCirculo.getPoints(80)
    const geometriaAnillo = new THREE.BufferGeometry().setFromPoints(
      puntosCirculo.map(p => new THREE.Vector3(p.x, y, p.y))
    )
    grupoGlobo.add(new THREE.Line(geometriaAnillo, materialLineas))
  }

  // Meridianos
  const numMeridianos = 18
  for (let i = 0; i < numMeridianos; i++) {
    const lon = (Math.PI * 2 * i) / numMeridianos
    const puntosMeridiano: THREE.Vector3[] = []
    const segmentos = 70
    for (let j = 0; j <= segmentos; j++) {
      const lat = (Math.PI * j) / segmentos - Math.PI / 2
      const x = radioGlobo * Math.cos(lat) * Math.sin(lon)
      const y = radioGlobo * Math.sin(lat)
      const z = radioGlobo * Math.cos(lat) * Math.cos(lon)
      puntosMeridiano.push(new THREE.Vector3(x, y, z))
    }
    const geometriaMeridiano = new THREE.BufferGeometry().setFromPoints(puntosMeridiano)
    grupoGlobo.add(new THREE.Line(geometriaMeridiano, materialLineas))
  }

  // 5. Matriz de Puntos Continentales
  const posicionesPuntos: number[] = []
  const coloresPuntos: number[] = []
  const pasoLat = 1.35
  const pasoLon = 1.35

  for (let lat = -82; lat <= 82; lat += pasoLat) {
    const latRad = (lat * Math.PI) / 180
    for (let lon = -180; lon <= 180; lon += pasoLon) {
      const lonRad = (lon * Math.PI) / 180

      let esPuntoTierra = false
      let esColombia = false
      let esEspana = false

      if (puntoEnPoligono(lon, lat, POLIGONO_COLOMBIA)) {
        esColombia = true
        esPuntoTierra = true
      } else if (puntoEnPoligono(lon, lat, POLIGONO_ESPANA)) {
        esEspana = true
        esPuntoTierra = true
      } else {
        for (const poli of POLIGONOS_CONTINENTES) {
          if (poli && puntoEnPoligono(lon, lat, poli)) {
            esPuntoTierra = true
            break
          }
        }
      }

      if (esPuntoTierra) {
        const rPunto = radioGlobo * 1.003
        const x = rPunto * Math.cos(latRad) * Math.sin(lonRad)
        const y = rPunto * Math.sin(latRad)
        const z = rPunto * Math.cos(latRad) * Math.cos(lonRad)
        posicionesPuntos.push(x, y, z)

        if (esColombia) {
          coloresPuntos.push(0.98, 0.76, 0.15)
        } else if (esEspana) {
          coloresPuntos.push(0.96, 0.26, 0.42)
        } else {
          if (esOscuroInicial) {
            const brillo = 0.82 + Math.random() * 0.18
            coloresPuntos.push(brillo, brillo, brillo)
          } else {
            coloresPuntos.push(0.12, 0.18, 0.28)
          }
        }
      }
    }
  }

  const geometriaPuntos = new THREE.BufferGeometry()
  geometriaPuntos.setAttribute('position', new THREE.Float32BufferAttribute(posicionesPuntos, 3))
  geometriaPuntos.setAttribute('color', new THREE.Float32BufferAttribute(coloresPuntos, 3))

  const lienzoCanvas = document.createElement('canvas')
  lienzoCanvas.width = 64
  lienzoCanvas.height = 64
  const ctx = lienzoCanvas.getContext('2d')
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30)
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)')
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.85)')
    grad.addColorStop(0.75, 'rgba(255, 255, 255, 0.3)')
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(32, 32, 30, 0, Math.PI * 2)
    ctx.fill()
  }
  const texturaPuntoCirculo = new THREE.CanvasTexture(lienzoCanvas)

  const materialPuntos = new THREE.PointsMaterial({
    size: 0.046,
    vertexColors: true,
    map: texturaPuntoCirculo,
    transparent: true,
    opacity: esOscuroInicial ? 0.96 : 0.88,
    blending: esOscuroInicial ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: false
  })

  const nubePuntosContinentes = new THREE.Points(geometriaPuntos, materialPuntos)
  grupoGlobo.add(nubePuntosContinentes)

  // 6. Esfera interior de oclusión
  const geometriaOclusion = new THREE.SphereGeometry(radioGlobo * 0.995, 48, 48)
  const materialOclusion = new THREE.MeshBasicMaterial({
    color: esOscuroInicial ? 0x05070c : 0xf1f5f9,
    transparent: true,
    opacity: esOscuroInicial ? 0.94 : 0.86
  })
  grupoGlobo.add(new THREE.Mesh(geometriaOclusion, materialOclusion))

  // 7. Halo atmosférico
  const geometriaHalo = new THREE.SphereGeometry(radioGlobo * 1.03, 32, 32)
  const materialHalo = new THREE.MeshBasicMaterial({
    color: esOscuroInicial ? 0x38bdf8 : 0x0284c7,
    transparent: true,
    opacity: esOscuroInicial ? 0.05 : 0.03,
    side: THREE.BackSide
  })
  grupoGlobo.add(new THREE.Mesh(geometriaHalo, materialHalo))

  // 8. Balizas y Arco Transatlántico
  const posCol = latLonAVector3(4.711, -74.072, radioGlobo * 1.018)
  const posEsp = latLonAVector3(40.417, -3.704, radioGlobo * 1.018)

  const geomPin = new THREE.SphereGeometry(0.065, 16, 16)
  const meshPinCol = new THREE.Mesh(geomPin, new THREE.MeshBasicMaterial({ color: 0xf59e0b }))
  meshPinCol.position.copy(posCol)
  grupoGlobo.add(meshPinCol)

  const geomRadar = new THREE.RingGeometry(0.04, 0.09, 32)
  const anilloRadarCol = new THREE.Mesh(geomRadar, new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }))
  anilloRadarCol.position.copy(posCol)
  anilloRadarCol.lookAt(new THREE.Vector3(0, 0, 0))
  grupoGlobo.add(anilloRadarCol)

  const spriteCol = crearEtiquetaSprite('🇨🇴 Colombia', '#f59e0b')
  spriteCol.position.copy(posCol).multiplyScalar(1.08)
  grupoGlobo.add(spriteCol)

  const meshPinEsp = new THREE.Mesh(geomPin, new THREE.MeshBasicMaterial({ color: 0xf43f5e }))
  meshPinEsp.position.copy(posEsp)
  grupoGlobo.add(meshPinEsp)

  const anilloRadarEsp = new THREE.Mesh(geomRadar, new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }))
  anilloRadarEsp.position.copy(posEsp)
  anilloRadarEsp.lookAt(new THREE.Vector3(0, 0, 0))
  grupoGlobo.add(anilloRadarEsp)

  const spriteEsp = crearEtiquetaSprite('🇪🇸 España', '#f43f5e')
  spriteEsp.position.copy(posEsp).multiplyScalar(1.08)
  grupoGlobo.add(spriteEsp)

  const puntoMedio = new THREE.Vector3().addVectors(posCol, posEsp).multiplyScalar(0.5)
  puntoMedio.normalize().multiplyScalar(radioGlobo * 1.38)

  const curvaArcoConexion = new THREE.QuadraticBezierCurve3(posCol, puntoMedio, posEsp)
  const puntosArco = curvaArcoConexion.getPoints(100)
  const geomArco = new THREE.BufferGeometry().setFromPoints(puntosArco)
  const matArco = new THREE.LineBasicMaterial({
    color: esOscuroInicial ? 0x38bdf8 : 0x0284c7,
    linewidth: 2,
    transparent: true,
    opacity: 0.88
  })
  const lineaArco = new THREE.Line(geomArco, matArco)
  grupoGlobo.add(lineaArco)

  const geomParticula = new THREE.SphereGeometry(0.04, 12, 12)
  const matParticula = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const particulaData1 = new THREE.Mesh(geomParticula, matParticula)
  const particulaData2 = new THREE.Mesh(geomParticula, matParticula)
  grupoGlobo.add(particulaData1)
  grupoGlobo.add(particulaData2)

  grupoGlobo.rotation.x = 0.22
  grupoGlobo.rotation.y = 0.85

  // 9. Interacción con el cursor
  let estaArrastrando = false
  let mouseXAnterior = 0
  let mouseYAnterior = 0
  let objetivoRotacionX = 0.25
  let objetivoRotacionY = 0

  const canvasElement = renderizador.domElement
  canvasElement.style.cursor = 'grab'

  const onMouseDown = (e: MouseEvent) => {
    estaArrastrando = true
    canvasElement.style.cursor = 'grabbing'
    mouseXAnterior = e.clientX
    mouseYAnterior = e.clientY
  }

  const onMouseUp = () => {
    if (estaArrastrando) {
      estaArrastrando = false
      canvasElement.style.cursor = 'grab'
    }
  }

  const onMouseMove = (e: MouseEvent) => {
    if (estaArrastrando) {
      const deltaX = e.clientX - mouseXAnterior
      const deltaY = e.clientY - mouseYAnterior
      objetivoRotacionY += deltaX * 0.005
      objetivoRotacionX += deltaY * 0.003
      mouseXAnterior = e.clientX
      mouseYAnterior = e.clientY
    }
  }

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches && e.touches[0] && e.touches.length === 1) {
      estaArrastrando = true
      mouseXAnterior = e.touches[0].clientX
      mouseYAnterior = e.touches[0].clientY
    }
  }

  const onTouchEnd = () => {
    estaArrastrando = false
  }

  const onTouchMove = (e: TouchEvent) => {
    if (estaArrastrando && e.touches && e.touches[0] && e.touches.length === 1) {
      const touch = e.touches[0]
      const deltaX = touch.clientX - mouseXAnterior
      const deltaY = touch.clientY - mouseYAnterior
      objetivoRotacionY += deltaX * 0.005
      objetivoRotacionX += deltaY * 0.003
      mouseXAnterior = touch.clientX
      mouseYAnterior = touch.clientY
    }
  }

  canvasElement.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mouseup', onMouseUp)
  canvasElement.addEventListener('mousemove', onMouseMove)
  canvasElement.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchend', onTouchEnd)
  canvasElement.addEventListener('touchmove', onTouchMove, { passive: true })

  // 10. Bucle de animación
  let progresoParticula1 = 0
  let progresoParticula2 = 0.5
  let escalaRadar = 1.0
  let idAnimacion = 0

  const animar = () => {
    idAnimacion = requestAnimationFrame(animar)

    if (!estaArrastrando) {
      grupoGlobo.rotation.y += 0.0014
    } else {
      grupoGlobo.rotation.y += (objetivoRotacionY - grupoGlobo.rotation.y) * 0.1
      grupoGlobo.rotation.x += (objetivoRotacionX - grupoGlobo.rotation.x) * 0.1
    }

    progresoParticula1 = (progresoParticula1 + 0.006) % 1.0
    progresoParticula2 = (progresoParticula2 + 0.006) % 1.0
    particulaData1.position.copy(curvaArcoConexion.getPoint(progresoParticula1))
    particulaData2.position.copy(curvaArcoConexion.getPoint(progresoParticula2))

    escalaRadar += 0.02
    if (escalaRadar > 2.4) escalaRadar = 1.0
    anilloRadarCol.scale.set(escalaRadar, escalaRadar, 1)
    anilloRadarEsp.scale.set(escalaRadar, escalaRadar, 1)

    renderizador.render(escena, camara)
  }

  animar()

  const redimensionar = () => {
    if (!contenedor || !renderizador || !camara) return
    const nAncho = contenedor.clientWidth
    const nAlto = contenedor.clientHeight
    camara.aspect = nAncho / nAlto
    camara.updateProjectionMatrix()
    renderizador.setSize(nAncho, nAlto)
  }

  window.addEventListener('resize', redimensionar)

  const actualizarTema = (oscuro: boolean) => {
    materialLineLines(materialLineas, oscuro)
    materialOclusion.color.setHex(oscuro ? 0x05070c : 0xf1f5f9)
    materialOclusion.opacity = oscuro ? 0.94 : 0.86
    materialHalo.color.setHex(oscuro ? 0x38bdf8 : 0x0284c7)
    matArco.color.setHex(oscuro ? 0x38bdf8 : 0x0284c7)
    materialPuntos.opacity = oscuro ? 0.96 : 0.88
    materialPuntos.blending = oscuro ? THREE.AdditiveBlending : THREE.NormalBlending
  }

  function materialLineLines(mat: THREE.LineBasicMaterial, oscuro: boolean) {
    mat.color.setHex(oscuro ? 0xffffff : 0x475569)
    mat.opacity = oscuro ? 0.16 : 0.22
  }

  const destruir = () => {
    if (idAnimacion) cancelAnimationFrame(idAnimacion)
    window.removeEventListener('resize', redimensionar)
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('touchend', onTouchEnd)
    canvasElement.removeEventListener('mousedown', onMouseDown)
    canvasElement.removeEventListener('mousemove', onMouseMove)
    canvasElement.removeEventListener('touchstart', onTouchStart)
    canvasElement.removeEventListener('touchmove', onTouchMove)

    renderizador.dispose()
    if (canvasElement && canvasElement.parentNode) {
      canvasElement.parentNode.removeChild(canvasElement)
    }
  }

  return { animar, destruir, actualizarTema, redimensionar }
}
