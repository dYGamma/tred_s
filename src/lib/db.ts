// src/lib/db.ts

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import removeMd from "remove-markdown";

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content?: string;
  author?: string | null;
  readingTime?: string;
  coverImage?: string | null;
}

const postsDirectory = path.join(process.cwd(), "src", "posts");

// Вспомогательная функция: на вход получает «сырое» содержимое MDX,
// возвращает строку вида "3 min read"
function calcReadingTime(rawContent: string): string {
  // 1) Убираем markdown/MDX-разметку (оставляем только «чистый» текст)
  const plainText = removeMd(rawContent);
  // 2) Считаем статистику по словам/времени чтения
  const stats = readingTime(plainText, { wordsPerMinute: 200 });
  // 3) Округляем вверх и гарантируем минимум 1 минута
  const minutesCeil = Math.max(1, Math.ceil(stats.minutes));
  return `${minutesCeil} min read`;
}

export function getAllPostsFromDB(): PostMeta[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const filenames = fs
    .readdirSync(postsDirectory)
    .filter((fn) => fn.endsWith(".mdx"));

  const posts: PostMeta[] = filenames.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const fullPath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(fullPath, "utf-8");
    const { data, content } = matter(fileContents);

    // Считаем readingTime «на лету»
    const rtText = calcReadingTime(content);

    return {
      slug,
      title: data.title,
      description: data.description || "",
      date: data.date,
      tags: Array.isArray(data.tags) ? data.tags : [],
      author: data.author || null,
      readingTime: rtText,
      coverImage: data.coverImage || null,
      content,
    };
  });

  // Сортируем по дате (сначала более свежие)
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlugFromDB(slug: string): PostMeta | null {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(fileContents);

  const rtText = calcReadingTime(content);

  return {
    slug,
    title: data.title,
    description: data.description || "",
    date: data.date,
    tags: Array.isArray(data.tags) ? data.tags : [],
    author: data.author || null,
    readingTime: rtText,
    coverImage: data.coverImage || null,
    content,
  };
}
