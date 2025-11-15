import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";

import { generateTagsWithAI } from "./src/tools/generateTags";

const repo = "docusaurus-blog";
const isVercelPreview = process.env.VERCEL_ENV === "preview";

const config: Config = {
  title: "Futahei Blog",
  tagline: "技術ブログ",
  favicon: "img/favicon.ico",

  future: {
    v4: true,
  },

  url: "https://futahei.github.io",
  baseUrl: isVercelPreview ? "/" : `/${repo}/`,

  organizationName: "futahei",
  projectName: "docusaurus-blog",

  // 言語切替を無効 → locales を 1 言語のみに
  i18n: {
    defaultLocale: "ja",
    locales: ["ja"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          path: "docs",
          routeBasePath: "docs", // ドキュメント機能
          sidebarPath: require.resolve("./sidebars.js"),
        },
        blog: {
          path: "blog",
          routeBasePath: "blog",
          showReadingTime: true,
          postsPerPage: 10,
          tagsBasePath: "tags",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: "Futahei Blog",
      items: [
        { to: "/docs/intro", label: "Docs", position: "left" },
        { to: "/blog", label: "Blog", position: "left" },
        {
          type: "search",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "More",
          items: [
            {
              label: "Blog",
              to: "/blog",
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Futahei`,
    },
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    prism: {
      theme: require("prism-react-renderer").themes.github,
      darkTheme: require("prism-react-renderer").themes.dracula,
    },
  },

  customFields: {
    socials: [
      { label: "GitHub", href: "https://github.com/futahei" },
      { label: "X", href: "https://x.com/kohei_fttk" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/futahei/" },
    ],
  },

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
