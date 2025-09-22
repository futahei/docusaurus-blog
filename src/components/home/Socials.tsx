import React from "react";
import { SiGithub, SiLinkedin, SiX } from "react-icons/si";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import styles from "./Socials.module.css";

type SocialType = "GitHub" | "X" | "LinkedIn";

type Social = {
  label: SocialType;
  href: string;
};

type Props = {
  size?: number; // 直径(px)
};

const IconForLabel: Record<SocialType, React.ReactNode> = {
  GitHub: <SiGithub size={20} />,
  LinkedIn: <SiLinkedin size={20} />,
  X: <SiX size={20} />,
};

export default function Socials({ size = 40 }: Props) {
  const { siteConfig } = useDocusaurusContext();
  const socials = siteConfig.customFields.socials as Social[];
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
