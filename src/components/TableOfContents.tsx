// src/components/TableOfContents.tsx

"use client";

import { useEffect, useState } from "react";

/**
 * TableOfContents
 *
 * Компонент для автоматической генерации оглавления (TOC) на основе
 * заголовков <h2> и <h3> внутри контента статьи (MDX). 
 * Оглавление закреплено (position: sticky) и отображается только на больших экранах.
 */

interface Heading {
  id: string;
  text: string;
  level: number; // 2 для <h2>, 3 для <h3>
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    // После рендера MDX ищем все элементы <h2> и <h3> внутри статьи
    const elements = Array.from(document.querySelectorAll("article h2, article h3"));
    const hs: Heading[] = elements.map((el) => {
      const level = el.tagName === "H2" ? 2 : 3;
      return {
        id: el.id,
        text: el.textContent?.trim() || "",
        level,
      };
    });
    setHeadings(hs);
  }, []);

  if (headings.length === 0) {
    return null; // Если заголовков нет, не отображаем TOC
  }

  return (
    <nav className="hidden lg:block sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pr-4">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Содержание</p>
      <ul className="space-y-1">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
            <a
              href={`#${h.id}`}
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-sm transition-colors"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
