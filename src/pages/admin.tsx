// File: src/pages/admin.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import slugify from "slugify";

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
}

interface FrontMatterForm {
  title: string;
  date: string;
  description: string;
  tags: string; // строка через запятую
  slug: string; // для создания/редактирования slug
}

type Mode = "login" | "list" | "create" | "edit";

export default function AdminPage() {
  // 1. Аутентификация
  const [secret, setSecret] = useState("");                // для поля ввода
  const [storedSecret, setStoredSecret] = useState("");    // храним сюда пароль после успешного логина
  const [authenticated, setAuthenticated] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);

  // 2. CRUD‐состояния
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [frontMatterForm, setFrontMatterForm] = useState<FrontMatterForm>({
    title: "",
    date: new Date().toISOString().slice(0, 10),
    description: "",
    tags: "",
    slug: "",
  });
  const [content, setContent] = useState(""); // MDX‐контент
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 3. Хук viewMode (edit / preview)
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  // 4. После логина — fetch списка постов
  useEffect(() => {
    if (authenticated) {
      fetchPosts();
    }
  }, [authenticated]);

  // 5. Фильтрация при изменении searchQuery или posts
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
    } else {
      const q = searchQuery.trim().toLowerCase();
      setFilteredPosts(
        posts.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.slug.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, posts]);

  // 6. GET /api/posts — получить список постов
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data: PostMeta[] = await res.json();
        setPosts(data);
        setFilteredPosts(data);
      } else {
        console.error("Ошибка при получении списка постов");
        setError("Не удалось загрузить список постов");
      }
    } catch (e) {
      console.error(e);
      setError("Ошибка сети при получении постов");
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Обработка логина — POST /api/auth
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!secret.trim()) {
      setError("Введите пароль");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      if (res.ok) {
        // 1) Сохраняем пароль в storedSecret
        setStoredSecret(secret);
        // 2) Устанавливаем authenticated = true и переключаем режим на list
        setAuthenticated(true);
        setMode("list");
      } else if (res.status === 401) {
        setError("Неверный пароль");
      } else {
        setError("Ошибка аутентификации");
      }
    } catch (e) {
      console.error(e);
      setError("Сетевая ошибка при логине");
    } finally {
      setIsLoading(false);
      // только очищаем поле ввода, но не трогаем storedSecret
      setSecret("");
    }
  };

  // 8. Удаление поста — DELETE /api/posts/[slug]
  const handleDelete = async (slug: string) => {
    if (!confirm(`Вы уверены, что хотите удалить "${slug}"?`)) return;
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: storedSecret }), // передаём storedSecret
      });
      if (res.ok) {
        setSuccessMsg(`Пост "${slug}" удалён`);
        await fetchPosts();
      } else {
        const json = await res.json();
        setError(json.error || "Не удалось удалить пост");
      }
    } catch (e) {
      console.error(e);
      setError("Ошибка при удалении");
    } finally {
      setIsLoading(false);
    }
  };

  // 9. Открыть форму «Создать»
  const openCreateForm = () => {
    setSelectedSlug(null);
    const today = new Date().toISOString().slice(0, 10);
    setFrontMatterForm({
      title: "",
      date: today,
      description: "",
      tags: "",
      slug: `${today}-`,
    });
    setContent("");
    setError(null);
    setSuccessMsg(null);
    setMode("create");
    setViewMode("edit"); // сбрасываем viewMode
  };

  // 10. Открыть форму «Редактировать»
  const openEditForm = async (slug: string) => {
    setSelectedSlug(slug);
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    setViewMode("edit");
    try {
      const res = await fetch(`/api/posts/${slug}`);
      if (res.ok) {
        const json = await res.json();
        const { frontMatter, content } = json;
        setFrontMatterForm({
          title: frontMatter.title || "",
          date: frontMatter.date || new Date().toISOString().slice(0, 10),
          description: frontMatter.description || "",
          tags: Array.isArray(frontMatter.tags)
            ? (frontMatter.tags as string[]).join(",")
            : "",
          slug, // Текущий slug
        });
        setContent(content || "");
        setMode("edit");
      } else {
        setError("Не удалось загрузить пост для редактирования");
      }
    } catch (e) {
      console.error(e);
      setError("Ошибка при загрузке поста");
    } finally {
      setIsLoading(false);
    }
  };

  // 11. Отмена формы и возврат к списку
  const cancelForm = () => {
    setSelectedSlug(null);
    setContent("");
    setFrontMatterForm({
      title: "",
      date: new Date().toISOString().slice(0, 10),
      description: "",
      tags: "",
      slug: "",
    });
    setError(null);
    setSuccessMsg(null);
    setMode("list");
    setViewMode("edit");
  };

  // 12. Генерация slug на основе title + date (при создании)
  useEffect(() => {
    if (mode === "create") {
      const { title, date } = frontMatterForm;
      const base = slugify(title || "", {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });
      const newSlug = base ? `${date}-${base}` : `${date}-`;
      setFrontMatterForm((fm) => ({ ...fm, slug: newSlug }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontMatterForm.title, frontMatterForm.date]);

  // 13. Отправка формы (Create или Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const { title, date, description, tags, slug } = frontMatterForm;
    if (!title.trim() || !date.trim() || !content.trim() || !slug.trim()) {
      setError("Поля title, date, slug и content обязательны");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "create") {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "create",
            secret: storedSecret, // передаём storedSecret
            data: {
              title,
              date,
              description,
              tags,
              content,
            },
          }),
        });
        if (res.ok) {
          const json = await res.json();
          setSuccessMsg("Пост успешно создан");
          await fetchPosts();
          openEditForm(json.slug);
        } else {
          const json = await res.json();
          setError(json.error || "Ошибка при создании поста");
        }
      } else if (mode === "edit" && selectedSlug) {
        const res = await fetch(`/api/posts/${selectedSlug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "update",
            secret: storedSecret, // передаём storedSecret
            data: {
              title,
              date,
              description,
              tags: tags
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t.length > 0),
              content,
            },
          }),
        });
        if (res.ok) {
          setSuccessMsg("Пост успешно обновлён");
          await fetchPosts();
        } else {
          const json = await res.json();
          setError(json.error || "Ошибка при обновлении поста");
        }
      }
    } catch (e) {
      console.error(e);
      setError("Ошибка при сохранении");
    } finally {
      setIsLoading(false);
    }
  };

  // 14. Загрузка изображения — POST /api/upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "Ошибка при загрузке файла");
        return;
      }
      const json = await res.json();
      const imageUrl = json.url; // например: "/uploads/имя.png"
      setContent((prev) => `${prev}\n\n![alt текст](${imageUrl})\n`);
    } catch (e) {
      console.error(e);
      setError("Ошибка при запросе на загрузку изображения");
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  // ====== JSX: рендер ======

  // 15. Форма авторизации
  if (!authenticated || mode === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <form onSubmit={handleAuth} className="glass-card p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">Admin Login</h1>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          <label className="block mb-2">
            <span className="text-gray-700 dark:text-gray-300">Пароль:</span>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="mt-1 block w-full rounded-md bg-white/40 dark:bg-gray-800/40 border border-gray-300 dark:border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              placeholder="Введите секретный пароль"
              disabled={isLoading}
            />
          </label>
          <button type="submit" className="btn-primary w-full text-center" disabled={isLoading}>
            {isLoading ? "Проверка..." : "Войти"}
          </button>
        </form>
      </div>
    );
  }

  // 16. Список постов
  if (mode === "list") {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold dark:text-white">Admin Panel</h1>
            <button onClick={openCreateForm} className="btn-primary px-4 py-2" disabled={isLoading}>
              {isLoading ? <span className="spinner"></span> : "Создать новый пост"}
            </button>
          </div>

          {successMsg && <p className="text-green-600 mb-4">{successMsg}</p>}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          <div className="mb-4">
            <input
              type="text"
              placeholder="Поиск по заголовку или slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              disabled={isLoading}
            />
          </div>

          <table className="table-admin">
            <thead>
              <tr>
                <th>Заголовок</th>
                <th>Дата</th>
                <th>Slug</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.slug}>
                  <td>{post.title}</td>
                  <td>{post.date}</td>
                  <td>
                    <Link href={`/posts/${post.slug}`} target="_blank" className="text-blue-600 hover:underline">
                      {post.slug}
                    </Link>
                  </td>
                  <td>
                    <button onClick={() => openEditForm(post.slug)} className="text-blue-600 hover:underline mr-2" disabled={isLoading}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(post.slug)} className="text-red-600 hover:underline" disabled={isLoading}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500">
                    Ничего не найдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 17. Форма создания/редактирования
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="container mx-auto max-w-3xl">
        <div className="glass-card p-8 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold dark:text-white">{mode === "create" ? "Создать новый пост" : "Редактировать пост"}</h1>
            <button onClick={cancelForm} className="text-gray-600 dark:text-gray-300 hover:underline" disabled={isLoading}>
              Назад к списку
            </button>
          </div>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          {successMsg && <p className="text-green-600 mb-2">{successMsg}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Заголовок (title):</label>
              <input
                type="text"
                value={frontMatterForm.title}
                onChange={(e) =>
                  setFrontMatterForm({
                    ...frontMatterForm,
                    title: e.target.value,
                  })
                }
                className="admin-input"
                placeholder="Мой новый пост"
                disabled={isLoading}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Дата (YYYY-MM-DD):</label>
              <input
                type="date"
                value={frontMatterForm.date}
                onChange={(e) =>
                  setFrontMatterForm({
                    ...frontMatterForm,
                    date: e.target.value,
                  })
                }
                className="admin-input"
                disabled={isLoading}
              />
            </div>

            {/* Slug (только при создании) */}
            {mode === "create" && (
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Slug (автогенерируется, но можно изменить):</label>
                <input
                  type="text"
                  value={frontMatterForm.slug}
                  onChange={(e) =>
                    setFrontMatterForm({
                      ...frontMatterForm,
                      slug: e.target.value.trim(),
                    })
                  }
                  className="admin-input"
                  placeholder="YYYY-MM-DD-moj-novyi-post"
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Изменение slug после создания может сломать существующие ссылки.
                </p>
              </div>
            )}

            {/* Slug (при редактировании, только для справки) */}
            {mode === "edit" && (
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Текущий Slug:</label>
                <p className="mt-1 text-gray-700 dark:text-gray-300 font-mono">{frontMatterForm.slug}</p>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Описание (description):</label>
              <textarea
                value={frontMatterForm.description}
                onChange={(e) =>
                  setFrontMatterForm({
                    ...frontMatterForm,
                    description: e.target.value,
                  })
                }
                className="admin-textarea h-20"
                placeholder="Краткое описание поста"
                disabled={isLoading}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Теги (через запятую):</label>
              <input
                type="text"
                value={frontMatterForm.tags}
                onChange={(e) =>
                  setFrontMatterForm({
                    ...frontMatterForm,
                    tags: e.target.value,
                  })
                }
                className="admin-input"
                placeholder="например: nextjs,react,tailwind"
                disabled={isLoading}
              />
              <div className="flex flex-wrap mt-2">
                {frontMatterForm.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter((t) => t.length > 0)
                  .map((t) => (
                    <div key={t} className="tag-chip">
                      {t}
                      {!isLoading && (
                        <button
                          type="button"
                          onClick={() => {
                            const arr = frontMatterForm.tags
                              .split(",")
                              .map((x) => x.trim())
                              .filter((x) => x && x !== t);
                            setFrontMatterForm({
                              ...frontMatterForm,
                              tags: arr.join(","),
                            });
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Загрузка картинки */}
            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Загрузить картинку:</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="admin-input" disabled={isLoading} />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Файл будет загружен в `/public/uploads`, и ссылка вставится в текст.
              </p>
            </div>

            {/* Переключатель «Редактор / Превью» */}
            <div className="view-mode-toggle flex items-center gap-4 mt-4">
              <label>
                <input type="radio" name="viewMode" value="edit" checked={viewMode === "edit"} onChange={() => setViewMode("edit")} disabled={isLoading} />
                <span className="ml-1">Редактор</span>
              </label>
              <label>
                <input type="radio" name="viewMode" value="preview" checked={viewMode === "preview"} onChange={() => setViewMode("preview")} disabled={isLoading} />
                <span className="ml-1">Превью</span>
              </label>
            </div>

            {/* Контент или превью */}
            {viewMode === "edit" ? (
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Содержимое (MDX):</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="admin-textarea h-64 font-mono"
                  placeholder={`# Заголовок\n\nВаш текст…\n\n**жирный** *курсив* \n\n\`\`\`js\nconsole.log("Hello world");\n\`\`\``}
                  disabled={isLoading}
                />
              </div>
            ) : (
              <div className="mt-4 p-4 bg-white/40 dark:bg-gray-800/40 rounded-md border border-gray-300 dark:border-gray-600 overflow-auto prose dark:prose-invert max-h-96">
                <ReactMarkdown>{content || "*Нет содержимого*"}</ReactMarkdown>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary w-full text-center">
              {isLoading ? <span className="spinner"></span> : mode === "create" ? "Создать пост" : "Сохранить изменения"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
