// src/lib/getPostBySlug.ts

import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface PostMeta {
  slug: string;         // имя файла без расширения
  title: string;        // заголовок из front-matter
  date: string;         // дата из front-matter
  description: string;  // описание из front-matter
  tags: string[];       // теги из front-matter
  content: string;      // остальной MDX-контент (после front-matter)
}

const postsDirectory = path.join(process.cwd(), "src", "posts");

/**
 * getPostBySlug
 *
 * Получает slug (имя файла без .mdx), читает соответствующий файл
 * из папки src/posts, парсит YAML-фронт-маттер и возвращает объект PostMeta.
 *
 * @param slug - строка, например "2025-05-29-rucaptcha"
 * @returns PostMeta — объект с метаданными и текстом MDX (без front-matter).
 */
export function getPostBySlug(slug: string): PostMeta {
  // Составляем путь к файлу-мдх
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  // Читаем содержимое файла целиком
  const fileContents = fs.readFileSync(fullPath, "utf-8");

  // Парсим фронт-маттер и тело контента
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    description: data.description as string,
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    content,
  };
}
