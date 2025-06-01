// src/components/Layout.tsx

"use client";

import { ReactNode } from "react";
import SEO from "./SEO";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ children, title, description }: LayoutProps) {
  return (
    <>
      {/* Метаданные страницы (title, description) */}
      <SEO title={title} description={description} />

      {/* Фиксированный Header с меню + переключателем темы */}
      <Header />

      {/* Основной контент страницы с отступом сверху (чтобы не перекрывало Header) */}
      <main className="container pt-24 pb-12">
        {children}
      </main>

      {/* Footer внизу */}
      <Footer />
    </>
  );
}
