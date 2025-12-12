'use client'

import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import type { ProcessedLogo, PreviewSettings } from '@/types/logo-resizer'

interface GridPreviewProps {
  logos: ProcessedLogo[]
  settings: PreviewSettings
  onReorder: (fromIndex: number, toIndex: number) => void
}

export function GridPreview({ logos, settings, onReorder }: GridPreviewProps) {
  const readyLogos = logos.filter((logo) => logo.outputUrl)

  if (readyLogos.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-xl p-8 text-center">
        <p className="text-zinc-400">
          処理済みのロゴがありません
        </p>
      </div>
    )
  }

  const handleMoveLeft = (index: number) => {
    if (index > 0) {
      onReorder(index, index - 1)
    }
  }

  const handleMoveRight = (index: number) => {
    if (index < readyLogos.length - 1) {
      onReorder(index, index + 1)
    }
  }

  return (
    <div className="bg-zinc-900 rounded-xl p-4 overflow-auto">
      <div
        className="mx-auto rounded-lg p-4"
        style={{
          width: settings.containerWidth,
          maxWidth: '100%',
          backgroundColor: settings.backgroundColor,
        }}
      >
        <div
          className="flex flex-wrap justify-center"
          style={{ gap: settings.gap }}
        >
          {readyLogos.map((logo, index) => (
            <div key={logo.id} className="flex-shrink-0 relative group">
              {/* Number badge */}
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold z-10">
                {index + 1}
              </div>

              <img
                src={logo.outputUrl}
                alt={logo.name}
                className="block"
              />

              {/* Reorder controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={() => handleMoveLeft(index)}
                  disabled={index === 0}
                  className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="左へ移動"
                >
                  <ArrowLeft size={16} weight="bold" className="text-white" />
                </button>
                <span className="text-white font-bold">{index + 1}</span>
                <button
                  onClick={() => handleMoveRight(index)}
                  disabled={index === readyLogos.length - 1}
                  className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="右へ移動"
                >
                  <ArrowRight size={16} weight="bold" className="text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-zinc-500 text-sm mt-4">
        {settings.containerWidth}px | ホバーで順番変更
      </p>
    </div>
  )
}
