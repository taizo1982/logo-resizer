'use client'

import { DeviceMobile, DeviceTablet, Desktop } from '@phosphor-icons/react'
import type { PreviewSettings } from '@/types/logo-resizer'
import { RESPONSIVE_PRESETS } from '@/types/logo-resizer'

interface PreviewControlsProps {
  settings: PreviewSettings
  onChange: (settings: PreviewSettings) => void
}

const iconMap = {
  DeviceMobile,
  DeviceTablet,
  Desktop,
}

export function PreviewControls({ settings, onChange }: PreviewControlsProps) {
  const handleWidthChange = (value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue > 0) {
      onChange({ ...settings, containerWidth: numValue })
    }
  }

  const handleGapChange = (value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0) {
      onChange({ ...settings, gap: numValue })
    }
  }

  const handlePresetClick = (width: number) => {
    onChange({ ...settings, containerWidth: width })
  }

  return (
    <div className="bg-zinc-900 rounded-xl p-4">
      <h3 className="text-white font-medium mb-4">プレビュー設定</h3>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-zinc-400 text-sm mb-1">幅 (px)</label>
          <input
            type="number"
            value={settings.containerWidth}
            onChange={(e) => handleWidthChange(e.target.value)}
            className="w-24 bg-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
            min={1}
          />
        </div>

        <div>
          <label className="block text-zinc-400 text-sm mb-1">Gap (px)</label>
          <input
            type="number"
            value={settings.gap}
            onChange={(e) => handleGapChange(e.target.value)}
            className="w-20 bg-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
            min={0}
          />
        </div>

        <div className="flex gap-2">
          {RESPONSIVE_PRESETS.map((preset) => {
            const Icon = iconMap[preset.icon as keyof typeof iconMap]
            const isActive = settings.containerWidth === preset.width

            return (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset.width)}
                className={`p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
                title={`${preset.label} (${preset.width}px)`}
              >
                <Icon size={20} weight="light" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
