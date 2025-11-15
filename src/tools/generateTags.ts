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

既存タグ:
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
