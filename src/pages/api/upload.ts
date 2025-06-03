// src/pages/api/upload.ts

import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, 
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Метод не разрешён" });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    multiples: false,
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
    filter: (part) => {
      return part.mimetype?.startsWith("image/") || false;
    },
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Ошибка загрузки файла:", err);
      return res.status(500).json({ error: "Не удалось загрузить файл" });
    }

    const fileField = files.file;
    if (!fileField) {
      return res.status(400).json({ error: "Файл не найден в запросе" });
    }

    let fileObj: File;
    if (Array.isArray(fileField)) {
      fileObj = fileField[0];
    } else {
      fileObj = fileField as File;
    }

    const filePath = fileObj.filepath;
    const fileName = path.basename(filePath);

    // Составляем публичный URL (путь от папки public)
    const fileUrl = `/uploads/${fileName}`;

    return res.status(200).json({ url: fileUrl });
  });
}