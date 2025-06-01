// src/pages/api/posts/[slug].ts

import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

// Интерфейс тела запроса для PUT (обновления поста)
interface UpdatePostBody {
  type: "update";
  secret: string;
  data: {
    title: string;
    date: string;
    description?: string;
    tags?: string[];
    content: string;
  };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { slug: slugParam },
    method,
  } = req;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const postsDir = path.join(process.cwd(), "src", "posts");
  const filePath = path.join(postsDir, `${slug}.mdx`);

  // 1) GET: вернуть содержимое одного поста
  if (method === "GET") {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Пост не найден" });
    }
    try {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContents);
      return res
        .status(200)
        .json({ slug, frontMatter: data, content });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Не удалось прочитать файл" });
    }
  }

  // 2) PUT: обновить существующий пост
  if (method === "PUT") {
    const body: UpdatePostBody = req.body;

    // Проверяем секрет
    if (!body.secret || body.secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Неверный секрет" });
    }

    // Проверка существования файла
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Пост не найден" });
    }

    if (body.type !== "update") {
      return res.status(400).json({ error: "Неверный тип запроса" });
    }

    const { title, date, description, tags, content } = body.data || {};
    if (!title || !date || !content) {
      return res
        .status(400)
        .json({ error: "Поля title, date и content обязательны" });
    }

    // Собираем YAML‐фронт‐маттер
    const frontMatterObj: Record<string, any> = {
      title,
      date,
      description: description || "",
      tags: Array.isArray(tags) ? tags : [],
    };
    const mdxWithFM = matter.stringify(content, frontMatterObj);

    try {
      fs.writeFileSync(filePath, mdxWithFM, "utf8");
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("Ошибка обновления файла:", e);
      return res.status(500).json({ error: "Не удалось обновить пост" });
    }
  }

  // 3) DELETE: удалить существующий пост
  if (method === "DELETE") {
    const { secret } = req.body || {};
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Неверный секрет" });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Пост не найден" });
    }

    try {
      fs.unlinkSync(filePath);
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("Ошибка удаления файла:", e);
      return res.status(500).json({ error: "Не удалось удалить пост" });
    }
  }

  // Другие методы не поддерживаем
  res.setHeader("Allow", "GET, PUT, DELETE");
  return res.status(405).json({ error: "Метод не разрешён" });
}
