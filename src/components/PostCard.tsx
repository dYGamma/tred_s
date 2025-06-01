// src/components/PostCard.tsx

import Link from "next/link";
import { PostMeta } from "../lib/getAllPosts";
import { formatDate } from "../lib/dateUtils";

interface PostCardProps extends PostMeta {
  prevPost?: { title: string; slug: string };
  nextPost?: { title: string; slug: string };
}

export default function PostCard({
  title,
  date,
  excerpt,
  slug,
  tags,
  author,
  readingTime,
  prevPost,
  nextPost,
}: PostCardProps) {
  return (
    <article className="post">
      <header>
        {/* Заголовок поста */}
        <h2 className="post-title">
          <Link href={`/posts/${slug}/`}>
            {title}
          </Link>
        </h2>

        {/* Мета‐информация */}
        <div className="post-meta">
          <time>{formatDate(date)}</time>
          {author && <span> — Written by&nbsp;{author}</span>}
          {readingTime && <span> — {readingTime}</span>}
        </div>

        {/* Теги */}
        {tags.length > 0 && (
          <div className="post-tags">
            {tags.map((tag) => (
              <Link key={tag} href={`/tags/${tag}/`}>
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Краткое описание */}
      <p className="mt-4">
        {excerpt}
      </p>

      {/* Ссылка «Read more →» */}
      <Link href={`/posts/${slug}/`} className="button link read-more">
        Read more&nbsp;
        <span aria-hidden="true">→</span>
      </Link>

      {/* Навигация между постами */}
      {(prevPost || nextPost) && (
        <nav className="pagination pagination__buttons" style={{ marginTop: "30px" }}>
          {prevPost ? (
            <Link href={`/posts/${prevPost.slug}/`} className="button link" style={{ marginRight: "auto" }}>
              {/* Простая SVG-стрелка влево */}
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
              Previous
            </Link>
          ) : (
            <div />
          )}

          {nextPost ? (
            <Link href={`/posts/${nextPost.slug}/`} className="button link" style={{ marginLeft: "auto" }}>
              Next&nbsp;
              {/* Простая SVG-стрелка вправо */}
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
  );
}
