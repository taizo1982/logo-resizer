# Logo Resizer - 詳細仕様書

## 概要

WEBサイトでクライアントロゴを並べて表示する際に、異なるフォーマット・サイズのロゴ画像を統一サイズに変換するツール。グリッドプレビュー機能でサイト上での見た目を事前確認できる。

## 機能一覧

### コア機能

| 機能 | 説明 |
|------|------|
| 画像アップロード | ドラッグ&ドロップ、複数ファイル対応 |
| リサイズ処理 | アスペクト比維持、中央配置 |
| 出力設定 | サイズ、パディング、背景色、形式 |
| プリセットサイズ | 横長/正方形/小/大/Favicon |
| グリッドプレビュー | サイト上での並び方を確認 |
| ダウンロード | 個別 / ZIP一括 |

### 制約

- 対応形式: PNG, JPG, SVG, WebP, GIF
- ファイルサイズ上限: 10MB
- 一度の処理上限: 50ファイル

---

## 型定義

```typescript
// src/types/logo-resizer.ts

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
  quality: number // 0.0 - 1.0
}

export interface PreviewSettings {
  containerWidth: number
  gap: number
  backgroundColor: string
}

export interface ResponsivePreset {
  label: string
  width: number
  icon: string // Phosphor icon name
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
```

### デフォルト値

```typescript
export const SIZE_PRESETS: PresetSize[] = [
  { label: '横長', width: 200, height: 80 },
  { label: '正方形', width: 120, height: 120 },
  { label: '小', width: 100, height: 40 },
  { label: '大', width: 300, height: 120 },
  { label: 'Favicon', width: 32, height: 32 },
]

export const RESPONSIVE_PRESETS: ResponsivePreset[] = [
  { label: 'Mobile', width: 375, icon: 'DeviceMobile' },
  { label: 'Tablet', width: 768, icon: 'DeviceTablet' },
  { label: 'Desktop', width: 1200, icon: 'Desktop' },
]

export const DEFAULT_OUTPUT: OutputSettings = {
  size: { width: 200, height: 80 },
  padding: 10,
  background: 'transparent',
  format: 'png',
  quality: 0.92,
}

export const DEFAULT_PREVIEW: PreviewSettings = {
  containerWidth: 1200,
  gap: 24,
  backgroundColor: '#ffffff',
}
```

---

## コンポーネント構成

```
src/components/logo-resizer/
  LogoResizer.tsx       # メインコンテナ
  DropZone.tsx          # アップロードエリア
  SettingsPanel.tsx     # 出力設定
  PresetButtons.tsx     # サイズプリセット
  LogoGrid.tsx          # ロゴ一覧（編集モード）
  LogoCard.tsx          # 個別ロゴカード
  GridPreview.tsx       # サイトプレビュー
  PreviewControls.tsx   # プレビュー設定
  DownloadBar.tsx       # ダウンロードアクション
```

### 1. LogoResizer.tsx

メインコンテナ。状態管理と子コンポーネントの配置。

```typescript
interface LogoResizerState {
  logos: LogoFile[]
  outputSettings: OutputSettings
  previewSettings: PreviewSettings
  activeTab: 'edit' | 'preview'
  isProcessing: boolean
}
```

### 2. DropZone.tsx

```typescript
interface DropZoneProps {
  onFilesAdded: (files: File[]) => void
  maxFileSize?: number      // default: 10MB
  maxFiles?: number         // default: 50
  disabled?: boolean
}

// 状態
// - default: 点線ボーダー + CloudArrowUp アイコン
// - dragover: ボーダー色変更 (zinc-500) + 背景ハイライト
// - disabled: opacity-50
```

### 3. SettingsPanel.tsx

```typescript
interface SettingsPanelProps {
  settings: OutputSettings
  onChange: (settings: OutputSettings) => void
}

// 含まれる入力
// - サイズ: width × height (number input)
// - パディング: 0-50px (slider)
// - 背景色: transparent / white / black / custom
// - カラーピッカー: (customの場合のみ表示)
// - 出力形式: PNG / JPG / WebP (select)
// - プリセットボタン: PresetButtons
```

### 4. GridPreview.tsx（新規）

サイト上での並び方をシミュレート。

