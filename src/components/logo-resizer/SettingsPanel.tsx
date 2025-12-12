'use client'

import type { OutputSettings, BackgroundType, OutputFormat } from '@/types/logo-resizer'
import { PresetButtons } from './PresetButtons'

interface SettingsPanelProps {
  settings: OutputSettings
  onChange: (settings: OutputSettings) => void
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const handleSizeChange = (key: 'width' | 'height', value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue > 0) {
      onChange({
        ...settings,
        size: { ...settings.size, [key]: numValue },
      })
    }
  }

  const handlePaddingChange = (value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0) {
      onChange({ ...settings, padding: numValue })
    }
  }

  const handleBackgroundChange = (background: BackgroundType) => {
    onChange({ ...settings, background })
  }

  const handleCustomColorChange = (customColor: string) => {
    onChange({ ...settings, customColor })
  }

  const handleFormatChange = (format: OutputFormat) => {
    onChange({ ...settings, format })
  }

  const handleOutputNameChange = (outputName: string) => {
    onChange({ ...settings, outputName })
  }

  return (
    <div className="bg-zinc-900 rounded-xl p-4 space-y-4">
      <h3 className="text-white font-medium">出力設定</h3>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-zinc-400 text-sm mb-1">幅 (px)</label>
          <input
            type="number"
            value={settings.size.width}
            onChange={(e) => handleSizeChange('width', e.target.value)}
            className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
            min={1}
          />
        </div>

        <div>
          <label className="block text-zinc-400 text-sm mb-1">高さ (px)</label>
          <input
            type="number"
            value={settings.size.height}
            onChange={(e) => handleSizeChange('height', e.target.value)}
            className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
            min={1}
          />
        </div>

        <div>
          <label className="block text-zinc-400 text-sm mb-1">形式</label>
          <select
            value={settings.format}
            onChange={(e) => handleFormatChange(e.target.value as OutputFormat)}
            className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPG</option>
            <option value="webp">WebP</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-zinc-400 text-sm mb-1">ファイル名</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={settings.outputName}
              onChange={(e) => handleOutputNameChange(e.target.value)}
              className="flex-1 bg-zinc-800 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50"
              placeholder="logo-resizer"
              disabled={!settings.useRename}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onChange({ ...settings, useRename: !settings.useRename })}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            settings.useRename
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${settings.useRename ? 'bg-white' : 'bg-zinc-600'}`} />
          リネーム
        </button>
        <button
          onClick={() => onChange({ ...settings, useNumbering: !settings.useNumbering })}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            settings.useNumbering
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${settings.useNumbering ? 'bg-white' : 'bg-zinc-600'}`} />
          ナンバリング
        </button>
      </div>

      <div>
        <label className="block text-zinc-400 text-sm mb-2">背景</label>
        <div className="flex flex-wrap gap-2">
          {(['white', 'black', 'transparent', 'custom'] as BackgroundType[]).map(
            (bg) => (
              <button
                key={bg}
                onClick={() => handleBackgroundChange(bg)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  settings.background === bg
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {bg === 'transparent' && '透明'}
                {bg === 'white' && '白'}
                {bg === 'black' && '黒'}
                {bg === 'custom' && 'カスタム'}
              </button>
            )
          )}
          {settings.background === 'custom' && (
            <input
              type="color"
              value={settings.customColor || '#ffffff'}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              className="w-10 h-8 rounded cursor-pointer"
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-zinc-400 text-sm mb-2">プリセット</label>
        <PresetButtons
          currentSize={settings.size}
          onSelect={(size) => onChange({ ...settings, size })}
        />
      </div>
    </div>
  )
}
