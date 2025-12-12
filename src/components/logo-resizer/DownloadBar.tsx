'use client'

import { DownloadSimple, FileZip, Trash, SpinnerGap } from '@phosphor-icons/react'
import type { ProcessedLogo } from '@/types/logo-resizer'

interface DownloadBarProps {
  logos: ProcessedLogo[]
  onClearAll: () => void
  onDownloadAll: () => void
  onDownloadZip: () => void
  isProcessing: boolean
  isDownloading: boolean
}

export function DownloadBar({
  logos,
  onClearAll,
  onDownloadAll,
  onDownloadZip,
  isProcessing,
  isDownloading,
}: DownloadBarProps) {
  const readyCount = logos.filter((l) => l.outputBlob).length
  const hasReady = readyCount > 0

  return (
    <div className="bg-zinc-900 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onClearAll}
          disabled={logos.length === 0 || isProcessing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash size={18} weight="light" />
          <span>Clear All</span>
        </button>

        {isProcessing && (
          <div className="flex items-center gap-2 text-zinc-400">
            <SpinnerGap size={18} weight="light" className="animate-spin" />
            <span>処理中...</span>
          </div>
        )}

        {!isProcessing && readyCount > 0 && (
          <span className="text-zinc-400">
            {readyCount} files ready
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onDownloadAll}
          disabled={!hasReady || isDownloading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DownloadSimple size={18} weight="light" />
          <span>Download All</span>
        </button>

        <button
          onClick={onDownloadZip}
          disabled={!hasReady || isDownloading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <SpinnerGap size={18} weight="light" className="animate-spin" />
          ) : (
            <FileZip size={18} weight="light" />
          )}
          <span>Download ZIP</span>
        </button>
      </div>
    </div>
  )
}
