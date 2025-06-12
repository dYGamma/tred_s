// src\pages\index.tsx
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

// const baseAscii = [
//   "███████╗██╗  ██╗██╗███████╗ ██████╗ ██████╗ ███████╗███╗   ██╗██╗███╗   ██╗██╗",
//   "██╔════╝██║  ██║██║██╔════╝██╔════╝██╔═══██╗██╔════╝████╗  ██║██║████╗  ██║██║",
//   "███████╗███████║██║█████╗  ██║     ██║   ██║█████╗  ██╔██╗ ██║██║██╔██╗ ██║██║",
//   "╚════██║██╔══██║██║██╔══╝  ██║     ██║   ██║██╔══╝  ██║╚██╗██║██║██║╚██╗██║╚═╝",
//   "███████║██║  ██║██║███████╗╚██████╗╚██████╔╝███████╗██║ ╚████║██║██║ ╚████║██╗",
//   "╚══════╝╚═╝  ╚═╝╚═╝╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝╚═╝",
// ];

// const noiseChars = ["@", "#", "$", "%", "&", "*", "?", "~", "■", "▯", "▢", "▓", "▒", "░"];

// function getRandomColorClass() {
//   const colors = [
//     "text-red-500",
//     "text-green-400",
//     "text-yellow-400",
//     "text-pink-500",
//     "text-purple-400",
//     "text-blue-300",
//   ];
//   return colors[Math.floor(Math.random() * colors.length)];
// }

// function glitchLine(line: string, intensity: number): string {
//   return line
//     .split("")
//     .map((ch) => {
//       if (/\s/.test(ch)) return ch; // пробелы не трогать
//       return Math.random() < intensity
//         ? noiseChars[Math.floor(Math.random() * noiseChars.length)]
//         : ch;
//     })
//     .join("");
// }

// function AsciiGlitch() {
//   const [glitchLines, setGlitchLines] = useState<string[]>(baseAscii);
//   const [colorClass, setColorClass] = useState<string>("text-green-400");
//   const [isMobile, setIsMobile] = useState(false);
//   const intensityRef = useRef(0.0);

//   useEffect(() => {
//     const checkIsMobile = () => {
//       setIsMobile(window.innerWidth < 684);
//     };

//     checkIsMobile();

//     window.addEventListener("resize", checkIsMobile);
//     return () => window.removeEventListener("resize", checkIsMobile);
//   }, []);

//   useEffect(() => {
//     if (isMobile) {
//       return;
//     }

//     const interval = setInterval(() => {
//       const newIntensity = Math.random() * 0.3;
//       intensityRef.current = newIntensity;
//       setColorClass(getRandomColorClass());

//       const newLines = baseAscii.map((ln) => glitchLine(ln, newIntensity));
//       setGlitchLines(newLines);
//     }, 200);

//     return () => clearInterval(interval);
//   }, [isMobile]);

//   if (isMobile) {
//     return null;
//   }

//   return (
//     <pre
//       className={`leading-tight font-mono whitespace-pre-wrap text-center overflow-x-auto ${colorClass} bg-black/80 py-4 px-2 rounded-md`}
//       style={{ fontSize: "0.75rem", lineHeight: "0.9rem" }}
//     >
//       {glitchLines.map((ln, i) => (
//         <div key={i}>{ln}</div>
//       ))}
//     </pre>
//   );
// }

export default function Home({ posts }: HomeProps) {
  return (
    <Layout title="Все посты" description="Список всех публикаций блога">
      <header className="mb-12 text-center">
        {/* Заголовок для скрин-ридеров остается, а визуальный компонент отключается на мобильных */}
        <h1 className="sr-only">Шизобредни</h1>
        {/* <AsciiGlitch /> */}
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