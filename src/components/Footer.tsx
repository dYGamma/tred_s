// src/components/Footer.tsx

export default function Footer() {
  return (
    <footer className="mt-12">
      <div className="glass-footer container flex flex-col md:flex-row items-center justify-between py-6">
        {/* Левый блок: © и год */}
        <span className="text-sm text-gray-700 dark:text-gray-300">
          © {new Date().getFullYear()} ShizBlog.
        </span>

        {/* Правый блок: навигационные ссылки
        <nav className="flex flex-wrap space-x-4 mt-3 md:mt-0">
          <a
            href="/"
            className="text-sm hover:underline text-gray-700 dark:text-gray-300 transition-colors"
          >
            Главная
          </a>
          <a
            href="/tags/"
            className="text-sm hover:underline text-gray-700 dark:text-gray-300 transition-colors"
          >
            Теги
          </a>
          <a
            href="https://github.com/dYGamma"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:underline text-gray-700 dark:text-gray-300 transition-colors"
          >
            GitHub
          </a>
          <a
            href="/rss.xml"
            className="text-sm hover:underline text-gray-700 dark:text-gray-300 transition-colors"
          >
            RSS
          </a>
        </nav> */}
      </div>
    </footer>
  );
}
