'use client'

import { useState, useCallback } from 'react'
import type { LogoFile, ProcessedLogo, OutputSettings } from '@/types/logo-resizer'
import { loadImage, processImage, canvasToBlob } from '@/lib/imageUtils'

interface UseImageProcessorReturn {
  processedLogos: ProcessedLogo[]
  processSingle: (logo: LogoFile, settings: OutputSettings) => Promise<ProcessedLogo>
  processAll: (logos: LogoFile[], settings: OutputSettings) => Promise<ProcessedLogo[]>
  isProcessing: boolean
  progress: { current: number; total: number }
  clearProcessed: () => void
  reorderLogos: (fromIndex: number, toIndex: number) => void
}

export function useImageProcessor(): UseImageProcessorReturn {
  const [processedLogos, setProcessedLogos] = useState<ProcessedLogo[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const processSingle = useCallback(
    async (logo: LogoFile, settings: OutputSettings): Promise<ProcessedLogo> => {
      const img = await loadImage(logo.file)
      const outputCanvas = processImage(img, settings)
      const outputBlob = await canvasToBlob(
        outputCanvas,
        settings.format,
        settings.quality
      )
      const outputUrl = URL.createObjectURL(outputBlob)

      return {
        ...logo,
        status: 'done',
        outputCanvas,
        outputBlob,
        outputUrl,
      }
    },
    []
  )

  const processAll = useCallback(
    async (logos: LogoFile[], settings: OutputSettings): Promise<ProcessedLogo[]> => {
      setIsProcessing(true)
      setProgress({ current: 0, total: logos.length })

      const results: ProcessedLogo[] = []

      for (let i = 0; i < logos.length; i++) {
        const logo = logos[i]

        if (logo.status === 'error') {
          results.push({
            ...logo,
            outputCanvas: document.createElement('canvas'),
          })
          continue
        }

        try {
          const processed = await processSingle(logo, settings)
          results.push(processed)
        } catch (error) {
          results.push({
            ...logo,
            status: 'error',
            error: error instanceof Error ? error.message : '処理に失敗しました',
            outputCanvas: document.createElement('canvas'),
          })
        }

        setProgress({ current: i + 1, total: logos.length })
      }

      setProcessedLogos(results)
      setIsProcessing(false)

      return results
    },
    [processSingle]
  )

  const clearProcessed = useCallback(() => {
    setProcessedLogos((prev) => {
      prev.forEach((logo) => {
        if (logo.outputUrl) {
          URL.revokeObjectURL(logo.outputUrl)
        }
      })
      return []
    })
    setProgress({ current: 0, total: 0 })
  }, [])

  const reorderLogos = useCallback((fromIndex: number, toIndex: number) => {
    setProcessedLogos((prev) => {
      const newLogos = [...prev]
      const [moved] = newLogos.splice(fromIndex, 1)
      newLogos.splice(toIndex, 0, moved)
      return newLogos
    })
  }, [])

  return {
    processedLogos,
    processSingle,
    processAll,
    isProcessing,
    progress,
    clearProcessed,
    reorderLogos,
  }
}
