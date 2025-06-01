// src/lib/getAllPosts.ts

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

// Интерфейс метаданных и контента поста
export interface PostMeta {
  slug: string;             // часть файла без .mdx
  title: string;            // заголовок поста из фронт-маттер
  date: string;             // дата из фронт-маттер (ISO-строка)
  description: string;      // описание/аннотация из фронт-маттер
  tags: string[];           // теги из фронт-маттер (или пустой массив)
  author: string | null;    // автор из фронт-маттер (или null)
  readingTime: string;      // расчётное время чтения (например, "3 min read")
  excerpt: string;          // предварительный текст (первые 200 символов)
  coverImage: string | null;// URL обложки (поле coverImage из фронт-маттер, или null)
  content: string;          // сам MDX-контент (без фронт-маттер)
}

// Путь к папке с MDX-файлами
const postsDirectory = path.join(process.cwd(), "src", "posts");

/**
 * getAllPosts
 * ---------------
 * Сканирует папку src/posts, читает все файлы с расширением .mdx,
 * парсит фронт-маттер и возвращает массив объектов PostMeta,
 * отсортированный по дате (от новых к старым).
 */
export function getAllPosts(): PostMeta[] {
  const filenames = fs
    .readdirSync(postsDirectory)
    .filter((fn) => fn.endsWith(".mdx"));

  const posts: PostMeta[] = filenames.map((filename) => {
    const fullPath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(fullPath, "utf-8");
    const { data, content } = matter(fileContents);
    const slug = filename.replace(/\.mdx$/, "");

    // Берём автора или null
    const author = typeof data.author === "string" ? data.author : null;
    const readStats = readingTime(content);

    // Берём coverImage или null
    const coverImage =
      typeof data.coverImage === "string" ? data.coverImage : null;

    // Создаём краткий превью (excerpt)
    const rawText = content.replace(/\n+/g, " ").trim();
    const excerpt =
      rawText.length > 200 ? rawText.slice(0, 200).trim() + "..." : rawText;

    return {
      slug,
      title: data.title as string,
      date: data.date as string,
      description: data.description as string,
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
      author,
      readingTime: readStats.text,
      excerpt,
      coverImage,
      content,
    };
  });

  // Сортируем по дате: новые (большая дата) идут раньше
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return posts;
}

/**
 * getPostBySlug
 * ---------------
 * Принимает slug (имя файла без .mdx), читает соответствующий файл,
 * парсит фронт-маттер и контент, возвращает объект PostMeta.
 */
export function getPostBySlug(slug: string): PostMeta {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(fileContents);

  const author = typeof data.author === "string" ? data.author : null;
  const readStats = readingTime(content);

  const coverImage =
    typeof data.coverImage === "string" ? data.coverImage : null;

  const rawText = content.replace(/\n+/g, " ").trim();
  const excerpt =
    rawText.length > 200 ? rawText.slice(0, 200).trim() + "..." : rawText;

  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    description: data.description as string,
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    author,
    readingTime: readStats.text,
    excerpt,
    coverImage,
    content,
  };
}
