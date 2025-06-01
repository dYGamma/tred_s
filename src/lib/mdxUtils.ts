// src/lib/mdxUtils.ts

import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrism from "rehype-prism-plus";

/**
 * mdxOptions
 *
 * Конфигурация для сериализации MDX-контента через next-mdx-remote.
 * Включает плагины:
 *  - remark-gfm: поддержка GitHub Flavored Markdown (таблицы, чекбоксы и т. д.)
 *  - rehype-slug: автоматически добавляет атрибут id заголовкам (h1, h2, …)
 *  - rehype-autolink-headings: добавляет ссылку-«якорь» (¶) рядом с заголовками
 *  - rehype-prism-plus: подсветка синтаксиса кода через Prism.js
 */
export const mdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        properties: {
          className: ["anchor"],
        },
      },
    ],
    rehypePrism,
  ],
};
