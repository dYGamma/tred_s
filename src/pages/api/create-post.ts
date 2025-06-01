// src/pages/api/create-post.ts

import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import slugify from "slugify";
import matter from "gray-matter";

interface FrontMatter {
  title: string;
  date: string;
  description?: string;
  tags?: string; // теговая строка, разделённая запятыми
  content: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Метод не разрешён" });
  }

  const { type, secret, data } = req.body;

  // Проверяем, что секрет соответствует ENV
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Неверный секрет" });
  }

  if (type === "auth") {
    // Просто проверка пароля
    return res.status(200).json({ ok: true });
  }

  if (type === "create") {
    // Делаем валидацию полей
    const fm: FrontMatter = data;
    if (!fm.title || !fm.date || !fm.content) {
      return res
        .status(400)
        .json({ error: "Поля title, date и content обязательны" });
    }

    // Генерируем slug из заголовка и даты, чтобы избежать дубликатов
    // Например: "2025-05-31-my-new-post"
    const datePart = fm.date;
    const titlePart = slugify(fm.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
    const slug = `${datePart}-${titlePart}`;

    // Формируем фронт-маттер в YAML
    const tagsArray =
      typeof fm.tags === "string"
        ? fm.tags
            .split(",")
            .map((t: string) => t.trim())
            .filter((t: string) => t.length > 0)
        : [];
    const frontMatterObj: Record<string, any> = {
      title: fm.title,
      date: fm.date,
      description: fm.description || "",
      tags: tagsArray,
    };
    const yamlFM = matter.stringify(fm.content, frontMatterObj);

    // Путь до папки src/posts
    const postsDir = path.join(process.cwd(), "src", "posts");
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }

    const filePath = path.join(postsDir, `${slug}.mdx`);
    if (fs.existsSync(filePath)) {
      return res.status(400).json({ error: "Пост с таким slug уже существует" });
    }

    // Записываем файл
    try {
      fs.writeFileSync(filePath, yamlFM, "utf8");
      return res.status(200).json({ ok: true, slug });
    } catch (err) {
      console.error("Ошибка записи файла:", err);
      return res
        .status(500)
        .json({ error: "Не удалось создать файл поста" });
    }
  }

  return res.status(400).json({ error: "Неверный тип запроса" });
}
