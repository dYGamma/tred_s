// src/types/post.d.ts

import { MDXRemoteSerializeResult } from "next-mdx-remote";

/**
 * PostMeta
 *
 * Интерфейс, описывающий базовые метаданные поста,
 * которые содержатся в фронт-маттере каждого MDX-файла.
 */
export interface PostMeta {
  slug: string;          // Уникальный идентификатор поста (имя файла без .mdx)
  title: string;         // Заголовок поста (из front-matter)
  date: string;          // Дата публикации (строка ISO-формата из front-matter)
  description: string;   // Краткое описание или аннотация (из front-matter)
  tags: string[];        // Массив тегов (из front-matter), может быть пустым
}

/**
 * PostWithContent
 *
 * Расширяет PostMeta, добавляя сериализованный MDX-контент,
 * чтобы можно было его сразу подать в MDXRemote для рендеринга.
 */
export interface PostWithContent extends PostMeta {
  mdxSource: MDXRemoteSerializeResult; // Результат сериализации MDX-контента через next-mdx-remote
}
