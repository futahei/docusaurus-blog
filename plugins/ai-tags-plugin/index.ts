// plugins/ai-tags-plugin/index.ts
import type { Plugin } from "@docusaurus/types";

import { generateTagsWithAI } from "../../src/tools/generateTags";

function normalizeTags(tags: unknown): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(String);
  return [String(tags)];
}

export default function aiTagsPlugin(): Plugin {
  return {
    name: "ai-tags-plugin",

    // markdown オプションをいじる
    configureMarkdown(markdownOptions) {
      const originalParse = markdownOptions.parseFrontMatter;

      markdownOptions.parseFrontMatter = async (params) => {
        // まずは元々の処理で front matter / content を取得
        const result = await originalParse(params);
        const frontMatter = result.frontMatter as {
          title?: string;
          tags?: string[] | string;
        };

        const { filePath, fileContent } = params;

        // blog の記事だけを対象にする（お好みで調整）
        if (!filePath.includes("/blog/")) {
          return result;
        }

        // すでに手動 tags があればそれを尊重
        const existingTags = normalizeTags(frontMatter.tags);
        if (existingTags.length > 0) {
          return result;
        }

        // Mastra（のラッパー関数）でタグ生成
        const aiTags = await generateTagsWithAI({
          title: frontMatter.title,
          content: fileContent,
          existingTags,
        });

        // Docusaurus の blog/docs は tags: string[] を素直に受け付けてくれる
        if (aiTags.length > 0) {
          result.frontMatter.tags = aiTags;
        }

        return result;
      };

      return markdownOptions;
    },
  };
}
