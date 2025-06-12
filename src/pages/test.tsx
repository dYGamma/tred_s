// src/pages/index.tsx
import { useEffect, useState, useRef } from "react";
import { GetServerSideProps } from "next";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import { getAllPostsFromDB, PostMeta as OriginalPostMeta } from "../lib/db";

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
 * @param content - Текст статьи.
 * @returns Строка с временем чтения, например "5 минут на чтение".
 */
function calculateReadingTime(content: string): string {
  if (!content) {
    return `1 ${pluralizeMinutes(1)} на чтение`;
  }

  const wordsPerMinute = 180;
  const words = content.trim().split(/\s+/).length;
  const time = Math.ceil(words / wordsPerMinute);

  return `${time} ${pluralizeMinutes(time)} на чтение`;
}

export interface PostMeta extends OriginalPostMeta {
  content: string;
  readingTime: string;
}

interface HomeProps {
  posts: PostMeta[];
}

const headerPhrases = [
  "Шизобредни",
  "Мысли путаются в проводах...",
  "Подслушано в нейросети...",
  "Хроники цифрового подсознания.",
  "Сигнал потерян. Идёт запись.",
  "Ещё один тред из бездны.",
  "Загрузка потока сознания...",
];

/**
 * Компонент, машинка
 */
function TypingHeader() {
  const [fullText, setFullText] = useState("");
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const typingSpeed = 120;
  const cursorBlinkSpeed = 500;
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const randomPhrase = headerPhrases[Math.floor(Math.random() * headerPhrases.length)];
    setFullText(randomPhrase);
  }, []);

  useEffect(() => {
    if (!fullText) return;

    if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = null;
    }
    
    if (text.length < fullText.length) {
      const timeoutId = setTimeout(() => {
        setText(fullText.slice(0, text.length + 1));
      }, typingSpeed);
      return () => clearTimeout(timeoutId);
    }
    
    intervalId.current = setInterval(() => {
      setShowCursor(prev => !prev);
    }, cursorBlinkSpeed);

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [text, fullText]);

  return (
    <>
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .cursor {
            display: inline-block;
            width: 3px;
            height: 2.2rem; /* Подбираем под размер шрифта */
            background-color: #6ee7b7; /* Яркий цвет для курсора */
            margin-left: 8px;
            animation: blink ${cursorBlinkSpeed * 2}ms infinite;
            vertical-align: bottom;
          }
          @media (min-width: 768px) {
            .cursor { height: 2.8rem; }
          }
          .typing-header-container {
            /* Контейнер для фиксации высоты и предотвращения "прыжков" макета */
            height: 3rem; 
             @media (min-width: 768px) {
                height: 3.5rem;
            }
          }
        `}
      </style>
      <div className="typing-header-container flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-200 dark:text-gray-300">
            <span>{text}</span>
            {(showCursor || text.length < fullText.length) && <span className="cursor"></span>}
          </h1>
      </div>
    </>
  );
}

export default function Home({ posts }: HomeProps) {
  return (
    <Layout title="Все посты" description="Список всех публикаций блога">
      <header className="mb-12 text-center">
        <h1 className="sr-only">Шизобредни</h1>
        <TypingHeader />
      </header>

      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Здесь всё немного шуршит в фоновом режиме…
      </p>

      <section className="w-full px-4 mt-8">
        <div className="mx-auto max-w-2xl space-y-12">
          {posts.map((post) => (
            <PostCard
              key={post.slug}
              slug={post.slug}
              title={post.title}
              date={post.date}
              excerpt={post.description}
              description={post.description}
              tags={post.tags}
              author={post.author || ""}
              readingTime={post.readingTime}
              coverImage={post.coverImage || null}
              content={post.content}
            />
          ))}
        </div>
      </section>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const postsFromDB = getAllPostsFromDB();

  const posts: PostMeta[] = postsFromDB.map((post) => {
    const content = post.content || "";
    return {
      ...post,
      content,
      readingTime: calculateReadingTime(content),
    };
  });

  return {
    props: {
      posts,
    },
  };
};

