/**
 * ============================================================================
 * OPTIMIZADOR DE IMAGEN DE AVATAR (avatarOptimizer.ts)
 * ============================================================================
 * Redimensiona y comprime imágenes de perfil a máximo 256x256px JPEG (~25KB)
 * para garantizar persistencia inmediata y liviana en PostgreSQL y LocalStorage.
 */

export function optimizarImagenAvatar(
  archivo: File,
  maxDim = 256,
  calidad = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const src = e.target?.result as string
      if (!src) {
        reject(new Error('No se pudo leer la imagen seleccionada.'))
        return
      }

      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          let { width, height } = img

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            }
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }

          canvas.width = Math.max(width, 1)
          canvas.height = Math.max(height, 1)
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(src)
            return
          }

          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', calidad))
        } catch {
          resolve(src)
        }
      }
      img.onerror = () => resolve(src)
      img.src = src
    }
    reader.onerror = reject
    reader.readAsDataURL(archivo)
  })
}
