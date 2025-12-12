export type OutputFormat = 'png' | 'jpeg' | 'webp'
export type BackgroundType = 'transparent' | 'white' | 'black' | 'custom'

export interface OutputSize {
  width: number
  height: number
}

export interface OutputSettings {
  size: OutputSize
  padding: number
  background: BackgroundType
  customColor?: string
  format: OutputFormat
  quality: number
  outputName: string
  useRename: boolean
  useNumbering: boolean
}

export interface PreviewSettings {
  containerWidth: number
  gap: number
  backgroundColor: string
}

export interface ResponsivePreset {
  label: string
  width: number
  icon: string
}

export interface LogoFile {
  id: string
  file: File
  name: string
  originalWidth: number
  originalHeight: number
  previewUrl: string
  status: 'loading' | 'ready' | 'processing' | 'done' | 'error'
  error?: string
}

export interface ProcessedLogo extends LogoFile {
  outputCanvas: HTMLCanvasElement
  outputBlob?: Blob
  outputUrl?: string
}

export interface PresetSize {
  label: string
  width: number
  height: number
}

export const SIZE_PRESETS: PresetSize[] = [
  { label: '横長', width: 400, height: 160 },
  { label: '正方形', width: 240, height: 240 },
  { label: '小', width: 200, height: 80 },
  { label: '大', width: 600, height: 240 },
  { label: 'Favicon', width: 64, height: 64 },
]

export const RESPONSIVE_PRESETS: ResponsivePreset[] = [
  { label: 'Mobile', width: 375, icon: 'DeviceMobile' },
  { label: 'Tablet', width: 768, icon: 'DeviceTablet' },
  { label: 'Desktop', width: 1200, icon: 'Desktop' },
]

export const DEFAULT_OUTPUT: OutputSettings = {
  size: { width: 400, height: 160 },
  padding: 0,
  background: 'white',
  format: 'webp',
  quality: 0.92,
  outputName: 'logo-resizer',
  useRename: true,
  useNumbering: true,
}

export const DEFAULT_PREVIEW: PreviewSettings = {
  containerWidth: 1200,
  gap: 24,
  backgroundColor: '#ffffff',
}
