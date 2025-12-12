'use client'

import { X, DownloadSimple, SpinnerGap, Warning, Crop, CaretLeft, CaretRight } from '@phosphor-icons/react'
import type { LogoFile, ProcessedLogo } from '@/types/logo-resizer'

interface LogoCardProps {
  logo: LogoFile | ProcessedLogo
  onRemove: (id: string) => void
  onDownload?: (logo: ProcessedLogo) => void
  onCrop?: (logo: LogoFile) => void
  onMoveLeft?: (id: string) => void
  onMoveRight?: (id: string) => void
  showProcessed?: boolean
  isFirst?: boolean
  isLast?: boolean
}

function isProcessedLogo(logo: LogoFile | ProcessedLogo): logo is ProcessedLogo {
  return 'outputUrl' in logo && logo.outputUrl !== undefined
}

export function LogoCard({
  logo,
  onRemove,
  onDownload,
  onCrop,
  onMoveLeft,
  onMoveRight,
  showProcessed = false,
  isFirst = false,
  isLast = false
}: LogoCardProps) {
  const displayUrl = showProcessed && isProcessedLogo(logo)
    ? logo.outputUrl
    : logo.previewUrl

  const isLoading = logo.status === 'loading' || logo.status === 'processing'
  const isError = logo.status === 'error'

  return (
    <div className="bg-zinc-900 rounded-xl p-3 group relative">
      {/* 上部：ボタン群 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1">
          {onMoveLeft && (
            <button
              onClick={() => onMoveLeft(logo.id)}
              disabled={isFirst}
              className={`p-1.5 rounded-lg transition-colors ${
                isFirst
                  ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
              }`}
              title="左へ移動"
            >
              <CaretLeft size={16} weight="light" />
            </button>
          )}
          {onMoveRight && (
            <button
              onClick={() => onMoveRight(logo.id)}
              disabled={isLast}
              className={`p-1.5 rounded-lg transition-colors ${
                isLast
                  ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
              }`}
              title="右へ移動"
            >
              <CaretRight size={16} weight="light" />
            </button>
          )}
        </div>

        <div className="flex gap-1">
          {onCrop && !showProcessed && (
            <button
              onClick={() => onCrop(logo)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white transition-colors text-xs"
              title="トリミング"
            >
              <Crop size={14} weight="light" />
              <span>トリミング</span>
            </button>
          )}
          {onDownload && isProcessedLogo(logo) && logo.outputBlob && (
            <button
              onClick={() => onDownload(logo)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              title="ダウンロード"
            >
              <DownloadSimple size={16} weight="light" />
            </button>
          )}
          <button
            onClick={() => onRemove(logo.id)}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white transition-colors"
            title="削除"
          >
            <X size={16} weight="light" />
          </button>
        </div>
      </div>

      {/* 中央：画像 */}
      <div className="aspect-video bg-zinc-800 rounded-lg mb-2 flex items-center justify-center overflow-hidden relative">
        {isLoading && (
          <SpinnerGap
            size={32}
            weight="light"
            className="text-zinc-500 animate-spin"
          />
        )}

        {isError && (
          <div className="text-center p-2">
            <Warning size={32} weight="light" className="text-red-400 mx-auto mb-1" />
            <p className="text-red-400 text-xs">{logo.error}</p>
          </div>
        )}

        {!isLoading && !isError && displayUrl && (
          <img
            src={displayUrl}
            alt={logo.name}
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      {/* 下部：サイズとファイル名 */}
      <div>
        <p className="text-zinc-500 text-xs">
          {logo.originalWidth}×{logo.originalHeight}
        </p>
        <p className="text-white text-sm truncate" title={logo.name}>
          {logo.name}
        </p>
      </div>
    </div>
  )
}
