 # BIG Bro algorithm visualizer (backend)

Backend‑часть проекта визуализации алгоритмов сортировки. Отвечает за хранение пользователей и их настроек визуализации (размер массива, скорость работы алгоритма и т.п.), а также предоставляет HTTP‑API для фронтенда.

---

## Основные возможности

- **Регистрация пользователя** по email.
- **Хранение настроек визуализации** для каждого пользователя (размер массива, скорость).
- **Получение и обновление настроек** через REST‑API.
- **Автоматическое создание таблиц** в базе данных при старте приложения.

---

## Технологический стек и используемые инструменты

- **Python 3.11+** — язык реализации.
- **FastAPI** (`fastapi`)
  - Создание приложения и роутеров (`app/main.py`, `app/routes.py`).
  - Декораторы `@app.get`, `@router.post`, `@router.get`, `@router.patch` для описания HTTP‑эндпоинтов.
  - Система зависимостей (`Depends`) для проброса `AsyncSession` в хендлеры.
- **Starlette** (`starlette`)
  - Низкоуровневая ASGI‑основа, которую использует FastAPI.
- **Uvicorn** (`uvicorn`)
  - ASGI‑сервер, который запускает FastAPI‑приложение.
  - Запуск в `app/main.py` с параметром `reload=True` для разработки.
- **Pydantic v2** (`pydantic`, `pydantic-core`)
  - Описание схем входящих и исходящих данных (`app/schemas.py`).
  - Валидация email и полей настроек (типы `str`, `int`, `datetime`).
- **SQLAlchemy 2 (async)** (`SQLAlchemy`, `greenlet`)
  - Описание ORM‑моделей (`app/models.py`).
  - Асинхронный движок и сессии (`app/database.py`).
  - Выполнение запросов через `select()` в `app/queries.py`.
- **asyncpg** (`asyncpg`)
  - Асинхронный драйвер для PostgreSQL, используется SQLAlchemy‑движком.
- **PostgreSQL**
  - Основная СУБД для хранения пользователей и настроек.
- **anyio, h11, idna, typing_extensions** и др.
  - Вспомогательные зависимости FastAPI/Starlette и транспорта.

Все зависимости перечислены в `requirements.txt`.

---

## Структура проекта

Корень репозитория:

- **`app/`** — исходный код backend‑приложения.
- **`requirements.txt`** — список зависимостей.
- **`README.md`** — текущая документация.
- **`venv/`** (опционально) — виртуальное окружение Python.

Каталог `app/`:

- **`main.py`** — точка входа в приложение:
  - создаёт объект `FastAPI` с функцией `lifespan`;
  - подключает роутер из `routes.py`;
  - поднимает приложение через `uvicorn` (при запуске как скрипта).
- **`routes.py`** — маршруты API v1:
  - `POST /api/v1/users/create` — создание пользователя;
  - `GET /api/v1/users/settings` — получение настроек пользователя;
  - `PATCH /api/v1/users/settings` — обновление настроек пользователя.
- **`models.py`** — ORM‑модели SQLAlchemy:
  - `User` — таблица `users`;
  - `UserArrayConfiguration` — таблица `settings` (настройки пользователя).
- **`schemas.py`** — Pydantic‑схемы запросов/ответов:
  - `UserCreateRequest`, `UserCreateResponse`;
  - `GetUserSettingsResponse`;
  - `UpdateUserSettingsRequest`, `UpdateUserSettingsResponse`.
- **`services.py`** — бизнес‑логика поверх запросов к БД:
  - проверка уникальности email;
  - создание пользователя и его настроек;
  - получение и обновление настроек пользователя.
- **`queries.py`** — слой доступа к данным:
  - функции `get_user_by_email`, `get_user_settings` с использованием `select(...)`.
- **`database.py`** — работа с базой данных:
  - константа `DATABASE_URL` для подключения к PostgreSQL через `asyncpg`;
  - создание `engine` и `AsyncSessionLocal`;
  - декларативная база `Base` для моделей;
  - зависимость `get_session()` для FastAPI.

---

## Взаимодействие модулей и жизненный цикл запроса

### Общая схема

