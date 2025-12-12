まず docs/SPEC.md を読んで仕様を把握してください。

その後、以下の順序で実装を進めてください：

1. **プロジェクトセットアップ**
   ```bash
   npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-eslint
   npm install @phosphor-icons/react pica jszip
   npm install -D @types/pica
   ```

2. **型定義ファイル作成** (`src/types/logo-resizer.ts`)

3. **ユーティリティ関数** (`src/lib/`)

4. **カスタムフック** (`src/hooks/`)

5. **コンポーネント** (依存関係の少ないものから)

実装中は各ステップ完了後に動作確認してから次へ進んでください。
