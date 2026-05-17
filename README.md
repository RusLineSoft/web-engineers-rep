# Канбан-доска by Web Engineers

Проект работает на Nuxt 4, рекомендуем ознакомиться с [документацией](https://nuxt.com/docs/4.x/getting-started/installation).

## Инструкция по запуску

Перейдите в папку с проектом
```bash
cd web-engineers
```

Для установки необходимых зависимостей необходимо использовать команду
```bash
npm install
```

Запустите сервер для разработки
```bash
npm run dev
```

**Готово!** Поздравляем, вы запустили канбан-доску от Web Engineers.

## Используемые технологии

• **[Nuxt](https://nuxt.com)** — бесплатный фреймворк с открытым исходным кодом для создания типобезопасных, производительных full-stack веб-приложений и сайтов на Vue.js. Основан на Vue.js, Nitro и Vite.

• **[MongoDB](https://mongodb.com)** — документоориентированная система управления базами данных (СУБД), не требующая описания схемы таблиц. Считается одним из классических примеров NoSQL-систем.

В проекте используются следующие зависимости:
```json
"dependencies": {
    "@types/node": "^25.8.0", // Корректная работа с TypeScript
    "bcryptjs": "^3.0.3", // Хеширование паролей
    "git": "^0.1.5", // Работа с GitHub
    "mongoose": "^9.6.2", // Работа с MongoDB (база данных)
    "nuxt": "^4.4.5", // Базовая библиотека Nuxt
    "pinia": "^3.0.4", // Отвечает за middleware и store
    "pinia-plugin-persistedstate": "^4.7.1", // Отвечает за длительное хранение записей в store
    "vue": "^3.5.34", // Базовая библиотека Vue
    "vue-router": "^5.0.6" // Базовая библиотека Vue, отвечает за маршрутизацию
}
```

## Работа с MongoDB

В MongoDB создайте базу данных с именем Kanban. В коллекцию users загрузите следующий json:
```json
{
  "userId": "00000001",
  "avatar": "/_nuxt/public/img/default-avatar.png",
  "username": "Кот Котов",
  "password": "$2b$10$5iYlVx1ZloTJ735lZj95ceWF4BJIO7YFNonpS7LZre.vQeBZ0RJ0K",
  "email": "admin@example.com",
  "rank": "Администратор",
  "rights": 1,
  "telegram": "@demouser",
  "company": "Web Engineers",
  "tasksCount": 1,
  "completedTasks": 347,
  "notification": 1,
  "createdAt": {
    "$date": "2026-01-01T00:00:00.000Z"
  },
  "__v": 112,
  "currentTasks": [],
  "phone": "",
  "notifications": [],
  "isBlocked": false,
  "mustChangePassword": true
}