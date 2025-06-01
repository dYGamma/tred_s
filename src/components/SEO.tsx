// src/components/SEO.tsx

import Head from "next/head";
import { usePathname } from "next/navigation";

interface SEOProps {
  title?: string;
  description?: string;
}

export default function SEO({ title, description }: SEOProps) {
  // Название сайта по умолчанию
  const siteName = "My Blog";
  // Текущий путь (для построения канонических URL)
  const pathname = usePathname() || "/";
  // Полный заголовок: "Заголовок страницы | My Blog"
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  // Канонический URL: если сайт хостится на GitHub Pages, замените на ваш домен:
  // const siteUrl = "https://<your-username>.github.io/<repo-name>";
  const siteUrl = "https://<your-username>.github.io/<repo-name>";
  const canonicalUrl = `${siteUrl}${pathname}`;

  return (
    <Head>
      {/* Базовые мета-теги */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || "My personal blog"} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph (Facebook, LinkedIn и пр.) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || ""} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      {/* Подставьте собственную картинку для превью при шаринге */}
      <meta property="og:image" content={`${siteUrl}/images/og-image.png`} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || ""} />
      <meta name="twitter:image" content={`${siteUrl}/images/og-image.png`} />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      {/* Apple Touch Icon */}
      <link rel="apple-touch-icon" href="/images/logo.png" />

      {/* Mobile viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Дополнительные мета-теги (по необходимости) */}
      {/* <meta name="author" content="Your Name" /> */}
      {/* <meta name="keywords" content="blog, next.js, mdx, react, tailwindcss" /> */}
    </Head>
  );
}
