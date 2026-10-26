# AgroLab

Веб-приложение для управления работой агролаборатории: учёта образцов и результатов исследований, ведения справочников, контроля реагентов и подготовки документов.

Проект объединяет backend на ASP.NET Core, базу данных PostgreSQL и интерфейс на React.

## Возможности

- **Образцы и исследования:** регистрация образцов, редактирование данных и сохранение результатов анализов.
- **Справочники:** управление заказчиками, культурами, оборудованием, реагентами и поставщиками.
- **Учёт реактивов:** API поступления, расхода и получения остатков.
- **Документы:** формирование этикеток и протоколов по шаблонам DOCX, загрузка и скачивание протоколов.
- **Экспорт:** выгрузка данных образцов в Excel.
- **Отчёты:** получение сводных данных и информации о просроченных позициях.
- **Пользователи:** JWT-аутентификация, профиль, смена пароля и регистрация пользователей администратором.

## Технологии

| Компонент | Технологии |
|---|---|
| Backend | C#, .NET 8, ASP.NET Core Web API |
| База данных | PostgreSQL 15 |
| ORM | Entity Framework Core, Npgsql |
| Аутентификация | JWT Bearer, BCrypt |
| Frontend | React 17, JavaScript, React Router, Tailwind CSS |
| Документы | Open XML SDK, ClosedXML |
| Документация API | Swagger / OpenAPI |
| Инфраструктура | Docker, Docker Compose, Nginx |

## Устройство приложения

Frontend обращается к HTTP API backend. Сервер обрабатывает запросы, получает и сохраняет данные через Entity Framework Core, формирует документы на основе шаблонов.

Backend разделён на контроллеры, DTO, сущности, сервисы и вспомогательные модули. Во frontend компоненты сгруппированы по предметным разделам; работа с API вынесена в `services` и `Repository`.

## Структура проекта

```text
AgrolabProjectVersion/
├── AgroLab/                    # ASP.NET Core API
│   ├── Controllers/            # Обработка HTTP-запросов
│   ├── DTOs/                   # Модели запросов и ответов
│   ├── Entities/               # Сущности и DbContext
│   ├── Services/               # Токены, аудит, документы
│   ├── Filters/                # Фильтры действий
│   ├── Templates/              # Шаблоны DOCX
│   ├── Utils/                  # Вспомогательные модули
│   ├── Program.cs
│   ├── appsettings.json
│   ├── appsettings.Production.json
│   └── Dockerfile
├── AgroLab-frontend/           # React-приложение
│   ├── src/
│   │   ├── components/
│   │   ├── Repository/
│   │   ├── services/
│   │   └── utils/
│   ├── public/
│   ├── package.json
│   ├── nginx.conf
│   ├── Dockerfile
│   └── docker-compose.yml
├── db/init/
│   └── agrolab_dump.sql        # Инициализация базы данных
└── docker-compose.yml         # PostgreSQL и backend
```

## Локальный запуск

### Требования

- Git.
- Docker с Docker Compose.
- Node.js и npm для запуска frontend в режиме разработки.

### 1. Клонирование

```bash
git clone https://github.com/hulymuly/AgrolabProjectVersion.git
cd AgrolabProjectVersion
```

### 2. Настройка базы данных и backend

Проверь параметры PostgreSQL в корневом `docker-compose.yml` и строку подключения `ConnectionStrings:DefaultConnection` в файле:

```text
AgroLab/appsettings.Production.json
```

Для backend внутри Docker Compose адрес базы данных — `db`:

```text
Host=db;Port=5432;Database=AgroLab;Username=postgres;Password=<пароль>
```

Пароль должен совпадать с `POSTGRES_PASSWORD` в Compose. Значение пароля в YAML указывай в кавычках.

В секции `Jwt` настрой:

| Параметр | Назначение |
|---|---|
| `Key` | Ключ подписи токенов |
| `Issuer` | Издатель токена |
| `Audience` | Получатель токена |
| `ExpiresInMinutes` | Срок действия |

Для своего окружения используй отдельные пароль базы данных и ключ JWT. Backend поддерживает переопределение настроек через переменные окружения, включая `ConnectionStrings__DefaultConnection` и `Jwt__Key`.

