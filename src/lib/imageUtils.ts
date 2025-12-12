import type { BackgroundType, OutputSettings } from '@/types/logo-resizer'

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_FILES = 50
export const VALID_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'image/gif', 'image/bmp']

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'ファイルサイズが10MBを超えています' }
  }

  if (!VALID_TYPES.includes(file.type)) {
    return { valid: false, error: 'サポートされていない形式です' }
  }

  return { valid: true }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('画像の読み込みに失敗しました'))
    }
    img.src = url
  })
}

export function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  return canvas
}

export function createCanvasWithBackground(
  width: number,
  height: number,
  background: BackgroundType,
  customColor?: string
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  if (background !== 'transparent') {
    const colors: Record<string, string> = {
      white: '#ffffff',
      black: '#000000',
      custom: customColor || '#ffffff',
    }
    ctx.fillStyle = colors[background]
    ctx.fillRect(0, 0, width, height)
  }

  return canvas
}

export function calculateFitDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number; x: number; y: number } {
  const paddingTop = 5
  const paddingBottom = 5

  // 上下のパディングを引いた領域にフィットさせる
  const contentHeight = maxHeight - paddingTop - paddingBottom
  const contentWidth = maxWidth

  const scale = Math.min(
    contentWidth / srcWidth,
    contentHeight / srcHeight
  )

  const width = Math.floor(srcWidth * scale)
  const height = Math.floor(srcHeight * scale)

  // 中央揃え（上下はパディング内で中央）
  const x = Math.floor((maxWidth - width) / 2)
  const y = paddingTop + Math.floor((contentHeight - height) / 2)

  return { width, height, x, y }
}

export function processImage(
  img: HTMLImageElement,
  settings: OutputSettings
): HTMLCanvasElement {
  const { size, background, customColor } = settings

  // Create output canvas with background
  const outputCanvas = createCanvasWithBackground(
    size.width,
    size.height,
    background,
    customColor
  )

  // Calculate fit dimensions
  const fit = calculateFitDimensions(
    img.naturalWidth,
    img.naturalHeight,
    size.width,
    size.height
  )

  const targetWidth = Math.max(1, Math.round(fit.width))
  const targetHeight = Math.max(1, Math.round(fit.height))

  const ctx = outputCanvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, Math.round(fit.x), Math.round(fit.y), targetWidth, targetHeight)

  return outputCanvas
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' | 'webp',
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = `image/${format}`
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Blob生成に失敗しました'))
        }
      },
      mimeType,
      quality
    )
  })
}

export function getOutputFileName(
  originalName: string,
  format: 'png' | 'jpeg' | 'webp'
): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '')
  const extension = format === 'jpeg' ? 'jpg' : format
  return `${baseName}.${extension}`
}
