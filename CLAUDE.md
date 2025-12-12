# Logo Resizer

複数のロゴ画像を統一サイズに変換し、WEBサイト上での並び方をプレビューできるツール。

## Commands

```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm run lint     # ESLint実行
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Phosphor Icons (`@phosphor-icons/react`)
- Pica (画像リサイズ)
- JSZip (一括ダウンロード)

## Directory Structure

```
src/
  app/
    page.tsx              # メインページ
    layout.tsx
  components/
    logo-resizer/         # 機能別コンポーネント
  hooks/                  # カスタムフック
  lib/                    # ユーティリティ
  types/                  # 型定義
```

## Key Rules

- コンポーネントは `'use client'` 付きの関数コンポーネント
- アイコンは Phosphor Icons の `weight="light"` を基本使用
- 画像リサイズには必ず Pica を使用（Canvas直接描画は品質が低い）
- ファイルサイズ上限: 10MB

## Reference

詳細仕様は `docs/SPEC.md` を参照。
