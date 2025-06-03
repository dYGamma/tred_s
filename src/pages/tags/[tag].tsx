// src/pages/tags/[tag].tsx

import { GetServerSideProps } from "next";
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

// Вместо SSG — SSR. При каждом запросе сервер заново читает все посты и строит список.
export const getServerSideProps: GetServerSideProps<TagPageProps> = async ({ params }) => {
  const tag = params?.tag as string;
  // getAllPosts читает из /app/src/posts (монтированная папка)
  const posts = getAllPosts().filter((post) => post.tags.includes(tag));
  return {
    props: {
      posts,
      tag,
    },
  };
};
