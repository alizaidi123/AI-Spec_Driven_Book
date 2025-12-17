import React, { useState, useEffect } from "react";
import Layout from "@theme-original/Layout";
import BookChatWidget from "../../components/BookChatWidget";

export default function LayoutWrapper(props: any) {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Read the current theme from the document element
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setColorMode(currentTheme === 'dark' ? 'dark' : 'light');

    // Set up a MutationObserver to watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme');
          setColorMode(newTheme === 'dark' ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Layout {...props}>
      {props.children}
      <BookChatWidget colorMode={colorMode} />
    </Layout>
  );
}