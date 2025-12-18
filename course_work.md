# Course Work Report — Sorting Algorithm Visualizer

## 1. Аннотация

Проект представляет собой интерактивный визуализатор алгоритмов сортировки с простой email‑авторизацией и сохранением пользовательских настроек (размер массива и скорость анимации) в базе данных.

Архитектурно проект разделён на две части:

- **Frontend** — веб‑приложение на React, отвечающее за UI, выбор алгоритма, генерацию массива, воспроизведение анимации сортировки по шагам.
- **Backend** — HTTP API на FastAPI, отвечающее за регистрацию/логин пользователя и сохранение/выдачу его настроек.

Дополнительно, в каталоге `frontend/` присутствует **Node/Express сервер‑обёртка**, который в режиме разработки интегрирует Vite как middleware (и отдаёт SPA на том же порту), а в production отдаёт собранную статику.

---

## 2. Цель и задачи

**Цель:** реализовать понятный и удобный инструмент для наглядной демонстрации работы алгоритмов сортировки.

**Задачи:**

- Реализовать визуализацию сортировки массива в виде столбиков (bar chart).
- Реализовать несколько алгоритмов сортировки и унифицированный формат «шагов» для проигрывания анимации.
- Добавить минимальную авторизацию по email (login/register).
- Сохранять пользовательские настройки визуализации в БД и синхронизировать их с UI.
- Подготовить конфигурацию для разработки и запуска через Docker.

---

## 3. Стек технологий

### 3.1 Frontend (UI)

- **React 18 + TypeScript** — компонентная UI‑архитектура.
- **Vite** — dev‑сервер и сборка фронтенда.
- **Tailwind CSS** — стили.
- **shadcn/ui + Radix UI** — готовые UI‑компоненты.
- **Lucide React** — иконки.
- **next-themes** — переключение темы (light/dark).

### 3.2 Backend (API)

- **Python 3.11+ (в Dockerfile 3.12‑slim)**
- **FastAPI** — REST API.
- **Uvicorn** — ASGI сервер.
- **Pydantic v2** — схемы запросов/ответов и настройки.
- **SQLAlchemy 2 async + asyncpg** — доступ к PostgreSQL.
- **PostgreSQL** — хранилище пользователей и настроек.

### 3.3 Инфраструктура/запуск

- **Docker / docker-compose** — запуск сервисов.
- **Node 20** — для `frontend/`.

---

## 4. Структура репозитория

Корень проекта:

```
course_work/
├── backend/                  # Python FastAPI backend
├── frontend/                 # React SPA + Node/Express wrapper
├── docker-compose.yml         # Запуск сервисов frontend+backend
├── .env                       # Переменные окружения (локально)
└── .env.example               # Пример переменных окружения
```

### 4.1 Backend

```
backend/
├── app/
│   ├── main.py               # Создание FastAPI приложения + CORS + lifespan
│   ├── routes.py             # Роутер /api/v1/*
│   ├── schemas.py            # Pydantic-схемы
│   ├── models.py             # ORM модели User и UserArrayConfiguration
│   ├── database.py           # engine + AsyncSessionLocal + dependency get_session
│   ├── settings.py           # Pydantic Settings (POSTGRES_*)
│   ├── queries.py            # Функции выборки из БД
│   └── services.py           # Бизнес-логика API
├── requirements.txt
├── Dockerfile
└── README.md                 # Документация backend (подробная)
```

### 4.2 Frontend

```
frontend/
├── client/
│   ├── index.html
│   └── src/
│       ├── main.tsx          # React entrypoint
│       ├── App.tsx           # Root component (Auth -> Main UI)
│       ├── algorithms/       # Реализации сортировок (steps)
│       ├── components/       # UI компоненты (Auth, SettingsPanel, SortingVisualizer, ...)
│       ├── hooks/            # use-toast, use-theme, use-mobile
│       └── lib/              # API client + config
├── server/
│   ├── index.ts              # Express entrypoint; Vite middleware or static
│   ├── vite.ts               # Подключение Vite как middleware
│   ├── static.ts             # Отдача dist/public в production
│   ├── routes.ts             # Заготовка маршрутов (пока пусто)
│   └── storage.ts            # Заготовка IStorage + MemStorage
├── shared/
│   └── schema.ts             # Drizzle schema (users: username/password) — шаблон/заготовка
├── script/build.ts           # Сборка: vite build (client) + esbuild (server)
├── vite.config.ts            # Vite config (root=client, outDir=dist/public)
├── tailwind.config.ts        # Tailwind config
├── drizzle.config.ts         # Drizzle migrations config
├── package.json
└── README.md                 # Документация frontend
```

