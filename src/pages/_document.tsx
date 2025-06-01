// src/pages/_document.tsx

import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ru" className="scroll-smooth">
      <Head>
        {/* Пример: подключение кастомных шрифтов (если нужно) */}
        {/* <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        /> */}

        {/* Вставка фавиконки */}
        <link rel="icon" href="/favicon.ico" />

        {/* Дополнительные мета-теги, которые не зависят от страниц */}
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