1. **Клиент (фронтенд / Postman / curl)** отправляет HTTP‑запрос на один из эндпоинтов.
2. **FastAPI‑приложение** в `app/main.py` принимает запрос и передаёт его в соответствующий маршрут `app/routes.py`.
3. В `routes.py`:
   - тело запроса парсится и валидируется через Pydantic‑схемы из `schemas.py`;
   - через `Depends(get_session)` поднимается асинхронная сессия к БД (`AsyncSession`).
4. Хендлер маршрута вызывает соответствующую функцию из `services.py`.
5. В `services.py`:
   - используется `AsyncSession` для выполнения запросов к базе через функции из `queries.py` или напрямую через ORM‑модели из `models.py`;
   - реализуется бизнес‑логика (проверка пользователя, создание/обновление настроек, обработка ошибок).
6. В `queries.py` выполняются SQL‑запросы через SQLAlchemy `select()` к моделям `User` и `UserArrayConfiguration`.
7. Результаты (модели ORM) возвращаются обратно в `services.py`, затем в `routes.py`.
8. В `routes.py` результат сериализуется в Pydantic‑схемы ответа и отправляется клиенту в виде JSON.

### Жизненный цикл запроса: создание пользователя

**Эндпоинт:** `POST /api/v1/users/create`

1. Клиент отправляет JSON с полем `email`.
2. FastAPI парсит тело в `UserCreateRequest`.
3. FastAPI создаёт `AsyncSession` через `get_session()` из `database.py`.
4. Вызов `save_user()` из `services.py`:
   - через `get_user_by_email()` из `queries.py` проверяет, существует ли пользователь;
   - если существует — выбрасывается `HTTPException(400)`;
   - если нет — создаётся объект `User`, сохраняется через ORM;
   - вызывается `save_user_settings()` для создания записи в `settings` (`UserArrayConfiguration`).
5. Возвращается `user.id`.
6. В `routes.py` формируется ответ `UserCreateResponse` и отправляется клиенту.

### Жизненный цикл запроса: получение настроек пользователя

**Эндпоинт:** `GET /api/v1/users/settings?user_id=...`

1. Клиент передаёт `user_id` в query‑параметрах.
2. FastAPI создаёт `AsyncSession` через `get_session()`.
3. Вызывается `get_user_settings_service()` из `services.py`.
4. В `get_user_settings_service()` вызывается `get_user_settings()` из `queries.py`.
5. Если запись не найдена — выбрасывается `HTTPException(404)`.
6. Если найдена — возвращается ORM‑модель `UserArrayConfiguration`.
7. В `routes.py` она конвертируется в `GetUserSettingsResponse` и отдаётся клиенту.

### Жизненный цикл запроса: обновление настроек пользователя

**Эндпоинт:** `PATCH /api/v1/users/settings`

1. Клиент отправляет JSON: `array_size`, `speed`, `user_id`.
2. FastAPI валидирует JSON через `UpdateUserSettingsRequest`.
3. Через `Depends(get_session)` создаётся `AsyncSession`.
4. Вызов `update_user_settings_service()` из `services.py`:
   - через `get_user_settings()` из `queries.py` находит текущие настройки;
   - если не найдены — `HTTPException(404)`;
   - если найдены — обновляет поля `array_size` и `speed` и коммитит транзакцию.
5. Обновлённая ORM‑модель возвращается, оборачивается в `UpdateUserSettingsResponse` и отправляется клиенту.

---

## Работа с базой данных

- Строка подключения находится в `app/database.py`:

```python
DATABASE_URL = "postgresql+asyncpg://postgres:admin@localhost:5432/algo_viz"
```

- При старте приложения в `lifespan` (в `main.py`) выполняется:

```python
async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)
```

Это автоматически создаёт таблицы `users` и `settings`, если их ещё нет.

- Модели:
  - `User` и `UserArrayConfiguration` наследуются от `Base` из `database.py`;
  - поле `user_id` в `UserArrayConfiguration` — внешний ключ на `users.id` (отношение один‑к‑одному).

---

## Pydantic‑схемы (данные запросов и ответов)

- **`UserCreateRequest`**
  - `email: str` — email пользователя.