**Важно:** текущая бизнес‑логика проекта ориентирована на **Python backend** из `backend/`. Node/Express часть внутри `frontend/server` используется как оболочка для отдачи фронтенда и dev‑интеграции, а не как полноценный API.

---

## 5. Архитектура и взаимодействие компонентов

### 5.1 Общая схема (уровень сервисов)

- **Browser (React UI)**
  - отображает визуализацию
  - управляет настройками
  - отправляет запросы к API
- **Backend API (FastAPI)**
  - хранит пользователей
  - хранит настройки
  - возвращает/обновляет настройки
- **Database (PostgreSQL)**
  - таблица `users`
  - таблица `settings`

### 5.2 Точки входа

- Frontend UI:
  - `frontend/client/src/main.tsx` → рендер `<App />`
  - `frontend/client/src/App.tsx` → решает, показывать ли `<Auth />` или основной интерфейс
- Frontend wrapper server:
  - `frontend/server/index.ts`
    - dev: подключает Vite middleware (`setupVite`)
    - prod: отдаёт `dist/public` (`serveStatic`)
- Backend API:
  - `backend/app/main.py` создаёт `FastAPI` и подключает `routes.py`

---

## 6. Backend (FastAPI) — модульный разбор

### 6.1 `app/settings.py` — конфигурация окружения

- Читает переменные окружения `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`.
- Формирует `database_url` вида:

`postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DB`

### 6.2 `app/database.py` — подключение к БД

- Создаёт `engine = create_async_engine(settings.database_url)`.
- Создаёт фабрику сессий `AsyncSessionLocal`.
- Экспортирует зависимость `get_session()` для `Depends()`.

### 6.3 `app/models.py` — модели данных

- `User`:
  - `id: int` (PK)
  - `email: str` (unique)
  - `created_at: datetime`
  - `settings: UserArrayConfiguration | None` (one‑to‑one)

- `UserArrayConfiguration` (таблица `settings`):
  - `array_size: int` (default=100)
  - `speed: int` (default=1)
  - `updated_at: datetime` (auto)
  - `user_id: int` (FK на `users.id`, unique)

### 6.4 `app/schemas.py` — контракты API

- `UserCreateRequest(email)` / `UserCreateResponse(user_id)`
- `UserLoginRequest(email)` / `UserLoginResponse(user_id)`
- `GetUserSettingsResponse(array_size, speed, updated_at, user_id)`
- `UpdateUserSettingsRequest(array_size, speed, user_id)`
- `UpdateUserSettingsResponse(array_size, speed, user_id)`

### 6.5 `app/queries.py` — слой выборки

- `get_user_by_email(email, db)`
- `get_user_settings(user_id, db)`

### 6.6 `app/services.py` — бизнес‑логика

- `save_user()`:
  - проверяет уникальность email
  - создаёт пользователя
  - создаёт дефолтные настройки в `settings`

- `login_user()`:
  - проверяет, что пользователь существует
  - возвращает `user_id`

- `get_user_settings_service()`:
  - возвращает настройки или `404`

- `update_user_settings_service()`:
  - обновляет `array_size` и `speed`
  - коммитит изменения

### 6.7 `app/routes.py` — роутинг API

Префикс: `/api/v1`

- `POST /users/create`
- `POST /users/login`
- `GET /users/settings?user_id=...`
- `PATCH /users/settings`

Дополнительно:

- `GET /health-check` в `main.py`

---

## 7. Frontend (React) — модульный разбор

### 7.1 `src/lib/config.ts` — конфигурация API

- `API_BASE_URL = import.meta.env.VITE_API_BASE_URL || <fallback>`

Это означает:

- в нормальном окружении нужно задавать `VITE_API_BASE_URL` (например, `http://localhost:8000`).
- если переменная не задана — используется fallback URL.

### 7.2 `src/lib/api.ts` — API‑клиент

Содержит функции, которые обращаются к backend API:

- `createUser(email)` → `POST /api/v1/users/create`
- `loginUser(email)` → `POST /api/v1/users/login`
- `getUserSettings(userId)` → `GET /api/v1/users/settings?user_id=...`
- `updateUserSettings(userId, settings)` → `PATCH /api/v1/users/settings`

### 7.3 `src/App.tsx` — корневой компонент

Логика:

- читает `user_id` из `localStorage`
- если `user_id` отсутствует → показывает `<Auth />`
- иначе показывает основной интерфейс:
  - `<SettingsPanel />` (левая панель)
  - `<SortingVisualizer />` (правая часть)

