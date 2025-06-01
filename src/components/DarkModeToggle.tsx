// src/components/DarkModeToggle.tsx

"use client";

import { useEffect, useState } from "react";

/**
 * DarkModeToggle
 *
 * Компонент переключателя светлого/тёмного режима для Next.js +
 * Tailwind CSS. Хранит выбор пользователя в localStorage и
 * автоматически подгружает предпочтения системы при первом рендере.
 *
 * Применяется класс "dark" к элементу <html> для активации темной темы,
 * так как в tailwind.config.js указан `darkMode: 'class'`.
 */

export default function DarkModeToggle() {
  // Состояние текущей темы (true = dark, false = light)
  const [isDark, setIsDark] = useState(false);

  // При монтировании компонента:
  useEffect(() => {
    // Проверяем, был ли ранее сохранён выбор темы
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      // Если выбор не сохранён, используем системные настройки
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      }
    }
  }, []);

  // Обработчик клика по кнопке
  const toggleTheme = () => {
    const htmlClassList = document.documentElement.classList;
    if (htmlClassList.contains("dark")) {
      htmlClassList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      htmlClassList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Переключить светлый/тёмный режим"
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-300 transition-colors"
    >
      {isDark ? (
        // Иконка "Солнце" для выхода из темной темы
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-yellow-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M6.05 6.05L4.636 4.636m12.728 0l-1.414 1.414M6.05 17.95l-1.414 1.414"
          />
          <circle cx="12" cy="12" r="5" stroke="none" fill="currentColor" />
        </svg>
      ) : (
        // Иконка "Луна" для перехода в тёмную тему
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-800 dark:text-gray-200"
          fill="currentColor"
          viewBox="0 0 24 24"
          stroke="none"
        >
          <path d="M21 12.79A9 9 0 0111.21 3a7 7 0 000 14A9 9 0 0121 12.79z" />
        </svg>
      )}
    </button>
  );
}
