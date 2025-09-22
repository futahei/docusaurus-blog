import React, { JSX } from "react";
import { SiGithub, SiLinkedin, SiX } from "react-icons/si";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import styles from "./Socials.module.css";

export namespace Socials {
  /**
   * {@link Socials} コンポーネントのプロパティ定義
   */
  export interface Props {
    size?: number; // 直径
  }
}

const IconForLabel: Record<SocialType, React.ReactNode> = {
  GitHub: <SiGithub size={20} />,
  LinkedIn: <SiLinkedin size={20} />,
  X: <SiX size={20} />,
};

/**
 * ソーシャルリンク一覧を表示するコンポーネント
 *
 * @param props プロパティ
 * @returns 描画内容
 */
export function Socials({ size = 40 }: Socials.Props): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const socials = getSocials(siteConfig.customFields?.socials);

  return (
    <div className={styles.wrap} role="navigation" aria-label="Social links">
      {socials.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={s.label}
          className={styles.btn}
          style={{ width: size, height: size }}
        >
          {IconForLabel[s.label] ?? s.label}
        </a>
      ))}
    </div>
  );
}

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

type SocialType = "GitHub" | "X" | "LinkedIn";

type Social = {
  label: SocialType;
  href: string;
};

const SOCIAL_LABELS: ReadonlyArray<SocialType> = ["GitHub", "X", "LinkedIn"];

const isSocialLabel = (value: unknown): value is SocialType =>
  typeof value === "string" && SOCIAL_LABELS.some((label) => label === value);

const isSocial = (value: unknown): value is Social => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const { label, href } = value as { label?: unknown; href?: unknown };
  return isSocialLabel(label) && typeof href === "string";
};

const getSocials = (value: unknown): Social[] =>
  Array.isArray(value) ? value.filter(isSocial) : [];
