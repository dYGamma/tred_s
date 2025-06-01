// src/pages/api/upload.ts

import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // Отключаем встроенный парсер, т.к. используем formidable
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Метод не разрешён" });
  }

  // Определяем директорию для загрузки (public/uploads)
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  // Если директории нет — создаём её рекурсивно
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Настройки formidable
  const form = formidable({
    multiples: false,           // Одно изображение за раз
    uploadDir,                  // Папка, в которую будут сохраняться файлы
    keepExtensions: true,       // Сохраняем исходное расширение файла
    maxFileSize: 5 * 1024 * 1024, // Ограничение: 5 МБ
    filter: (part) => {
      // Разрешаем только файлы с типом «image/*»
      return part.mimetype?.startsWith("image/") || false;
    },
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Ошибка загрузки файла:", err);
      return res.status(500).json({ error: "Не удалось загрузить файл" });
    }

    // Возможные варианты: files.file может быть File или File[]
    const fileField = files.file;
    if (!fileField) {
      return res.status(400).json({ error: "Файл не найден в запросе" });
    }

    // Определяем реальный объект File
    let fileObj: File;
    if (Array.isArray(fileField)) {
      // Если это массив, берём первый элемент
      fileObj = fileField[0];
    } else {
      fileObj = fileField as File;
    }

    // Теперь fileObj гарантированно содержит свойства File
    const filePath = fileObj.filepath;        // полный путь к сохранённому файлу
    const fileName = path.basename(filePath); // имя файла с расширением

    // Составляем публичный URL (путь от папки public)
    const fileUrl = `/uploads/${fileName}`;

    return res.status(200).json({ url: fileUrl });
  });
}
