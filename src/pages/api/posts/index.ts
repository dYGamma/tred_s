// src/pages/api/posts/index.ts

import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import slugify from "slugify";
import matter from "gray-matter";

// Интерфейс входных данных для создания нового поста
interface CreatePostBody {
  type: "create";
  secret: string;
  data: {
    title: string;
    date: string;           // "YYYY-MM-DD"
    description?: string;
    tags?: string;          // "tag1,tag2,tag3"
    content: string;        // MDX-тело статьи
  };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Путь к папке с .mdx
  const postsDir = path.join(process.cwd(), "src", "posts");

  // Если папки нет — создаём
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  // 1) Обрабатываем GET /api/posts — вернуть список
  if (req.method === "GET") {
    try {
      const files = fs
        .readdirSync(postsDir)
        .filter((f) => f.endsWith(".mdx"));
      const allPosts = files.map((filename) => {
        const slug = filename.replace(/\.mdx$/, "");
        const fullPath = path.join(postsDir, filename);
        const fileContents = fs.readFileSync(fullPath, "utf-8");
        const { data } = matter(fileContents);

        return {
          slug,
          title: data.title,
          date: data.date,
          description: data.description || "",
          tags: Array.isArray(data.tags) ? data.tags : [],
        };
      });

      // Сортируем по дате (новые в начале)
      allPosts.sort((a, b) => (a.date < b.date ? 1 : -1));
      return res.status(200).json(allPosts);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Не удалось прочитать посты" });
    }
  }

  // 2) Обрабатываем POST /api/posts — создание нового поста
  if (req.method === "POST") {
    const body: CreatePostBody = req.body;

    // Проверяем секрет
    if (!body.secret || body.secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Неверный секрет" });
    }

    if (body.type !== "create") {
      return res.status(400).json({ error: "Неверный тип запроса" });
    }

    const { title, date, description, tags, content } = body.data || {};
    if (!title || !date || !content) {
      return res
        .status(400)
        .json({ error: "Поля title, date и content обязательны" });
    }

    // Генерируем slug: "YYYY-MM-DD-my-new-post"
    const datePart = date;
    const titlePart = slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
    const slug = `${datePart}-${titlePart}`;

    const filePath = path.join(postsDir, `${slug}.mdx`);
    if (fs.existsSync(filePath)) {
      return res.status(400).json({ error: "Пост с таким slug уже существует" });
    }

    // Формируем массив тегов
    const tagsArray =
      typeof tags === "string"
        ? tags
            .split(",")
            .map((t: string) => t.trim())
            .filter((t: string) => t.length > 0)
        : [];

    // Собираем YAML‐фронт‐маттер
    const frontMatterObj: Record<string, any> = {
      title,
      date,
      description: description || "",
      tags: tagsArray,
    };
    const mdxWithFM = matter.stringify(content, frontMatterObj);

    try {
      fs.writeFileSync(filePath, mdxWithFM, "utf8");
      return res.status(200).json({ ok: true, slug });
    } catch (e) {
      console.error("Ошибка записи файла:", e);
      return res.status(500).json({ error: "Не удалось создать файл поста" });
    }
  }

  // Все остальные методы не поддерживаем
  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Метод не разрешён" });
}