- **`UserCreateResponse`**
  - `user_id: int` — идентификатор созданного пользователя.
- **`GetUserSettingsResponse`**
  - `array_size: int` — размер массива;
  - `speed: int` — скорость визуализации;
  - `updated_at: datetime` — дата обновления настроек;
  - `user_id: int` — идентификатор пользователя.
- **`UpdateUserSettingsRequest`**
  - `array_size: int` — новый размер массива;
  - `speed: int` — новая скорость;
  - `user_id: int` — идентификатор пользователя.
- **`UpdateUserSettingsResponse`**
  - зеркалирует поля настроек после обновления.

---

## Подготовка окружения и запуск

1. **Клонировать репозиторий**

```bash
git clone <url-этого-репозитория>
cd sorting_algorytm_visualizer
```

2. **Создать и активировать виртуальное окружение (по желанию)**

```bash
python -m venv venv
source venv/bin/activate  # macOS / Linux
# venv\Scripts\activate  # Windows
```

3. **Установить зависимости**

```bash
pip install -r requirements.txt
```

4. **Настроить PostgreSQL**

- создать базу данных `algo_viz`;
- убедиться, что доступен пользователь `postgres` с паролем `admin` (или изменить `DATABASE_URL` под себя);
- база должна быть доступна по адресу `localhost:5432`.

5. **Запустить приложение**

```bash
python -m app.main
```

По умолчанию приложение стартует на:

- `http://0.0.0.0:8000`

Документация Swagger будет доступна по адресу:

- `http://0.0.0.0:8000/docs`

---

## Эндпоинты API

### Health‑check

- **Метод:** `GET`
- **URL:** `/health-check`

Пример ответа:

```json
{
  "status": "OK"
}
```

### 1. Создание пользователя

- **Метод:** `POST`
- **URL:** `/api/v1/users/create`
- **Описание:** создаёт пользователя по email и создаёт запись настроек по умолчанию.

**Тело запроса**

```json
{
  "email": "user@example.com"
}
```

**Ответ `200 OK`**

```json
{
  "user_id": 1
}
```

**Ошибки**

- `400 Bad Request` — пользователь с таким email уже существует.

### 2. Получение настроек пользователя

- **Метод:** `GET`
- **URL:** `/api/v1/users/settings`
- **Query‑параметры:**
  - `user_id: int` — идентификатор пользователя.

**Пример запроса**

`GET /api/v1/users/settings?user_id=1`

**Ответ `200 OK`**

```json
{
  "array_size": 100,
  "speed": 1,
  "updated_at": "2024-01-01T12:00:00",
  "user_id": 1
}
```

**Ошибки**

- `404 Not Found` — настройки пользователя не найдены.

### 3. Обновление настроек пользователя

- **Метод:** `PATCH`
- **URL:** `/api/v1/users/settings`

**Тело запроса**

```json
{
  "array_size": 150,
  "speed": 2,
  "user_id": 1
}
```

`array_size` — размер массива для визуализации сортировки.

`speed` — скорость визуализации (относительная единица, обрабатывается фронтом).

**Ответ `200 OK`**

```json
{
  "array_size": 150,
  "speed": 2,
  "user_id": 1
}
```

**Ошибки**

- `404 Not Found` — настройки пользователя не найдены.

---

## Модели данных (кратко)

### User

- `id: int` — первичный ключ.
- `email: str` — уникальный email.
- `created_at: datetime` — дата создания.
- `settings: UserArrayConfiguration | None` — связанные настройки пользователя (one‑to‑one).

### UserArrayConfiguration

- `id: int` — первичный ключ.
- `array_size: int` — размер массива (по умолчанию `100`).
- `speed: int` — скорость (по умолчанию `1`).
- `updated_at: datetime` — время обновления записи.
- `user_id: int` — внешний ключ на `users.id` (уникальный, one‑to‑one).

---

## Дальнейшее развитие

Возможные направления расширения проекта:

- добавление разных типов алгоритмов сортировки и их параметров;
- хранение истории запусков визуализации и результатов;
- полноценная аутентификация/авторизация пользователей;
- интеграция с фронтендом визуализатора;
- вынесение конфигурации БД и окружения в переменные среды (`.env`).
