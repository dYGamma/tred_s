// src/pages/index.tsx

import { useEffect, useState, useRef } from "react";
import { GetServerSideProps } from "next";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import { getAllPostsFromDB, PostMeta } from "../lib/db";

interface HomeProps {
  posts: PostMeta[];
}

// Базовый ASCII-арт-заголовок (копирован из исходника)
const baseAscii = [
  "███████╗██╗  ██╗██╗███████╗ ██████╗ ██████╗ ███████╗███╗   ██╗██╗███╗   ██╗██╗",
  "██╔════╝██║  ██║██║██╔════╝██╔════╝██╔═══██╗██╔════╝████╗  ██║██║████╗  ██║██║",
  "███████╗███████║██║█████╗  ██║     ██║   ██║█████╗  ██╔██╗ ██║██║██╔██╗ ██║██║",
  "╚════██║██╔══██║██║██╔══╝  ██║     ██║   ██║██╔══╝  ██║╚██╗██║██║██║╚██╗██║╚═╝",
  "███████║██║  ██║██║███████╗╚██████╗╚██████╔╝███████╗██║ ╚████║██║██║ ╚████║██╗",
  "╚══════╝╚═╝  ╚═╝╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝╚═╝",
];

const noiseChars = ["@", "#", "$", "%", "&", "*", "?", "~", "■", "▯", "▢", "▓", "▒", "░"];

function getRandomColorClass() {
  // Массив Tailwind-классов с «тревожными» цветами для эффекта глитча
  const colors = [
    "text-red-500",
    "text-green-400",
    "text-yellow-400",
    "text-pink-500",
    "text-purple-400",
    "text-blue-300",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function glitchLine(line: string, intensity: number): string {
  // intensity — вероятность (0–1) замены символа на «шум»
  return line
    .split("")
    .map((ch) => {
      if (/\s/.test(ch)) return ch; // пробелы не трогать
      return Math.random() < intensity
        ? noiseChars[Math.floor(Math.random() * noiseChars.length)]
        : ch;
    })
    .join("");
}

function AsciiGlitch() {
  const [glitchLines, setGlitchLines] = useState<string[]>(baseAscii);
  const [colorClass, setColorClass] = useState<string>("text-green-400");
  const intensityRef = useRef(0.0); // начальная «интенсивность» глитча

  useEffect(() => {
    const interval = setInterval(() => {
      // Периодически меняем «интенсивность» и цвет
      const newIntensity = Math.random() * 0.3; // до 30% символов могут глючить
      intensityRef.current = newIntensity;
      setColorClass(getRandomColorClass());

      // Генерируем новый массив строк с глитч-эффектом
      const newLines = baseAscii.map((ln) => glitchLine(ln, newIntensity));
      setGlitchLines(newLines);
    }, 200); // обновляем 5 раз в секунду

    return () => clearInterval(interval);
  }, []);

  return (
    <pre
      className={`leading-tight font-mono whitespace-pre-wrap text-center overflow-x-auto ${colorClass} bg-black/80 py-4 px-2 rounded-md`}
      style={{ fontSize: "0.75rem", lineHeight: "0.9rem" }}
    >
      {glitchLines.map((ln, i) => (
        <div key={i}>{ln}</div>
      ))}
    </pre>
  );
}

export default function Home({ posts }: HomeProps) {
  return (
    <Layout title="Все посты" description="Список всех публикаций блога">
      <header className="mb-12 text-center">
        {/* Скрываем <h1> для SEO, сам заголовок рендерит AsciiGlitch */}
        <h1 className="sr-only">Шизобредни</h1>
        <AsciiGlitch />
      </header>

      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Здесь всё немного шуршит в фоновом режиме…
      </p>

      <section className="w-full px-4">
        <div className="mx-auto max-w-2xl space-y-12">
          {posts.map((post) => (
            <PostCard
              key={post.slug}
              slug={post.slug}
              title={post.title}
              date={post.date}
              // В карточке используется excerpt и description, поэтому дублируем:
              excerpt={post.description}
              description={post.description}
              tags={post.tags}
              // Заглушки для остальных обязательных полей, чтобы визуал не сломался:
              author={""}
              readingTime={""}
              coverImage={null}
              content={""}
            />
          ))}
        </div>
      </section>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  // Берём посты “на лету” из /data/posts
  const posts = getAllPostsFromDB();
  return {
    props: {
      posts,
    },
  };
};
