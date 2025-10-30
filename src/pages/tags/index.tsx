import type { JSX } from "react";
import React, { useEffect, useState } from "react";

import clsx from "clsx";

import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

import styles from "./index.module.css";

type TagSummary = {
  label: string;
  permalink: string;
  count: number;
};

type TagsJsonModule = {
  tags?: TagSummary[];
};

type WebpackContext<T> = {
  keys(): string[];
  (id: string): T;
};

declare global {
  interface ImportMeta {
    webpackContext?<T>(
      request: string,
      options?: {
        recursive?: boolean;
        regExp?: RegExp;
      }
    ): WebpackContext<T>;
  }
}

const TAGS_CONTEXT_DIRECTORY =
  "@generated/docusaurus-plugin-content-blog/default/p";
const TAGS_FILE_PATTERN = /blog-tags-.*\.json$/;

function loadBlogTags(): TagSummary[] {
  if (typeof import.meta.webpackContext !== "function") {
    return [];
  }

  try {
    const tagsContext = import.meta.webpackContext<TagsJsonModule>(
      TAGS_CONTEXT_DIRECTORY,
      {
        recursive: false,
        regExp: TAGS_FILE_PATTERN,
      }
    );

    return tagsContext
      .keys()
      .flatMap((key) => {
        const module = tagsContext(key);
        return module?.tags ?? [];
      })
      .filter((tag) => tag.count > 0);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to load blog tags", error);
    }
    return [];
  }
}

export default function TagsPage(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const [tags, setTags] = useState<TagSummary[]>([]);

  useEffect(() => {
    const sorted = loadBlogTags().sort((a, b) =>
      a.label.localeCompare(b.label, "ja")
    );
    setTags(sorted);
  }, []);

  return (
    <Layout
      title={`${siteConfig.title} | タグ一覧`}
      description={`${siteConfig.tagline} のタグ一覧ページ`}
    >
      <header className={clsx("hero hero--primary", styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">タグ一覧</h1>
          <p className={clsx("hero__subtitle", styles.heroSubtitle)}>
            興味のあるトピックから記事を探してみましょう。
          </p>
        </div>
      </header>
      <main className={styles.main}>
        <section className="container">
          {tags.length === 0 ? (
            <p>まだタグが設定された記事はありません。</p>
          ) : (
            <ul className={styles.tagList}>
              {tags.map((tag) => (
                <li key={tag.permalink} className={styles.tagItem}>
                  <Link className={styles.tagLink} to={tag.permalink}>
                    <span className={styles.tagLabel}>#{tag.label}</span>
                    <span className={styles.tagCount}>
                      {tag.count}
                      <span className={styles.tagCountUnit}>記事</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </Layout>
  );
}
