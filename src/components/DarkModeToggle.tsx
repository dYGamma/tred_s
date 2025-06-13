// src/components/DarkModeToggle.tsx

"use client";

import { useEffect, useLayoutEffect, useState, useCallback } from "react";

export default function DarkModeToggle() {
  // isDark === true – включена тёмная тема, false – светлая, null – ещё не инициализировали
  const [isDark, setIsDark] = useState<boolean | null>(null);

  // Утилитарные функции для переключения класса на <html>
  const enableDark = useCallback(() => {
    document.documentElement.classList.add("dark");
    setIsDark(true);
  }, []);

  const enableLight = useCallback(() => {
    document.documentElement.classList.remove("dark");
    setIsDark(false);
  }, []);

  // При монтировании компонента: сразу до рендера (useLayoutEffect), пытаемся выставить тему
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") {
        enableDark();
        return;
      } else if (saved === "light") {
        enableLight();
        return;
      }
    } catch {
      // Если доступ к localStorage неожиданно запрещён, просто продолжаем далее
    }

    // Если явно не было сохранённого значения – смотрим системные настройки
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    if (mql.matches) {
      enableDark();
    } else {
      enableLight();
    }
  }, [enableDark, enableLight]);

  // После того как установлена тема, подписываемся на изменения системных настроек, если у пользователя нет своего сохранённого выбора
  useEffect(() => {
    let mql: MediaQueryList;
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") {
        // Пользователь явно выбирал ранее – не подписываемся на событие
        return;
      }
      mql = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = (e: MediaQueryListEvent) => {
        if (e.matches) {
          enableDark();
        } else {
          enableLight();
        }
      };
      mql.addEventListener("change", listener);
      return () => {
        mql.removeEventListener("change", listener);
      };
    } catch {
      // Если что-то пошло не так (например, доступ к localStorage или matchMedia запрещён),
      // просто ничего не делаем
      return;
    }
  }, [enableDark, enableLight]);

  // Обработчик клика: переключаем тему и сохраняем выбор в localStorage
  const toggleTheme = () => {
    if (isDark) {
      enableLight();
      try {
        localStorage.setItem("theme", "light");
      } catch {}
    } else {
      enableDark();
      try {
        localStorage.setItem("theme", "dark");
      } catch {}
    }
  };

  // Пока тема не определена, ничего не рендерим (избегаем «мигания»)
  if (isDark === null) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Переключиться на светлую тему" : "Переключиться на тёмную тему"}
      className="
        p-2 rounded-full
        hover:bg-gray-200 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-offset-2
        focus:ring-blue-500 dark:focus:ring-blue-300
        transition-colors
      "
    >
      {isDark ? (
        // Иконка "Солнце" для выхода из тёмной темы
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