```typescript
interface GridPreviewProps {
  logos: ProcessedLogo[]
  settings: PreviewSettings
  onSettingsChange: (settings: PreviewSettings) => void
}

// 機能
// - 指定幅のコンテナ内でロゴをグリッド配置
// - flexbox wrap で自動折り返し
// - gap調整可能
// - 背景色は白固定（設定で変更可能にしてもOK）
// - レスポンシブプリセットボタン (Mobile/Tablet/Desktop)
```

### 5. PreviewControls.tsx

```typescript
interface PreviewControlsProps {
  settings: PreviewSettings
  onChange: (settings: PreviewSettings) => void
  presets: ResponsivePreset[]
}

// UI
// - コンテナ幅: number input + プリセットボタン
// - Gap: number input または slider
// - レスポンシブプリセット: アイコンボタン3つ
```

### 6. DownloadBar.tsx

```typescript
interface DownloadBarProps {
  logos: ProcessedLogo[]
  onDownloadAll: () => void
  onDownloadZip: () => void
  isProcessing: boolean
}

// 表示
// - 処理済みファイル数: "6 files ready"
// - [Download All] ボタン（個別連続DL）
// - [Download ZIP] ボタン
```

---

## カスタムフック

### useImageProcessor.ts

```typescript
import Pica from 'pica'

interface UseImageProcessorReturn {
  processImage: (file: File, settings: OutputSettings) => Promise<ProcessedLogo>
  processAll: (logos: LogoFile[], settings: OutputSettings) => Promise<ProcessedLogo[]>
  isProcessing: boolean
  progress: { current: number; total: number }
}

export function useImageProcessor(): UseImageProcessorReturn
```

### useLogoManager.ts

```typescript
interface UseLogoManagerReturn {
  logos: LogoFile[]
  addFiles: (files: File[]) => Promise<void>
  removeLogo: (id: string) => void
  clearAll: () => void
}

export function useLogoManager(maxFileSize: number): UseLogoManagerReturn
```

### useDownload.ts

```typescript
interface UseDownloadReturn {
  downloadSingle: (logo: ProcessedLogo, settings: OutputSettings) => void
  downloadZip: (logos: ProcessedLogo[], settings: OutputSettings) => Promise<void>
  isDownloading: boolean
}

export function useDownload(): UseDownloadReturn
```

---

## 画像処理ベストプラクティス

### Pica によるリサイズ

```typescript
import Pica from 'pica'

const pica = new Pica()

async function resizeWithPica(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): Promise<HTMLCanvasElement> {
  const targetCanvas = document.createElement('canvas')
  targetCanvas.width = targetWidth
  targetCanvas.height = targetHeight

  await pica.resize(sourceCanvas, targetCanvas, {
    quality: 3,
    alpha: true,
    unsharpAmount: 80,
    unsharpRadius: 0.6,
    unsharpThreshold: 2,
  })

  return targetCanvas
}
```

### 背景付きCanvas生成

```typescript
function createCanvasWithBackground(
  width: number,
  height: number,
  background: BackgroundType,
  customColor?: string
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  if (background !== 'transparent') {
    const colors: Record<string, string> = {
      white: '#ffffff',
      black: '#000000',
      custom: customColor || '#ffffff',
    }
    ctx.fillStyle = colors[background]
    ctx.fillRect(0, 0, width, height)
  }

  return canvas
}
```

### アスペクト比維持フィット計算

```typescript
function calculateFitDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number,
  padding: number
): { width: number; height: number; x: number; y: number } {
  const availableWidth = maxWidth - padding * 2
  const availableHeight = maxHeight - padding * 2

  const scale = Math.min(
    availableWidth / srcWidth,
    availableHeight / srcHeight
  )

  const width = srcWidth * scale
  const height = srcHeight * scale
  const x = (maxWidth - width) / 2
  const y = (maxHeight - height) / 2

  return { width, height, x, y }
}
```