Состояния:

- `userId: number | null`
- `settings: UserSettings` (array_size, speed)
- `selectedAlgorithm: AlgorithmType` ('bubble' | 'quick' | 'insertion' | 'selection')

### 7.4 `components/auth.tsx` — авторизация

- два режима: `login` / `register`
- отправляет запросы через `loginUser` / `createUser`
- на успехе сохраняет:
  - `localStorage.user_id`
  - `localStorage.user_email`

**Примечание по безопасности:** это упрощённая авторизация без пароля и без токенов, предназначенная для учебной/демонстрационной задачи.

### 7.5 `components/settings-panel.tsx` — настройки + синхронизация

Функции:

- **Загрузка настроек** при старте:
  - `getUserSettings(userId)`
  - если ошибка → берёт дефолт `{ array_size: 30, speed: 50 }`

- **Синхронизация настроек** при изменении:
  - debounce 500ms
  - `updateUserSettings(userId, newSettings)`
  - отображает статус `syncing/saved/error`

- **Выбор алгоритма**:
  - рендерит Select на основе `algorithms` из `src/algorithms/index.ts`

### 7.6 `components/sorting-visualizer.tsx` — визуализация

Ключевая идея: каждый алгоритм сортировки возвращает массив шагов `SortStep[]`, где:

- `array: number[]` — текущее состояние массива
- `active: number[]` — индексы элементов, которые «сравниваются/переставляются»
- `sorted: number[]` — индексы элементов, считающихся отсортированными

Внутренние состояния:

- `baseArray` — исходный массив
- `steps` — вычисленные шаги
- `currentStep` — индекс текущего шага
- `isPlaying` — проигрывание

Проигрывание:

- `setTimeout` на `settings.speed` миллисекунд
- инкремент `currentStep`
- по завершении — `isPlaying=false`

Рендер:

- каждый элемент массива отображается столбиком
- цвет столбика зависит от принадлежности индекса к `active`/`sorted`

### 7.7 `algorithms/*` — алгоритмы сортировки

- `bubbleSort(inputArray)`
- `insertionSort(inputArray)`
- `quickSort(inputArray)`
- `selectionSort(inputArray)`

Все алгоритмы возвращают одинаковый формат `SortStep[]`.

#### 7.7.1 Сортировка выбором (Selection Sort)

Реализация находится в `frontend/client/src/algorithms/selectionSort.ts`.

Логика работы:

- **[идея]** Для каждой позиции `i` алгоритм ищет минимальный элемент на отрезке `i..n-1` и меняет его местами с элементом на `i`.
- **[визуализация через steps]** В процессе формируются шаги `SortStep[]`:
  - поле `active` подсвечивает сравниваемые индексы (`minIndex` и `j`) во внутреннем цикле;
  - после перестановки `active` содержит `[i, minIndex]` (момент swap);
  - множество `sorted` постепенно пополняется индексами, которые уже зафиксированы на своих позициях (после каждой итерации внешнего цикла).

`algorithms/index.ts`:

- экспортирует реализации
- содержит справочник метаданных `algorithms` (name/complexity/description)
- тип `AlgorithmType`

---

## 8. Node/Express wrapper в `frontend/server`

### 8.1 Назначение

Эта часть не реализует бизнес‑API визуализатора. Она решает задачи:

- **В dev‑режиме**: поднимает Express на `PORT` (по умолчанию 5000) и подключает Vite как middleware (SPA доступна на этом же порту).
- **В prod‑режиме**: раздаёт собранную статику (`dist/public`) и запускает Node‑bundle `dist/index.cjs`.

### 8.2 Файлы

- `server/index.ts`
  - общая точка входа
  - логирует запросы `/api*`
  - переключает режим dev/prod

- `server/vite.ts`
  - `setupVite(server, app)`
  - отдаёт `index.html`, прокидывает HMR

- `server/static.ts`
  - `serveStatic(app)`
  - отдаёт `dist/public` + fallback на `index.html`

- `server/routes.ts`
  - заготовка для будущих API маршрутов (сейчас пусто)

- `server/storage.ts`
  - заготовка для интерфейса хранения `IStorage`
  - `MemStorage` как in‑memory реализация

---

## 9. Сценарии использования и потоки данных

### 9.1 Сценарий: регистрация пользователя

1. Пользователь вводит email в `<Auth />` и выбирает режим Register.
2. Frontend вызывает `createUser(email)`.
3. Backend:
   - `routes.py` → `services.save_user()`
   - создаёт пользователя и дефолтные настройки
