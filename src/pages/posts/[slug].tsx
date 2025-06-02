// src/pages/posts/[slug].tsx

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";

import Layout from "../../components/Layout";
import TableOfContents from "../../components/TableOfContents";

import { getAllPostsFromDB, getPostBySlugFromDB, PostMeta } from "../../lib/db";
import { mdxOptions } from "../../lib/mdxUtils";

// Точная часть метаданных, которую передаём в props
interface PostFrontMatter {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  author: string | null;
  readingTime: string;
  coverImage: string | null;
}

// Пропсы страницы
interface PostPageProps {
  mdxSource: MDXRemoteSerializeResult;
  frontMatter: PostFrontMatter;
  allPosts: PostMeta[];
}

export default function PostPage({
  mdxSource,
  frontMatter,
  allPosts,
}: PostPageProps) {
  // Находим индекс текущего поста в списке, чтобы вывести Prev/Next
  const currentIndex = allPosts.findIndex((p) => p.slug === frontMatter.slug);
  const prevPost =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  return (
    <Layout title={frontMatter.title} description={frontMatter.description}>
      <Head>
        <title>{frontMatter.title}</title>
        <meta name="description" content={frontMatter.description} />
        <meta property="og:title" content={frontMatter.title} />
        <meta property="og:description" content={frontMatter.description} />
        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content={`https://<your-username>.github.io/<repo-name>/posts/${frontMatter.slug}`}
        />
        <meta property="og:site_name" content="My Blog" />
      </Head>

      {/* ОБЁРНУТЫЙ В POST-КЛАСС */}
      <article className="post">
        <header>
          {/* 1) Заголовок */}
          <h1 className="post-title">{frontMatter.title}</h1>

          {/* 2) Дата / Автор / Время чтения */}
          <div className="post-meta">
            <time>
              {new Date(frontMatter.date).toLocaleDateString("ru-RU", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {frontMatter.author && <span> — Written by {frontMatter.author}</span>}
            <span> — {frontMatter.readingTime}</span>
          </div>

          {/* 3) Теги */}
          {frontMatter.tags.length > 0 && (
            <div className="post-tags">
              {frontMatter.tags.map((tag) => (
                <Link key={tag} href={`/tags/${tag}/`}>
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* 4) Обложка (если есть) */}
        {frontMatter.coverImage && (
          <div className="post-cover">
            <img
              src={frontMatter.coverImage}
              alt={`Cover for ${frontMatter.title}`}
            />
          </div>
        )}

        {/* 5) Основной контент (MDXRemote) */}
        <div className="post-content">
          <div className="prose dark:prose-invert max-w-none">
            <MDXRemote {...mdxSource} />
          </div>
        </div>

        {/* Prev / Next */}
        {(prevPost || nextPost) && (
          <nav className="pagination pagination__buttons" style={{ marginTop: "40px" }}>
            {prevPost ? (
              <Link
                href={`/posts/${prevPost.slug}/`}
                className="button link"
                style={{ marginRight: "auto" }}
              >
                {/* SVG-стрелка влево */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: "6px" }}
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                {prevPost.title}
              </Link>
            ) : (
              <span />
            )}

            {nextPost ? (
              <Link
                href={`/posts/${nextPost.slug}/`}
                className="button link"
                style={{ marginLeft: "auto" }}
              >
                {nextPost.title}
                {/* SVG-стрелка вправо */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginLeft: "6px" }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ) : null}
          </nav>
        )}
      </article>

      {/* Правая колонка: оглавление (на экранах ≥ lg) */}
      <aside className="hidden lg:block lg:mt-12 lg:fixed lg:right-0 lg:w-60">
        <div className="toc-wrapper p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="toc-title font-semibold mb-2">Содержание</p>
          <TableOfContents />
        </div>
      </aside>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<PostPageProps> = async ({
  params,
}) => {
  const slug = params?.slug as string;
  // Читаем все посты (для Prev/Next) и текущий пост из /data/posts
  const allPosts = getAllPostsFromDB();
  const post = getPostBySlugFromDB(slug);

  if (!post) {
    return { notFound: true };
  }

  // Сериализуем MDX-контент, передаём плагины внутри mdxOptions
  const mdxSource = await serialize(post.content || "", {
    mdxOptions: {
      remarkPlugins: mdxOptions.remarkPlugins,
      rehypePlugins: mdxOptions.rehypePlugins as any,
    },
  });

  const frontMatter: PostFrontMatter = {
    slug: post.slug,
    title: post.title,
    date: post.date,
    description: post.description,
    tags: post.tags,
    author: (post as any).author || null,
    readingTime: (post as any).readingTime || "0 min",
    coverImage: (post as any).coverImage || null,
  };

  return {
    props: {
      mdxSource,
      frontMatter,
      allPosts,
    },
  };
};
