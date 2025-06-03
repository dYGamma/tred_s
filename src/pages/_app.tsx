// src/pages/_app.tsx

import type { AppProps } from "next/app";
import { useEffect } from "react";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return <Component {...pageProps} />;
}
