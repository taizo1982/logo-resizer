'use client'

import { useState, useEffect } from 'react'
import { Crop, X } from '@phosphor-icons/react'
import type { LogoFile, ProcessedLogo } from '@/types/logo-resizer'
import { LogoCard } from './LogoCard'

const HINT_STORAGE_KEY = 'logo-resizer-crop-hint-dismissed'

interface LogoGridProps {
  logos: LogoFile[] | ProcessedLogo[]
  onRemove: (id: string) => void
  onDownload?: (logo: ProcessedLogo) => void
  onCrop?: (logo: LogoFile) => void
  showProcessed?: boolean
}

export function LogoGrid({ logos, onRemove, onDownload, onCrop, showProcessed = false }: LogoGridProps) {
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(HINT_STORAGE_KEY)
    if (!dismissed && logos.length > 0 && !showProcessed) {
      setShowHint(true)
    }
  }, [logos.length, showProcessed])

  const dismissHint = () => {
    setShowHint(false)
    localStorage.setItem(HINT_STORAGE_KEY, 'true')
  }

  if (logos.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h3 className="text-white font-medium">
        アップロード済み ({logos.length})
      </h3>

      {showHint && onCrop && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
          <div className="flex items-center gap-2 text-blue-400 text-sm">
            <Crop size={18} weight="light" />
            <span>各画像の「トリミング」ボタンで、画像を切り抜きできます</span>
          </div>
          <button
            onClick={dismissHint}
            className="p-1 rounded hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 transition-colors"
            title="閉じる"
          >
            <X size={16} weight="light" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {logos.map((logo) => (
          <LogoCard
            key={logo.id}
            logo={logo}
            onRemove={onRemove}
            onDownload={onDownload}
            onCrop={onCrop}
            showProcessed={showProcessed}
          />
        ))}
      </div>
    </div>
  )
}
