'use client'

import { useState, useCallback } from 'react'
import { PencilSimple, Eye, Play, SpinnerGap } from '@phosphor-icons/react'
import type { OutputSettings, PreviewSettings, ProcessedLogo, LogoFile } from '@/types/logo-resizer'
import { DEFAULT_OUTPUT, DEFAULT_PREVIEW } from '@/types/logo-resizer'
import { useLogoManager } from '@/hooks/useLogoManager'
import { useImageProcessor } from '@/hooks/useImageProcessor'
import { useDownload } from '@/hooks/useDownload'
import { DropZone } from './DropZone'
import { SettingsPanel } from './SettingsPanel'
import { LogoGrid } from './LogoGrid'
import { GridPreview } from './GridPreview'
import { PreviewControls } from './PreviewControls'
import { DownloadBar } from './DownloadBar'
import { CropModal } from './CropModal'

type TabMode = 'edit' | 'preview'

export function LogoResizer() {
  const [activeTab, setActiveTab] = useState<TabMode>('edit')
  const [outputSettings, setOutputSettings] = useState<OutputSettings>(DEFAULT_OUTPUT)
  const [previewSettings, setPreviewSettings] = useState<PreviewSettings>(DEFAULT_PREVIEW)
  const [cropTarget, setCropTarget] = useState<LogoFile | null>(null)

  const { logos, addFiles, removeLogo, clearAll: clearLogos, updateLogoWithBlob, moveLogo } = useLogoManager()
  const { processedLogos, processAll, isProcessing, progress, clearProcessed, reorderLogos } = useImageProcessor()
  const { downloadOne, downloadAll, downloadAsZip, isDownloading } = useDownload()

  const handleStartProcess = useCallback(async () => {
    const readyLogos = logos.filter((l) => l.status === 'ready')
    if (readyLogos.length > 0) {
      await processAll(readyLogos, outputSettings)
    }
  }, [logos, outputSettings, processAll])

  const handleClearAll = useCallback(() => {
    clearLogos()
    clearProcessed()
  }, [clearLogos, clearProcessed])

  const handleRemoveLogo = useCallback(
    (id: string) => {
      removeLogo(id)
    },
    [removeLogo]
  )

  const handleDownloadSingle = useCallback(
    (logo: ProcessedLogo) => {
      downloadOne(logo, outputSettings)
    },
    [downloadOne, outputSettings]
  )

  const handleDownloadAll = useCallback(() => {
    downloadAll(processedLogos, outputSettings)
  }, [downloadAll, processedLogos, outputSettings])

  const handleDownloadZip = useCallback(async () => {
    await downloadAsZip(processedLogos, outputSettings)
  }, [downloadAsZip, processedLogos, outputSettings])

  const handleCropStart = useCallback((logo: LogoFile) => {
    setCropTarget(logo)
  }, [])

  const handleCropComplete = useCallback(async (croppedBlob: Blob) => {
    if (cropTarget) {
      await updateLogoWithBlob(cropTarget.id, croppedBlob)
      clearProcessed()
    }
    setCropTarget(null)
  }, [cropTarget, updateLogoWithBlob, clearProcessed])

  const handleCropClose = useCallback(() => {
    setCropTarget(null)
  }, [])

  const handleMoveLeft = useCallback((id: string) => {
    moveLogo(id, 'left')
    clearProcessed()
  }, [moveLogo, clearProcessed])

  const handleMoveRight = useCallback((id: string) => {
    moveLogo(id, 'right')
    clearProcessed()
  }, [moveLogo, clearProcessed])

  const readyCount = logos.filter((l) => l.status === 'ready').length
  const hasReadyLogos = readyCount > 0
  const hasProcessedLogos = processedLogos.filter((l) => l.outputBlob).length > 0

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Logo Resizer</h1>

          <div className="flex bg-zinc-900 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                activeTab === 'edit'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <PencilSimple size={18} weight="light" />
              Edit
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                activeTab === 'preview'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Eye size={18} weight="light" />
              Preview
            </button>
          </div>
        </header>

        {/* Edit Mode */}
        {activeTab === 'edit' && (
          <div className="space-y-6">
            <DropZone
              onFilesAdded={addFiles}
              currentCount={logos.length}
            />

            <SettingsPanel
              settings={outputSettings}
              onChange={setOutputSettings}
            />

            {/* Process Button */}
            {logos.length > 0 && (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleStartProcess}
                  disabled={!hasReadyLogos || isProcessing}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <SpinnerGap size={20} weight="light" className="animate-spin" />
                      処理中... ({progress.current}/{progress.total})
                    </>
                  ) : (
                    <>
                      <Play size={20} weight="fill" />
                      リサイズ開始 ({readyCount}枚)
                    </>
                  )}
                </button>
                {hasProcessedLogos && !isProcessing && (
                  <span className="text-green-400 text-sm">
                    処理完了
                  </span>
                )}
              </div>
            )}

            <LogoGrid
              logos={hasProcessedLogos ? processedLogos : logos}
              onRemove={handleRemoveLogo}
              onDownload={hasProcessedLogos ? handleDownloadSingle : undefined}
              onCrop={!hasProcessedLogos ? handleCropStart : undefined}
              onMoveLeft={!hasProcessedLogos ? handleMoveLeft : undefined}
              onMoveRight={!hasProcessedLogos ? handleMoveRight : undefined}
              showProcessed={hasProcessedLogos}
            />
          </div>
        )}

        {/* Preview Mode */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <PreviewControls
              settings={previewSettings}
              onChange={setPreviewSettings}
            />

            <GridPreview
              logos={processedLogos}
              settings={previewSettings}
              onReorder={reorderLogos}
            />
          </div>
        )}

        {/* Download Bar - Always visible when logos exist */}
        {logos.length > 0 && (
          <DownloadBar
            logos={processedLogos}
            onClearAll={handleClearAll}
            onDownloadAll={handleDownloadAll}
            onDownloadZip={handleDownloadZip}
            isProcessing={isProcessing}
            isDownloading={isDownloading}
          />
        )}
      </div>

      {/* Crop Modal */}
      {cropTarget && (
        <CropModal
          imageUrl={cropTarget.previewUrl}
          onCrop={handleCropComplete}
          onClose={handleCropClose}
        />
      )}
    </div>
  )
}
