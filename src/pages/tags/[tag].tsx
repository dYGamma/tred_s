// src/pages/tags/[tag].tsx

import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import Layout from "../../components/Layout";
import PostCard from "../../components/PostCard";
import { getAllPosts, PostMeta } from "../../lib/getAllPosts";

interface TagPageProps {
  posts: PostMeta[];
  tag: string;
}

export default function TagPage({ posts, tag }: TagPageProps) {
  return (
    <Layout title={`Тег: ${tag}`} description={`Посты с тегом "${tag}"`}>
      <div className="glass-card p-8 mb-8">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Тег: {tag}</h1>
        {posts.length > 0 ? (
          <div className="posts-grid">
            {posts.map((p) => (
              <PostCard key={p.slug} {...p} />
            ))}
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">
            Постов с таким тегом пока нет.
          </p>
        )}
        <div className="mt-6">
          <Link
            href="/tags/" 
            className="text-gray-700 dark:text-gray-300 hover:underline transition-colors"
          >
            ← Все теги
          </Link>
        </div>
      </div>
    </Layout>
  );
}

// Генерируем маршруты для всех уникальных тегов
export const getStaticPaths: GetStaticPaths = async () => {
  // Используем getAllPosts() внутри этой функции (она выполняется на сервере)
  const posts = getAllPosts();
  const tagsSet = new Set<string>();
  posts.forEach((post) => {
    post.tags.forEach((t) => tagsSet.add(t));
  });

  // Для каждого тега формируем путь { params: { tag: "tagName" } }
  const paths = Array.from(tagsSet).map((tag) => ({
    params: { tag },
  }));

  return {
    paths,
    fallback: false, // если тег не найден — отдаём 404
  };
};

// Для каждой страницы-тега получаем все посты с этим тегом
export const getStaticProps: GetStaticProps<TagPageProps> = async ({ params }) => {
  const tag = params?.tag as string;
  // Получаем все посты на сервере
  const posts = getAllPosts().filter((post) => post.tags.includes(tag));
  return {
    props: {
      posts,
      tag,
    },
  };
};
