// src/pages/api/posts/[slug].ts

import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

interface UpdatePostBody {
  type: "update";
  secret: string;
  data: {
    title: string;
    date: string;
    description?: string;
    tags?: string[];
    author?: string;
    coverImage?: string;
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

  if (method === "GET") {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Пост не найден" });
    }
    try {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContents);
      const rt = readingTime(content).text;

      return res.status(200).json({
        slug,
        frontMatter: {
          title: data.title,
          date: data.date,
          description: data.description || "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          author: data.author || null,
          readingTime: rt,
          coverImage: data.coverImage || null,
        },
        content,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Не удалось прочитать файл" });
    }
  }

  if (method === "PUT") {
    const body: UpdatePostBody = req.body;
    if (!body.secret || body.secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Неверный секрет" });
    }
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Пост не найден" });
    }
    if (body.type !== "update") {
      return res.status(400).json({ error: "Неверный тип запроса" });
    }

    const {
      title,
      date,
      description,
      tags,
      author,
      coverImage,
      content,
    } = body.data || {};
    if (!title || !date || !content) {
      return res
        .status(400)
        .json({ error: "Поля title, date и content обязательны" });
    }

    const frontMatterObj: Record<string, any> = {
      title,
      date,
      description: description || "",
      tags: Array.isArray(tags) ? tags : [],
      author: author || null,
      coverImage: coverImage || null,
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

  res.setHeader("Allow", "GET, PUT, DELETE");
  return res.status(405).json({ error: "Метод не разрешён" });
}
