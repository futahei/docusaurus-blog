import React from "react";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Socials from "@site/src/components/home/Socials";
import Layout from "@theme/Layout";

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="TOP" description="技術ブログ">
      <main
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: "60vh",
          padding: "4rem 1rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: "2.25rem",
              lineHeight: 1.2,
              marginBottom: "1.5rem",
            }}
          >
            {siteConfig.title}
          </h1>
          <Socials />
        </div>
      </main>
    </Layout>
  );
}