### 3. Запуск backend

Из корня репозитория:

```bash
docker compose up --build -d
```

Проверка состояния:

```bash
docker compose ps
```

Просмотр логов:

```bash
docker compose logs -f backend
```

После успешного запуска:

- API: http://localhost:5005
- Swagger UI: http://localhost:5005/swagger
- PostgreSQL: `localhost:5432`

Swagger доступен при включённом `ShowSwagger` или в окружении `Development`.

### 4. Настройка frontend

В текущей версии адрес API указан непосредственно в исходниках frontend.

Перед запуском найди адреса backend в каталоге `AgroLab-frontend/src` и замени базовый адрес на:

```text
http://localhost:5005
```

Сохрани пути маршрутов. Например, сервис авторизации должен обращаться к:

```text
http://localhost:5005/api/users
```

Проверь все места обращения к API: изменение только сервиса авторизации не перенастроит остальные разделы.

### 5. Запуск frontend

В отдельном терминале:

```bash
cd AgroLab-frontend
npm ci
npm start
```

Интерфейс будет доступен по адресу:

```text
http://localhost:3000
```

Этот origin уже включён в CORS-политику backend.

## Запуск frontend через Docker

В каталоге `AgroLab-frontend` находится отдельный Compose-файл. Он собирает React-приложение и запускает Nginx на порту `80`.

Перед сборкой:

1. Настрой адрес API в исходниках frontend.
2. Добавь `http://localhost` в CORS-политику `AllowFrontend` в `AgroLab/Program.cs`.
3. Пересобери backend после изменения CORS.

Запуск:

```bash
cd AgroLab-frontend
docker compose up --build -d
```

Интерфейс: http://localhost

Nginx обслуживает статические файлы и маршруты React Router. Проксирование API в текущем `nginx.conf` не настроено: браузер обращается к backend напрямую.

## База данных

При первой инициализации пустого тома PostgreSQL выполняет SQL-файл из `db/init`.

Данные сохраняются в именованном томе `pgdata`. Изменение SQL-дампа не обновляет уже созданную базу автоматически.

Остановить backend и PostgreSQL, сохранив данные:

```bash
docker compose down
```

## Авторизация

Вход выполняется через страницу `/login`.

Основные маршруты:

| Метод | Маршрут | Назначение |
|---|---|---|
| POST | `/api/users/login` | Вход и получение JWT |
| POST | `/api/users/register` | Регистрация пользователем с ролью администратора |
| GET | `/api/users/me` | Получение профиля |
| POST | `/api/users/change-password` | Смена пароля |

Для первого входа требуется подготовленная учётная запись в базе данных. Автоматическое создание администратора при запуске не предусмотрено.

## Разделы API

| Маршрут | Назначение |
|---|---|
| `/api/samples` | Образцы и результаты исследований |
| `/api/cultures` | Культуры |
| `/api/customers` | Заказчики |
| `/api/equipment` | Оборудование |
| `/api/reagents` | Реагенты |
| `/api/providers` | Поставщики |
| `/api/protocols` | Хранение и генерация протоколов |
| `/api/labels` | Генерация этикеток |
| `/api/export` | Экспорт в Excel |
| `/api/reports` | Отчёты |
| `/api/notifications` | Уведомления |

Методы, параметры и модели запросов доступны в Swagger UI.

## Текущий статус

Проект требует настройки окружения перед запуском:

- Адрес API frontend пока не вынесен в общую конфигурацию.
- Backend и frontend запускаются отдельными Compose-файлами.
- Проверки авторизации применены не ко всем маршрутам.
- Обозначения ролей `admin` и `Admin` требуют унификации.
- Подробное логирование EF Core и вывод строки подключения необходимо отключить перед публичным развёртыванием.
- Автоматические тесты и CI пока не добавлены.

## Дальнейшее развитие

- Единая конфигурация адреса API frontend.
- Общий Compose-файл для всех компонентов.
- Воспроизводимая подготовка демонстрационных данных и администратора.
- Единые правила авторизации и обработки ошибок.
- Интеграционные тесты API и генерации документов.
- Автоматическая сборка и проверки в CI.
