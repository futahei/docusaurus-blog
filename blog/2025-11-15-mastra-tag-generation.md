---
slug: mastra-tag-generation
title: Docusaurus × Mastra でブログ記事に AI 自動タグ付け機能を作る
date: 2025-11-15
authors: [futahei]
---

## 背景

ブログ記事を投稿する際に、適切なタグを手動で付与するのは意外と手間です。 そこで、AI を活用して記事内容から自動的にタグを生成・付与する仕組みを Docusaurus ブログに組み込んでみました。

- 🔧 追加サーバー不要
- ⚡ ビルド時のみ AI を実行
- 🏷️ 既存の Docusaurus タグページ（/blog/tags/）をそのまま使える
- 🤖 AI フレームワークとして Mastra を利用（使ってみたかった）

この記事では、その実装手順とポイントを振り返ってみます！

※ 以下の記事は AI アシスタントを活用して作成されました。

<!-- truncate -->

## 📌 完成イメージ

ブログ記事 (front matter):

```md
---
title: AWS で React + Express アプリをデプロイする
date: 2025-11-03
# tags: [] ← 書かなくてOK
---
```

ビルド時に AI が記事内容を解析し、自動でタグを生成・付与します。

もちろんタグ一覧ページでも反映されます。

<!-- image: /img/blog/2025-11-15-mastra-tag-generation/tag-page.png -->

## 実装について

### 1. 全体のアーキテクチャ

今回実装した仕組みの流れはとてもシンプルです。

```txt
Docusaurus build
  ↓
markdown.parseFrontMatter フック
  ↓
generateTagsWithAI(title + content)
  ↓
Mastra エージェントがタグを生成
  ↓
frontMatter.tags に書き戻す
  ↓
Docusaurus が通常どおりタグページを生成
```

ポイントは、Mastra を HTTP サーバーとして立てるのではなく、ただのライブラリとして使うところ。

Docusaurus の中にすべて完結するため、デプロイ構成が変わりません。

### 2. Mastra を導入

まず Docusaurus プロジェクトに Mastra をインストールします。

```bash
npm install @mastra/core
```

そして .env に OpenAI のキーを設定します。

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Mastra のモデルルーターが自動でこのキーを参照し、`model: "openai/gpt-4o-mini"` という形式で簡単に LLM を呼び出せるようになります。

### 3. タグ生成ロジックを実装

`src/tools/generateTags.ts` を作成し、Mastra エージェントを定義します。

```ts
import { Agent } from "@mastra/core/agent";

const tagAgent = new Agent({
  name: "TagGenerator",
  instructions: `
あなたは技術ブログの記事にタグを付けるアシスタントです。

- 入力として「タイトル」「本文」「既存タグ(あれば)」が与えられます。
- 記事のトピックや技術要素が分かりやすくなるようなタグを日英混在で3〜8個程度提案してください。
- 「Docusaurus」「React」「AWS」「TypeScript」「GitHub Actions」「CI/CD」など、一般的な技術タグを優先してください。
- すでに existingTags に含まれているものは重複しないようにしてください。
- 出力は **JSON 配列 (string[]) のみ** を返してください。余計な文章は一切書かないでください。

例:
["Docusaurus", "React", "AWS", "CloudFront", "EC2"]
  `,
  model: "openai/gpt-5-mini",
});

export async function generateTagsWithAI(
  input: GenerateTagsInput
): Promise<string[]> {
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    console.log("Dev mode: skipping AI tag generation");
    return input.existingTags ?? [];
  }

  const { title, content, existingTags = [] } = input;

  // 既存タグがあればそれもプロンプトに含めつつ、重複しないようにしてもらう
  const existingText =
    existingTags.length > 0
      ? `既存タグ: ${existingTags.join(", ")}`
      : "既存タグはありません。";

  const prompt = `
以下は技術ブログの記事です。内容を読んで、適切なタグを JSON 配列として返してください。

タイトル:
${title ?? "(タイトルなし)"}

本文:
${content}

既存タグ
${existingText}

  `.trim();

  try {
    const response = await tagAgent.generate(prompt);
    const raw = (response.text ?? "").trim();

    // まずは JSON 配列として解釈を試みる
    let tags: string[] = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        tags = parsed.map(String);
      } else {
        // JSONだけど配列じゃなかった時の保険
        tags = [];
      }
    } catch {
      // JSON じゃなかった場合は、カンマ / 改行 / 日本語の読点で雑に split
      tags = raw
        .split(/[,、\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const merged = normalizeTags([...existingTags, ...tags]);
    return merged;
  } catch (e) {
    console.warn("Mastra tag agent failed, fallback to existing tags:", e);
    return existingTags;
  }
}

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
export type GenerateTagsInput = {
  title?: string;
  content: string;
  existingTags?: string[];
};

function normalizeTags(rawTags: string[]): string[] {
  const cleaned = rawTags.map((t) => t.trim()).filter(Boolean);

  // 重複除去（大文字小文字は雑に同一扱い）
  const seen = new Set<string>();
  const result: string[] = [];
  for (const tag of cleaned) {
    const key = tag.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(tag);
    }
  }
  return result;
}
```

ここでは：

- Mastra の Agent を使って LLM を呼び出し
- タグを JSON 配列で返すよう強制
- 重複や表記揺れを除去する

というロジックを入れています。

また、開発環境では AI 呼び出しをスキップして既存タグをそのまま返すようにしています。これでビルド時間の無駄遣いと API コストの浪費を防げます。

### 4. Docusaurus フックに組み込む

`docusaurus.config.ts` 内に `markdown.parseFrontMatter` フックを追加します。

```ts
import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";

import { generateTagsWithAI } from "./src/tools/generateTags";

const config: Config = {
  // ... 省略 ...

  markdown: {
    parseFrontMatter: async (params) => {
      const result = await params.defaultParseFrontMatter(params);

      const frontMatter = result.frontMatter as {
        title?: string;
        tags?: string[] | string;
        [key: string]: unknown;
      };

      const { filePath, fileContent } = params;

      // blog のみタグ自動生成を行う
      const normalizedFilePath = filePath.replace(/\\/g, "/");
      if (!normalizedFilePath.includes("/blog/")) {
        return result;
      }

      // AI でタグ生成
      const existingTags = normalizeTags(frontMatter.tags);
      try {
        const aiTags = await generateTagsWithAI({
          title: frontMatter.title,
          content: fileContent,
          existingTags,
        });

        if (aiTags.length > 0) {
          result.frontMatter.tags = aiTags;
        }
      } catch (e) {
        console.warn("AI tag generation failed", e);
      }

      return result;
    },
  },
};

export default config;

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function normalizeTags(tags: unknown): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(String);
  return [String(tags)];
}
```

## おわりに

以上で、Docusaurus ブログに AI 自動タグ付け機能を組み込むことができました！

- 既存のタグがあれば尊重しつつ、AI で補完
- なるべく Docusaurus 本体の仕組みを活かす
- 既存のブログ記事にも自動でタグが付与される

課題としては、ビルドするたびに AI を使って生成するのでタグが微妙に変わる可能性がある点です。将来的には一度生成したタグをキャッシュする仕組みも検討したいところです。

今回 Mastra を使ってみましたが、有効な使い方をできているかは微妙です...（笑）
今後さらにアイデアを練って、いろいろ試してみたいと思います。