### ファイルサイズバリデーション

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'ファイルサイズが10MBを超えています' }
  }

  const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'サポートされていない形式です' }
  }

  return { valid: true }
}
```

---

## UI レイアウト

### メイン画面（編集モード）

```
┌─────────────────────────────────────────────────────────┐
│  Logo Resizer                        [Edit] [Preview]  │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────┐  │
│  │                                                   │  │
│  │         ここにファイルをドラッグ&ドロップ          │  │
│  │              または クリックして選択              │  │
│  │                                                   │  │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  出力設定                                               │
│  サイズ [200] × [80] px    パディング [──●──] 10px     │
│  背景 [透明 ▼]   形式 [PNG ▼]                          │
│  ┌─────┐ ┌─────┐ ┌───┐ ┌───┐ ┌───────┐               │
│  │横長 │ │正方形│ │小 │ │大 │ │Favicon│               │
│  └─────┘ └─────┘ └───┘ └───┘ └───────┘               │
├─────────────────────────────────────────────────────────┤
│  アップロード済み (6)                                   │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ [img]  │ │ [img]  │ │ [img]  │ │ [img]  │          │
│  │ logo1  │ │ logo2  │ │ logo3  │ │ logo4  │          │
│  │ 400×100│ │ 200×200│ │ 150×60 │ │ 300×80 │          │
│  │ [×][↓] │ │ [×][↓] │ │ [×][↓] │ │ [×][↓] │          │
│  └────────┘ └────────┘ └────────┘ └────────┘          │
├─────────────────────────────────────────────────────────┤
│  [Clear All]              [Download All] [Download ZIP] │
└─────────────────────────────────────────────────────────┘
```

### プレビューモード

```
┌─────────────────────────────────────────────────────────┐
│  Logo Resizer                        [Edit] [Preview]  │
├─────────────────────────────────────────────────────────┤
│  プレビュー設定                                         │
│  幅 [1200]px  Gap [24]px   [📱][📱][🖥] Mobile/Tablet/PC │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐    │
│  │ (白背景のプレビューエリア)                      │    │
│  │                                                 │    │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │    │
│  │  │logo│ │logo│ │logo│ │logo│ │logo│ │logo│   │    │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘   │    │
│  │                                                 │    │
│  └─────────────────────────────────────────────────┘    │
│                     ↑ 1200px ↑                          │
├─────────────────────────────────────────────────────────┤
│  [Clear All]              [Download All] [Download ZIP] │
└─────────────────────────────────────────────────────────┘
```

---

## スタイルガイド

### カラー

```
背景:     bg-zinc-950 (メイン), bg-zinc-900 (カード)
テキスト:  text-white, text-zinc-400 (サブ)
ボーダー:  border-zinc-800, hover:border-zinc-600
アクセント: bg-zinc-700 (ボタン), bg-blue-600 (プライマリ)
```

### コンポーネント

```
カード:    bg-zinc-900 rounded-xl p-4
ボタン:    px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700
入力:      bg-zinc-800 rounded-lg px-3 py-2 text-sm
```

---

## ファイル構成

```
logo-resizer/
├── CLAUDE.md
├── docs/
│   └── SPEC.md
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── logo-resizer/
│   │       ├── LogoResizer.tsx
│   │       ├── DropZone.tsx
│   │       ├── SettingsPanel.tsx
│   │       ├── PresetButtons.tsx
│   │       ├── LogoGrid.tsx
│   │       ├── LogoCard.tsx
│   │       ├── GridPreview.tsx
│   │       ├── PreviewControls.tsx
│   │       └── DownloadBar.tsx
│   ├── hooks/
│   │   ├── useImageProcessor.ts
│   │   ├── useLogoManager.ts
│   │   └── useDownload.ts
│   ├── lib/
│   │   ├── imageUtils.ts
│   │   └── downloadUtils.ts
│   └── types/
│       └── logo-resizer.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## 実装順序

1. プロジェクトセットアップ (`create-next-app`)
2. 型定義 (`types/logo-resizer.ts`)
3. ユーティリティ (`lib/imageUtils.ts`, `lib/downloadUtils.ts`)
4. フック (`hooks/`)
5. UIコンポーネント（下から順に）
   - PresetButtons → SettingsPanel
   - DropZone
   - LogoCard → LogoGrid
   - PreviewControls → GridPreview
   - DownloadBar
   - LogoResizer
6. ページ統合 (`app/page.tsx`)
7. 動作確認・調整

---

## 依存パッケージ

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "react-dom": "^18",
    "@phosphor-icons/react": "^2",
    "pica": "^9",
    "jszip": "^3"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/pica": "^9",
    "tailwindcss": "^3",
    "postcss": "^8",
    "autoprefixer": "^10",
    "eslint": "^8",
    "eslint-config-next": "^14"
  }
}
```
