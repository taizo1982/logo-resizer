'use client'

import { useState, useCallback } from 'react'
import type { LogoFile } from '@/types/logo-resizer'
import { validateFile, generateId, loadImage, isPdfFile, isAiFile, isPsdFile, isOfficeFile, isEpsFile, pdfToImageBlob, psdToImageBlob, officeToImageBlob, MAX_FILE_SIZE, MAX_FILES } from '@/lib/imageUtils'

interface UseLogoManagerReturn {
  logos: LogoFile[]
  addFiles: (files: File[]) => Promise<void>
  removeLogo: (id: string) => void
  clearAll: () => void
  updateLogo: (id: string, updates: Partial<LogoFile>) => void
  updateLogoWithBlob: (id: string, blob: Blob) => Promise<void>
  moveLogo: (id: string, direction: 'left' | 'right') => void
}

export function useLogoManager(): UseLogoManagerReturn {
  const [logos, setLogos] = useState<LogoFile[]>([])

  const addFiles = useCallback(async (files: File[]) => {
    const remainingSlots = MAX_FILES - logos.length
    const filesToProcess = files.slice(0, remainingSlots)

    const newLogos: LogoFile[] = []

    for (const file of filesToProcess) {
      const validation = validateFile(file)

      if (!validation.valid) {
        newLogos.push({
          id: generateId(),
          file,
          name: file.name,
          originalWidth: 0,
          originalHeight: 0,
          previewUrl: '',
          status: 'error',
          error: validation.error,
        })
        continue
      }

      // PDF/AI/PSDの場合は画像に変換
      let processedFile = file
      let previewBlob: Blob | null = null

      if (isPdfFile(file) || isAiFile(file)) {
        try {
          previewBlob = await pdfToImageBlob(file)
          const newName = file.name.replace(/\.(pdf|ai)$/i, '.png')
          processedFile = new File([previewBlob], newName, { type: 'image/png' })
        } catch {
          newLogos.push({
            id: generateId(),
            file,
            name: file.name,
            originalWidth: 0,
            originalHeight: 0,
            previewUrl: '',
            status: 'error',
            error: isAiFile(file) ? 'AIファイルの変換に失敗しました' : 'PDFの変換に失敗しました',
          })
          continue
        }
      } else if (isPsdFile(file)) {
        try {
          previewBlob = await psdToImageBlob(file)
          const newName = file.name.replace(/\.psd$/i, '.png')
          processedFile = new File([previewBlob], newName, { type: 'image/png' })
        } catch {
          newLogos.push({
            id: generateId(),
            file,
            name: file.name,
            originalWidth: 0,
            originalHeight: 0,
            previewUrl: '',
            status: 'error',
            error: 'PSDファイルの変換に失敗しました',
          })
          continue
        }
      } else if (isOfficeFile(file)) {
        try {
          previewBlob = await officeToImageBlob(file)
          const newName = file.name.replace(/\.(docx?|xlsx?|pptx?)$/i, '.png')
          processedFile = new File([previewBlob], newName, { type: 'image/png' })
        } catch {
          newLogos.push({
            id: generateId(),
            file,
            name: file.name,
            originalWidth: 0,
            originalHeight: 0,
            previewUrl: '',
            status: 'error',
            error: 'Officeファイルから画像を抽出できませんでした',
          })
          continue
        }
      } else if (isEpsFile(file)) {
        // EPSはPDF.jsで処理（AIと同様）
        try {
          previewBlob = await pdfToImageBlob(file)
          const newName = file.name.replace(/\.eps$/i, '.png')
          processedFile = new File([previewBlob], newName, { type: 'image/png' })
        } catch {
          newLogos.push({
            id: generateId(),
            file,
            name: file.name,
            originalWidth: 0,
            originalHeight: 0,
            previewUrl: '',
            status: 'error',
            error: 'EPSファイルの変換に失敗しました',
          })
          continue
        }
      }

      const logoFile: LogoFile = {
        id: generateId(),
        file: processedFile,
        name: file.name,
        originalWidth: 0,
        originalHeight: 0,
        previewUrl: URL.createObjectURL(previewBlob || processedFile),
        status: 'loading',
      }

      try {
        const img = await loadImage(processedFile)
        logoFile.originalWidth = img.naturalWidth
        logoFile.originalHeight = img.naturalHeight
        logoFile.status = 'ready'
      } catch {
        logoFile.status = 'error'
        logoFile.error = '画像の読み込みに失敗しました'
      }

      newLogos.push(logoFile)
    }

    setLogos((prev) => [...prev, ...newLogos])
  }, [logos.length])

  const removeLogo = useCallback((id: string) => {
    setLogos((prev) => {
      const logo = prev.find((l) => l.id === id)
      if (logo?.previewUrl) {
        URL.revokeObjectURL(logo.previewUrl)
      }
      return prev.filter((l) => l.id !== id)
    })
  }, [])

  const clearAll = useCallback(() => {
    setLogos((prev) => {
      prev.forEach((logo) => {
        if (logo.previewUrl) {
          URL.revokeObjectURL(logo.previewUrl)
        }
      })
      return []
    })
  }, [])

  const updateLogo = useCallback((id: string, updates: Partial<LogoFile>) => {
    setLogos((prev) =>
      prev.map((logo) =>
        logo.id === id ? { ...logo, ...updates } : logo
      )
    )
  }, [])

  const updateLogoWithBlob = useCallback(async (id: string, blob: Blob) => {
    const file = new File([blob], 'cropped.png', { type: blob.type })
    const img = await loadImage(file)
    const previewUrl = URL.createObjectURL(blob)

    setLogos((prev) =>
      prev.map((logo) => {
        if (logo.id === id) {
          if (logo.previewUrl) {
            URL.revokeObjectURL(logo.previewUrl)
          }
          return {
            ...logo,
            file,
            originalWidth: img.naturalWidth,
            originalHeight: img.naturalHeight,
            previewUrl,
            status: 'ready',
          }
        }
        return logo
      })
    )
  }, [])

  const moveLogo = useCallback((id: string, direction: 'left' | 'right') => {
    setLogos((prev) => {
      const index = prev.findIndex((l) => l.id === id)
      if (index === -1) return prev

      const newIndex = direction === 'left' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= prev.length) return prev

      const newLogos = [...prev]
      const [removed] = newLogos.splice(index, 1)
      newLogos.splice(newIndex, 0, removed)
      return newLogos
    })
  }, [])

  return {
    logos,
    addFiles,
    removeLogo,
    clearAll,
    updateLogo,
    updateLogoWithBlob,
    moveLogo,
  }
}
