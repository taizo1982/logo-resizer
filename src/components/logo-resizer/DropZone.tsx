'use client'

import { useState, useCallback, useRef } from 'react'
import { CloudArrowUp } from '@phosphor-icons/react'
import { MAX_FILE_SIZE, MAX_FILES, VALID_TYPES } from '@/lib/imageUtils'

const VALID_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif', 'bmp', 'pdf', 'ai', 'psd', 'docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt', 'eps']

function isValidFile(file: File): boolean {
  const ext = file.name.toLowerCase().split('.').pop() || ''
  return VALID_TYPES.includes(file.type) || VALID_EXTENSIONS.includes(ext)
}

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void
  disabled?: boolean
  currentCount?: number
}

export function DropZone({ onFilesAdded, disabled = false, currentCount = 0 }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      if (disabled) return

      const files = Array.from(e.dataTransfer.files).filter(isValidFile)

      if (files.length > 0) {
        onFilesAdded(files)
      }
    },
    [disabled, onFilesAdded]
  )

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }, [disabled])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        onFilesAdded(files)
      }
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [onFilesAdded]
  )

  const remainingSlots = MAX_FILES - currentCount

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isDragOver ? 'border-zinc-500 bg-zinc-800/50' : 'border-zinc-700 hover:border-zinc-600'}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={[...VALID_TYPES, '.pdf', '.ai', '.psd', '.docx', '.xlsx', '.pptx', '.doc', '.xls', '.ppt', '.eps'].join(',')}
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <CloudArrowUp
        size={48}
        weight="light"
        className={`mx-auto mb-4 ${isDragOver ? 'text-zinc-400' : 'text-zinc-500'}`}
      />

      <p className="text-white mb-2">
        ここにファイルをドラッグ&ドロップ
      </p>
      <p className="text-zinc-400 text-sm mb-4">または クリックして選択</p>

      <div className="text-zinc-500 text-xs space-y-1">
        <p>対応形式: PNG, JPG, SVG, WebP, PDF, AI, PSD, EPS, Word, Excel, PowerPoint</p>
        <p>
          最大 {Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB / ファイル
          {remainingSlots < MAX_FILES && (
            <span className="ml-2">
              (残り {remainingSlots} ファイル)
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
