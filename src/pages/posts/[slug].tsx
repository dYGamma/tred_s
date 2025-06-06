// src/pages/posts/[slug].tsx

import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";

import Layout from "../../components/Layout";
import TableOfContents from "../../components/TableOfContents";

import { getAllPostsFromDB, getPostBySlugFromDB, PostMeta as OriginalPostMeta } from "../../lib/db";
import { mdxOptions } from "../../lib/mdxUtils";
/**
 * Возвращает правильное склонение слова "минута".
 * @param number - количество минут
 * @returns Строка "минута", "минуты" или "минут"
 */
function pluralizeMinutes(number: number): string {
  const lastDigit = number % 10;
  const lastTwoDigits = number % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return "минут";
  }
  if (lastDigit === 1) {
    return "минута";
  }
  if ([2, 3, 4].includes(lastDigit)) {
    return "минуты";
  }
  return "минут";
}

/**
 * Рассчитывает примерное время чтения статьи (на русском языке).
 * @param content - Текст статьи (MDX-код, включая разметку).
 * @returns Строка с временем чтения, например "5 минут на чтение".
 */
function calculateReadingTime(content: string): string {
  if (!content) {
    return `1 ${pluralizeMinutes(1)} на чтение`;
  }

  const wordsPerMinute = 180; // Средняя скорость чтения для русского языка
  const words = content.trim().split(/\s+/).length;
  const time = Math.ceil(words / wordsPerMinute);

  return `${time} ${pluralizeMinutes(time)} на чтение`;
}

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

export interface PostMeta extends OriginalPostMeta {
  content: string;
}

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
          content={`https://<your-domain>/posts/${frontMatter.slug}`}
        />
        <meta property="og:site_name" content="My Blog" />
      </Head>

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
            {frontMatter.author && (
              <span> — Written by {frontMatter.author}</span>
            )}
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

        {frontMatter.coverImage && (
          <div className="post-cover">
            <img
              src={frontMatter.coverImage}
              alt={`Cover for ${frontMatter.title}`}
            />
          </div>
        )}

        <div className="post-content">
          <div className="prose dark:prose-invert max-w-none">
            <MDXRemote {...mdxSource} />
          </div>
        </div>

        {/* Prev / Next */}
        {(prevPost || nextPost) && (
          <nav
            className="pagination pagination__buttons"
            style={{ marginTop: "40px" }}
          >
            {prevPost ? (
              <Link
                href={`/posts/${prevPost.slug}/`}
                className="button link"
                style={{ marginRight: "auto" }}
              >
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
  const allPostsRaw = getAllPostsFromDB();
  const postRaw = getPostBySlugFromDB(slug);

  if (!postRaw) {
    return { notFound: true };
  }

  const post: PostMeta = {
    ...postRaw,
    content: postRaw.content || "",
  };

  const rusReadingTime = calculateReadingTime(post.content);

  const mdxSource = await serialize(post.content, {
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
    author: post.author || null,
    readingTime: rusReadingTime,
    coverImage: post.coverImage || null,
  };

  return {
    props: {
      mdxSource,
      frontMatter,
      allPosts: allPostsRaw.map((p) => ({
        ...p,
        content: p.content || "",
      })),
    },
  };
};
