'use client'

import type { LogoFile, ProcessedLogo } from '@/types/logo-resizer'
import { LogoCard } from './LogoCard'

interface LogoGridProps {
  logos: LogoFile[] | ProcessedLogo[]
  onRemove: (id: string) => void
  onDownload?: (logo: ProcessedLogo) => void
  onCrop?: (logo: LogoFile) => void
  onMoveLeft?: (id: string) => void
  onMoveRight?: (id: string) => void
  showProcessed?: boolean
}

export function LogoGrid({ logos, onRemove, onDownload, onCrop, onMoveLeft, onMoveRight, showProcessed = false }: LogoGridProps) {
  if (logos.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h3 className="text-white font-medium">
        アップロード済み ({logos.length})
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {logos.map((logo, index) => (
          <LogoCard
            key={logo.id}
            logo={logo}
            onRemove={onRemove}
            onDownload={onDownload}
            onCrop={onCrop}
            onMoveLeft={onMoveLeft}
            onMoveRight={onMoveRight}
            showProcessed={showProcessed}
            isFirst={index === 0}
            isLast={index === logos.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
