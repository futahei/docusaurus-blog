import React from "react";

import Socials from "@site/src/components/home/Socials";
import siteConfig from "@site/src/siteConfig";
import Layout from "@theme/Layout";

export default function Home() {
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

          <Socials items={siteConfig.socials} />
        </div>
      </main>
    </Layout>
  );
}
