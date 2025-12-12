'use client'

import type { PresetSize, OutputSize } from '@/types/logo-resizer'
import { SIZE_PRESETS } from '@/types/logo-resizer'

interface PresetButtonsProps {
  currentSize: OutputSize
  onSelect: (size: OutputSize) => void
}

export function PresetButtons({ currentSize, onSelect }: PresetButtonsProps) {
  const isSelected = (preset: PresetSize) =>
    currentSize.width === preset.width && currentSize.height === preset.height

  return (
    <div className="flex flex-wrap gap-2">
      {SIZE_PRESETS.map((preset) => (
        <button
          key={preset.label}
          onClick={() => onSelect({ width: preset.width, height: preset.height })}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            isSelected(preset)
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          {preset.label}
          <span className="ml-1 text-xs opacity-70">
            {preset.width}×{preset.height}
          </span>
        </button>
      ))}
    </div>
  )
}
