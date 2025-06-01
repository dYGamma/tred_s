// src/components/Header.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);

  // При маунте компонента подхватываем сохранённую тему из localStorage
  useEffect(() => {
    const saved = window.localStorage.getItem("theme");
    const isDark = saved === "dark";
    setDarkMode(isDark);
    document.body.classList.toggle("dark-theme", isDark);
  }, []);

  // Функция переключения темы
  const toggleTheme = () => {
    const now = !darkMode;
    setDarkMode(now);
    document.body.classList.toggle("dark-theme", now);
    window.localStorage.setItem("theme", now ? "dark" : "light");
  };

  return (
    <header className="header">
      <div className="header__inner flex items-center justify-between px-4 py-3">
        {/* Логотип */}
        <Link
          href="/"
          className="logo flex items-center space-x-2 no-underline text-gray-900 dark:text-gray-100"
        >
          <span className="logo__mark">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              viewBox="0 0 44 44"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            >
              <path d="M15 8l14.729 14.382L15 35.367" />
            </svg>
          </span>
          <span className="logo__text font-semibold text-xl">ShizBlog</span>
          <span className="logo__cursor w-1 h-5 bg-gray-900 dark:bg-gray-100 animate-pulse" />
        </Link>

        {/* ВСЕГДА отображаем навигацию «Главная», «Теги», «|», переключатель темы и иконки */}
        <div className="nav-inline">
          {/* Ссылка «Главная» */}
          <Link
            href="/"
            className={`text-sm ${
              pathname === "/"
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300"
            } hover:underline`}
          >
            Главная
          </Link>

          {/* Ссылка «Теги» */}
          <Link
            href="/tags/"
            className={`text-sm ${
              pathname?.startsWith("/tags")
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300"
            } hover:underline`}
          >
            Теги
          </Link>

          {/* Вертикальная палочка-разделитель */}
          <span className="text-gray-400 dark:text-gray-600">|</span>

          {/* Кнопка переключения темы */}
          <button
            onClick={toggleTheme}
            className="
              theme-toggle
              w-8 h-8
              flex items-center justify-center
              rounded-full
              bg-gray-200 dark:bg-gray-800
              hover:bg-gray-300 dark:hover:bg-gray-700
              transition-colors
            "
            aria-label="Toggle Theme"
          >
            {darkMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 44 44"
                fill="currentColor"
                className="text-yellow-400"
              >
                <path d="M22 41C32.4934 41 41 32.4934 41 22C41 11.5066 32.4934 3 22 3C11.5066 3 3 11.5066 3 22C3 32.4934 11.5066 41 22 41ZM7 22C7 13.7157 13.7157 7 22 7V37C13.7157 37 7 30.2843 7 22Z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 44 44"
                fill="currentColor"
                className="text-gray-800 dark:text-gray-200"
              >
                <path d="M22 41C32.4934 41 41 32.4934 41 22C41 11.5066 32.4934 3 22 3C11.5066 3 3 11.5066 3 22C3 32.4934 11.5066 41 22 41Z" />
              </svg>
            )}
          </button>

          {/* Иконка «Обо мне» */}
          <a
            href="http://83.217.213.172/"
            target="_blank"
            rel="noopener noreferrer"
            className="
              w-8 h-8
              flex items-center justify-center
              rounded-full
              bg-gray-200 dark:bg-gray-800
              hover:bg-gray-300 dark:hover:bg-gray-700
              transition-colors
            "
            aria-label="Обо мне"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="text-gray-700 dark:text-gray-300"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 
                   1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
          </a>

          {/* Иконка GitHub */}
          <a
            href="https://github.com/dYGamma"
            target="_blank"
            rel="noopener noreferrer"
            className="
              w-8 h-8
              flex items-center justify-center
              rounded-full
              bg-gray-200 dark:bg-gray-800
              hover:bg-gray-300 dark:hover:bg-gray-700
              transition-colors
            "
            aria-label="GitHub"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="text-gray-700 dark:text-gray-300"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 
                   9.8 8.205 11.385.6.113.82-.26.82-.577 
                   0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61C4.422 
                   17.1 3.633 16.8 3.633 16.8c-1.086-.744.083-.729.083-.729 
                   1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 
                   1.305 3.492.997.108-.776.42-1.305.762-1.605-2.665-.3-5.466-1.337-5.466-5.93 
                   0-1.31.47-2.38 1.235-3.22-.125-.303-.535-1.523.115-3.176 
                   0 0 1.005-.322 3.3 1.23a11.49 11.49 0 0 1 3-.405c1.02.005 
                   2.045.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.655 
                   1.653.245 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 
                   0 4.61-2.805 5.625-5.475 5.92.435.375.81 1.102.81 2.222 
                   0 1.606-.015 2.896-.015 3.286 0 .315.21.697.825.577A12.013 
                   12.013 0 0 0 24 12c0-6.63-5.37-12-12-12z"
              />
            </svg>
          </a>

          {/* Иконка Telegram */}
          <a
            href="https://t.me/kwopchiq"
            target="_blank"
            rel="noopener noreferrer"
            className="
              w-8 h-8
              flex items-center justify-center
              rounded-full
              bg-gray-200 dark:bg-gray-800
              hover:bg-gray-300 dark:hover:bg-gray-700
              transition-colors
            "
            aria-label="Telegram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="text-gray-700 dark:text-gray-300"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 0C5.37 0 0 5.37 0 12c0 6.63 
                   5.37 12 12 12s12-5.37 12-12c0-6.63-5.37-12-12-12zm5.292 
                   7.15l-1.28 6.04c-.096.45-.35.56-.71.35l-1.97-1.45-0.95 
                   0.92c-.104.104-.19.191-.39.191l.14-1.99 3.62-3.27c.157-0.14-.034-0.22-.243-0.08l-4.47 
                   2.81-1.92-.6c-.417-.13-.426-.417.087-.617l7.52-2.9c.35-.13.65.08.54.61z"
              />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
