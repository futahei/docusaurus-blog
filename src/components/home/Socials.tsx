import React from "react";
import { SiGithub, SiLinkedin, SiX } from "react-icons/si";

import styles from "./Socials.module.css";

type Social = {
  label: string;
  href: string;
};

type Props = {
  items: Social[];
  size?: number; // 直径(px)
};

const IconForLabel: Record<string, React.ReactNode> = {
  GitHub: <SiGithub size={20} />,
  LinkedIn: <SiLinkedin size={20} />,
  X: <SiX size={20} />,
};

export default function Socials({ items, size = 40 }: Props) {
  return (
    <div className={styles.wrap} role="navigation" aria-label="Social links">
      {items.map((s) => (
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
