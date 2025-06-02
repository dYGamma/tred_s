// src/lib/db.ts

import fs from "fs";
import path from "path";
import matter from "gray-matter";

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

// Заменяем /data/posts → src/posts
const postsDirectory = path.join(process.cwd(), "src", "posts");

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

    // Для простоты чтения времени можно не считать, либо подключить reading-time
    return {
      slug,
      title: data.title,
      description: data.description || "",
      date: data.date,
      tags: Array.isArray(data.tags) ? data.tags : [],
      author: data.author || null,
      readingTime: data.readingTime || "",
      coverImage: data.coverImage || null,
      content, // если нужно
    };
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlugFromDB(slug: string): PostMeta | null {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  const fileContents = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(fileContents);
  return {
    slug,
    title: data.title,
    description: data.description || "",
    date: data.date,
    tags: Array.isArray(data.tags) ? data.tags : [],
    author: data.author || null,
    readingTime: data.readingTime || "",
    coverImage: data.coverImage || null,
    content,
  };
}
