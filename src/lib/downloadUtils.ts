import JSZip from 'jszip'
import type { ProcessedLogo, OutputSettings } from '@/types/logo-resizer'

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function getFileName(
  index: number,
  originalName: string,
  settings: OutputSettings,
  total: number
): string {
  const extension = settings.format === 'jpeg' ? 'jpg' : settings.format
  const baseName = settings.useRename
    ? settings.outputName
    : originalName.replace(/\.[^/.]+$/, '')

  if (settings.useNumbering) {
    const padLength = Math.max(2, String(total).length)
    const num = String(index + 1).padStart(padLength, '0')
    return `${num}_${baseName}.${extension}`
  }

  return `${baseName}.${extension}`
}

export function downloadSingle(
  logo: ProcessedLogo,
  settings: OutputSettings,
  index?: number,
  total?: number
): void {
  if (!logo.outputBlob) return

  const filename = getFileName(
    index ?? 0,
    logo.name,
    settings,
    total ?? 1
  )

  downloadBlob(logo.outputBlob, filename)
}

export async function downloadZip(
  logos: ProcessedLogo[],
  settings: OutputSettings
): Promise<void> {
  const zip = new JSZip()

  const readyLogos = logos.filter((logo) => logo.outputBlob)
  const total = readyLogos.length

  readyLogos.forEach((logo, index) => {
    const filename = getFileName(index, logo.name, settings, total)
    zip.file(filename, logo.outputBlob!)
  })

  const zipName = settings.useRename ? settings.outputName : 'logos'
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(zipBlob, `${zipName}.zip`)
}
