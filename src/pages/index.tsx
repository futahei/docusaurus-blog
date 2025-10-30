import React from "react";

import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

const Home: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();
  const { title, tagline } = siteConfig;

  return (
    <Layout title={title} description={tagline as string}>
      <main
        style={{ padding: "4rem 1rem", textAlign: "center", minHeight: "60vh" }}
      >
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1.5rem" }}>{title}</h1>
        {tagline && (
          <p style={{ fontSize: "1.25rem", marginBottom: "2rem" }}>{tagline}</p>
        )}
        <Link className="button button--primary button--lg" to="/blog">
          記事を読む
        </Link>
      </main>
    </Layout>
  );
};

export default Home;
