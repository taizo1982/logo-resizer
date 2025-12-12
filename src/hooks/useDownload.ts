'use client'

import { useState, useCallback } from 'react'
import type { ProcessedLogo, OutputSettings } from '@/types/logo-resizer'
import { downloadSingle, downloadZip } from '@/lib/downloadUtils'

interface UseDownloadReturn {
  downloadOne: (logo: ProcessedLogo, settings: OutputSettings, index?: number, total?: number) => void
  downloadAll: (logos: ProcessedLogo[], settings: OutputSettings) => void
  downloadAsZip: (logos: ProcessedLogo[], settings: OutputSettings) => Promise<void>
  isDownloading: boolean
}

export function useDownload(): UseDownloadReturn {
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadOne = useCallback(
    (logo: ProcessedLogo, settings: OutputSettings, index?: number, total?: number) => {
      downloadSingle(logo, settings, index, total)
    },
    []
  )

  const downloadAll = useCallback(
    (logos: ProcessedLogo[], settings: OutputSettings) => {
      const readyLogos = logos.filter((l) => l.outputBlob)
      const total = readyLogos.length
      readyLogos.forEach((logo, index) => {
        downloadSingle(logo, settings, index, total)
      })
    },
    []
  )

  const downloadAsZip = useCallback(
    async (logos: ProcessedLogo[], settings: OutputSettings) => {
      setIsDownloading(true)
      try {
        await downloadZip(logos, settings)
      } finally {
        setIsDownloading(false)
      }
    },
    []
  )

  return {
    downloadOne,
    downloadAll,
    downloadAsZip,
    isDownloading,
  }
}