4. Frontend сохраняет `user_id` в `localStorage` и переходит к основному UI.

### 9.2 Сценарий: логин пользователя

1. Пользователь вводит email в `<Auth />` (mode=login).
2. Frontend вызывает `loginUser(email)`.
3. Backend:
   - `services.login_user()`
   - если пользователя нет → 404
4. Frontend сохраняет `user_id` и открывает основной UI.

### 9.3 Сценарий: загрузка настроек

1. После логина рендерится `<SettingsPanel userId=... />`.
2. Компонент вызывает `getUserSettings(userId)`.
3. Backend читает настройки из таблицы `settings`.
4. UI устанавливает локальное состояние `settings` и передаёт их наверх через `onSettingsChange`.

### 9.4 Сценарий: изменение настроек и синхронизация

1. Пользователь меняет `array_size` или `speed`.
2. UI мгновенно применяет настройки локально.
3. Через debounce (500ms) отправляется `PATCH /api/v1/users/settings`.
4. UI показывает статус:
   - `syncing` во время запроса
   - `saved` при успехе
   - `error` при сбое

### 9.5 Сценарий: запуск визуализации сортировки

1. Пользователь выбирает алгоритм (Bubble / Insertion / Quick / Selection).
2. Нажимает `Start`.
3. Компонент `SortingVisualizer`:
   - вычисляет `steps = runAlgorithm(baseArray)`
   - запускает таймер, увеличивая `currentStep`
4. На каждом шаге обновляется `currentDisplay` и перерисовываются столбики.

---

## 10. Запуск проекта

### 10.1 Переменные окружения

Файл `.env.example` в корне содержит шаблон:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_PORT`
- `POSTGRES_HOST`
- `VITE_API_BASE_URL` (пример: `http://localhost:8000`)
- `PORT` (для Express wrapper в `frontend/`, по умолчанию 5000)
- `NODE_ENV`

**Рекомендация:** для локальной разработки создать `.env` в корне и заполнить:

- `VITE_API_BASE_URL=http://localhost:8000`
- `POSTGRES_*` для backend

### 10.2 Локальный запуск (без Docker)

#### Backend

1. Поднять PostgreSQL (в проекте нет контейнера Postgres в docker-compose; БД должна быть доступна отдельно).
2. Установить зависимости:
   - `pip install -r backend/requirements.txt`
3. Запуск:
   - `uvicorn app.main:app --host 0.0.0.0 --port 8000`

#### Frontend

1. Установить зависимости:
   - `npm install` в `frontend/`
2. Запуск dev:
   - `npm run dev` (порт 5000)

### 10.3 Запуск через Docker Compose

В корне проекта:

- `docker-compose.yml` поднимает два сервиса:
  - `frontend` (порт `80:5000`)
  - `backend` (порт `8000:8000`)

Команда:

- `docker-compose up --build`

**Важно:** backend всё равно ожидает доступный PostgreSQL по переменным `POSTGRES_*`. Если Postgres не поднят отдельно — backend не сможет подключиться.

---

## 11. Известные особенности и ограничения

- **Авторизация упрощённая**: только email, без пароля и без токенов. Это допустимо для учебного проекта, но не подходит для production.
- **Node/Express API во frontend не реализован** (`frontend/server/routes.ts` и `storage.ts` выглядят как шаблонные заготовки).
- **Drizzle schema в `frontend/shared/schema.ts`** описывает пользователей как `username/password`, что не совпадает с фактической моделью backend (email). Вероятно, это остаток шаблона и сейчас не используется.
- В `backend/app/services.py` в одной ветке используется `status.http_404_not_found` (вместо `status.HTTP_404_NOT_FOUND`) — это потенциальная ошибка, которую стоит поправить при дальнейшем развитии.

---

## 12. Направления развития

- Добавить новые алгоритмы (merge sort, heap sort и др.) и унифицировать визуализацию дополнительных событий (pivot, swap, overwrite).
- Добавить историю запусков (какой алгоритм, какой массив, сколько шагов, сколько времени).
- Улучшить безопасность (пароль/хеш, токены, сессии, ограничение CORS).
- Добавить контейнер PostgreSQL в `docker-compose.yml` для полностью автономного запуска.
- Реализовать backend‑валидации диапазонов `array_size`/`speed`, чтобы гарантировать корректность данных.

---

## 13. Краткий вывод

Проект реализует полный цикл учебного приложения: UI визуализации + сервис хранения пользовательских настроек. Реализация показывает основные инженерные практики: модульность, явные контракты API, типизацию, разделение ответственности и поддерживаемый процесс сборки/запуска.
