// src/pages/api/posts/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import slugify from "slugify";
import matter from "gray-matter";
import readingTime from "reading-time";

interface CreatePostBody {
  type: "create";
  secret: string;
  data: {
    title: string;
    date: string;     // "YYYY-MM-DD"
    description?: string;
    tags?: string;    // "tag1,tag2"
    author?: string;
    coverImage?: string;
    content: string;  // MDX-тело
  };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const postsDir = path.join(process.cwd(), "src", "posts");

  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  if (req.method === "GET") {
    try {
      const files = fs
        .readdirSync(postsDir)
        .filter((f) => f.endsWith(".mdx"));

      const allPosts = files.map((filename) => {
        const slug = filename.replace(/\.mdx$/, "");
        const fullPath = path.join(postsDir, filename);
        const fileContents = fs.readFileSync(fullPath, "utf-8");
        const { data, content } = matter(fileContents);

        const rt = readingTime(content).text;

        return {
          slug,
          title: data.title,
          date: data.date,
          description: data.description || "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          author: data.author || null,
          readingTime: rt,
          coverImage: data.coverImage || null,
        };
      });

      allPosts.sort((a, b) => (a.date < b.date ? 1 : -1));
      return res.status(200).json(allPosts);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Не удалось прочитать посты" });
    }
  }

  if (req.method === "POST") {
    const body: CreatePostBody = req.body;
    if (!body.secret || body.secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Неверный секрет" });
    }
    if (body.type !== "create") {
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

    const datePart = date;
    const titlePart = slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
    const slug = `${datePart}-${titlePart}`;

    const filePath = path.join(postsDir, `${slug}.mdx`);
    if (fs.existsSync(filePath)) {
      return res
        .status(400)
        .json({ error: "Пост с таким slug уже существует" });
    }

    const tagsArray =
      typeof tags === "string"
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : [];

    const frontMatterObj: Record<string, any> = {
      title,
      date,
      description: description || "",
      tags: tagsArray,
      author: author || null,
      coverImage: coverImage || null,
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

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Метод не разрешён" });
}
