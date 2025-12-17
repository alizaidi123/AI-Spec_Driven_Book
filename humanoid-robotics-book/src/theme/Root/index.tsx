import React from "react";
import Root from "@theme-original/Root";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function RootWrapper(props: any) {
  const { siteConfig } = useDocusaurusContext();
  const ragApiBaseUrl =
    (siteConfig.customFields as any)?.ragApiBaseUrl || "http://localhost:8000";

  React.useEffect(() => {
    (window as any).RAG_API_BASE_URL = ragApiBaseUrl;
  }, [ragApiBaseUrl]);

  return (
    <Root {...props} />
  );
}
