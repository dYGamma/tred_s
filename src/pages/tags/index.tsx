// src/pages/tags/index.tsx

import { useState, useMemo } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";
import { GetStaticProps } from "next";
import { getAllPosts, PostMeta } from "../../lib/getAllPosts";

interface TagsIndexProps {
  tags: string[];
  tagCounts: Record<string, number>;
}

export default function TagsIndex({ tags, tagCounts }: TagsIndexProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Фильтрация тегов по введённой строке
  const filteredTags = useMemo(() => {
    if (!searchTerm.trim()) return tags;
    const lower = searchTerm.trim().toLowerCase();
    return tags.filter((tag) => tag.toLowerCase().includes(lower));
  }, [searchTerm, tags]);

  return (
    <Layout title="Все теги" description="Список всех тегов с поиском">
      {/* 
        Обёртка, центрирующая окно с тегами между шапкой и футером.
        Содержимое .glass-card выровнено по левому краю.
      */}
      <div className="tags-center-wrapper">
        <div className="glass-card p-8">
          {/* <h1 className="text-2xl font-bold mb-4 dark:text-white">
            Все теги
          </h1> */}

          {/* Поисковая строка */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Поиск тега..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Список отфильтрованных тегов. justify-start выравнивает их по левому краю */}
          {filteredTags.length > 0 ? (
            <ul className="flex flex-wrap justify-start gap-2">
              {filteredTags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className="tag-chip hover:bg-opacity-80 transition-all"
                  >
                    <span>#{tag}</span>
                    <span className="tag-chip__count">
                      {" "}
                      ({tagCounts[tag]})
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700 dark:text-gray-300">Теги не найдены.</p>
          )}

          {/* Ссылка «← Главная» */}
          <div className="centered-link">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-300 hover:underline transition-colors"
            >
              ← Главная
            </Link>
          </div>
        </div>
      </div>
      {/* Footer («© 2025 ShizBlog.») рендерится внутри Layout ниже этого блока */}
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<TagsIndexProps> = async () => {
  const posts: PostMeta[] = getAllPosts();

  // Считаем, сколько раз встречается каждый тег
  const tagCounts: Record<string, number> = {};
  posts.forEach((post) => {
    post.tags.forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });

  // Вытаскиваем уникальные теги и сортируем их по алфавиту
  const tags = Object.keys(tagCounts).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  return {
    props: {
      tags,
      tagCounts,
    },
  };
};
