// @ts-nocheck
import mongoose from 'mongoose';
import { Column } from '../models/Column';

// @ts-ignore
export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig();
  try {
    const uri = config.mongodbUri || process.env.MONGODB_URI || 'mongodb://localhost:27017/Kanban';
    console.log(`[DB] Connecting to: ${uri}`);
    await mongoose.connect(uri);
    const dbName = mongoose.connection.db?.databaseName || 'Kanban';
    console.log(`[DB] Successfully connected to database: "${dbName}"`);

    // Seed default columns if they don't exist
    const cols = await Column.find().sort({ order: 1 });
    console.log(`[DB] Columns found: ${cols.length}`);
    
    if (cols.length < 5) {
      console.log('[DB] Seeding default columns (Agile Pipeline)...');
      await Column.deleteMany({});
      const newCols = await Column.insertMany([
        { title: '💡 Бэклог', order: 0 },
        { title: '🎯 К выполнению', order: 1 },
        { title: '⚡ В работе', order: 2 },
        { title: '👀 Ревью', order: 3 },
        { title: '✅ Готово', order: 4 },
      ]);
      console.log(`[DB] Created ${newCols.length} columns. First ID: ${newCols[0]._id}`);

      // Обновляем все существующие задачи, чтобы они ссылались на Бэклог
      const { Task } = await import('../models/Task');
      await Task.updateMany({}, { column: newCols[0]._id });
      console.log('[DB] Re-associated all existing tasks to backlog column.');
    } else {
      console.log(`[DB] Using existing columns. First ID: ${cols[0]._id}`);
      // Автоматическое обновление существующей колонки "Код-ревью" -> "Ревью"
      await Column.updateMany({ title: '👀 Код-ревью' }, { title: '👀 Ревью' });
    }

    // Автоматическое наполнение базы данных пользователями (проверка поштучно)
    const { User } = await import('../models/user.model');
    const bcrypt = await import('bcryptjs');
    const defaultPasswordHash = bcrypt.default.hashSync('password123', 10);
    
    const demoUsers = [
      {
        userId: 'usr_owner_001',
        avatar: '👑',
        username: 'Владислав',
        email: 'admin@admin.com',
        password: defaultPasswordHash,
        rank: 'Владелец команды (Admin)',
        rights: 3,
        company: 'Web Engineers',
        telegram: '@vlad_owner',
        notification: 0,
        tasksCount: 0,
        completedTasks: 0
      },
      {
        userId: 'usr_dev_002',
        avatar: '💻',
        username: 'Артем',
        email: 'dev@dev.com',
        password: defaultPasswordHash,
        rank: 'Разработчик (Dev)',
        rights: 2,
        company: 'Web Engineers',
        telegram: '@artem_dev',
        notification: 0,
        tasksCount: 0,
        completedTasks: 0
      },
      {
        userId: 'usr_user_003',
        avatar: '👤',
        username: 'Пользователь',
        email: 'user@user.com',
        password: defaultPasswordHash,
        rank: 'Только чтение (User)',
        rights: 1,
        company: 'Web Engineers',
        telegram: '@user_read',
        notification: 0,
        tasksCount: 0,
        completedTasks: 0
      }
    ];

    // Полное удаление устаревших гостевых записей из базы данных
    await User.deleteMany({ $or: [{ username: 'Гость' }, { email: 'guest@guest.com' }] });
    console.log('[DB] Legacy guest users successfully removed.');

    for (const u of demoUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        console.log(`[DB] Creating demo user: ${u.email}`);
        await User.create(u);
      }
    }
    console.log('[DB] Seeding default template users verified.');

    // Автоматическое наполнение профессиональными IT-задачами
    const { Task } = await import('../models/Task');
    const hasOldTasks = await Task.findOne({ $or: [{ title: /тестовая/i }, { description: /тест/i }] });
    const tasksCount = await Task.countDocuments();
    
    if (tasksCount === 0 || hasOldTasks) {
      console.log('[DB] Seeding professional IT tasks...');
      await Task.deleteMany({}); // Очищаем старые шаблоны
      
      const activeCols = await Column.find().sort({ order: 1 });
      const crypto = await import('crypto');
      
      const defaultTasks = [
        {
          uuid: crypto.randomUUID(),
          title: '⚡ Оптимизация производительности WebSocket соединений',
          description: 'Перевести шину событий Socket.io на Redis Adapter для обеспечения масштабируемости под нагрузкой >10k одновременных подключений.',
          priority: 'Urgent',
          column: activeCols[0]._id, // Бэклог
          project: 'Kanban-board',
          tags: ['Real-time', 'DevOps'],
          assignee: 'Не назначен',
          deadline: new Date(Date.now() + 86400000 * 3),
          order: 0,
          checklist: [
            { title: 'Настроить Redis инстанс в Docker-контейнере', isCompleted: false },
            { title: 'Интегрировать socket.io-redis на бэкенд', isCompleted: false }
          ]
        },
        {
          uuid: crypto.randomUUID(),
          title: '📦 Миграция MongoDB схем на распределенный кластер Atlas',
          description: 'Перенести локальную БД на отказоустойчивый кластер Mongo Atlas с репликацией в трех зонах доступности.',
          priority: 'Urgent',
          column: activeCols[0]._id, // Бэклог
          project: 'Kanban-board',
          tags: ['Database', 'Cloud'],
          assignee: 'Не назначен',
          deadline: new Date(Date.now() + 86400000 * 10),
          order: 1,
          checklist: [
            { title: 'Создать кластер в панели MongoDB Atlas', isCompleted: true },
            { title: 'Настроить сетевой доступ и IP Whitelist', isCompleted: false },
            { title: 'Экспортировать локальный дамп данных через mongodump', isCompleted: false }
          ]
        },
        {
          uuid: crypto.randomUUID(),
          title: '🎯 Интеграция очередей RabbitMQ для фонового биллинга',
          description: 'Настроить асинхронную обработку транзакций через обменники RabbitMQ с подтверждением доставки (ack) и повторной очередью сообщений (DLQ).',
          priority: 'High',
          column: activeCols[1]._id, // К выполнению
          project: 'Kanban-board',
          tags: ['Backend', 'Infrastructure'],
          assignee: 'Артем',
          deadline: new Date(Date.now() + 86400000 * 5),
          order: 0,
          checklist: [
            { title: 'Инициализировать amqp соединение в плагине', isCompleted: true },
            { title: 'Создать очередь billings_queue', isCompleted: true },
            { title: 'Настроить dead-letter-exchange для обработки ошибок', isCompleted: false }
          ]
        },
        {
          uuid: crypto.randomUUID(),
          title: '🛠️ Конфигурация CI/CD пайплайна в GitHub Actions',
          description: 'Автоматизировать сборку, линтинг и деплой Docker-контейнеров на прод-сервер при пуше в ветку main.',
          priority: 'High',
          column: activeCols[1]._id, // К выполнению
          project: 'Kanban-board',
          tags: ['DevOps', 'CI/CD'],
          assignee: 'Артем',
          deadline: new Date(Date.now() + 86400000 * 6),
          order: 1,
          checklist: [
            { title: 'Написать workflow файл с тестами и линтером', isCompleted: true },
            { title: 'Настроить GitHub Secrets для доступа к VPS', isCompleted: false },
            { title: 'Реализовать SSH-деплой с перезапуском docker-compose', isCompleted: false }
          ]
        },
        {
          uuid: crypto.randomUUID(),
          title: '🎨 Премиальный редизайн интерфейса по концепту Glassmorphism',
          description: 'Реализовать размытие заднего фона, неоновые акценты и плавные анимации переходов между вкладками.',
          priority: 'Medium',
          column: activeCols[2]._id, // В работе
          project: 'Kanban-board',
          tags: ['Design', 'Frontend'],
          assignee: 'Владислав',
          deadline: new Date(Date.now() + 86400000 * 2),
          order: 0,
          checklist: [
            { title: 'Определить HSL цветовую палитру', isCompleted: true },
            { title: 'Настроить Tailwind/CSS утилиты glassmorphism', isCompleted: true },
            { title: 'Добавить звуковое сопровождение драг-энд-дропа', isCompleted: true }
          ]
        },
        {
          uuid: crypto.randomUUID(),
          title: '🔔 Внедрение PUSH-уведомлений в браузер сотрудника',
          description: 'Настроить Web Push API сервис воркер для отображения системных нотификаций даже при закрытой вкладке.',
          priority: 'Medium',
          column: activeCols[2]._id, // В работе
          project: 'Kanban-board',
          tags: ['Frontend', 'Notification'],
          assignee: 'Владислав',
          deadline: new Date(Date.now() + 86400000 * 4),
          order: 1,
          checklist: [
            { title: 'Зарегистрировать Service Worker в Nuxt 3', isCompleted: true },
            { title: 'Запросить разрешение на показ PUSH у пользователя', isCompleted: false },
            { title: 'Настроить генерацию VAPID ключей на бэкенде', isCompleted: false }
          ]
        },
        {
          uuid: crypto.randomUUID(),
          title: '🔒 Покрытие интеграционными тестами API-эндпоинтов RBAC',
          description: 'Написать сквозные тесты (E2E) с авторизацией под ролями Admin, Dev и User для валидации ограничений досок.',
          priority: 'Low',
          column: activeCols[3]._id, // Ревью
          project: 'Kanban-board',
          tags: ['QA', 'Security'],
          assignee: 'Пользователь',
          deadline: new Date(Date.now() + 86400000 * 7),
          order: 0,
          checklist: [
            { title: 'Написать тесты авторизации', isCompleted: true },
            { title: 'Проверить ограничение Бэклога для Dev-роли', isCompleted: true }
          ]
        },
        {
          uuid: crypto.randomUUID(),
          title: '📝 Документирование публичных REST API эндпоинтов в Swagger',
          description: 'Составить спецификацию OpenAPI 3.0 для всех контроллеров задач и колонок с примерами ответов.',
          priority: 'Low',
          column: activeCols[3]._id, // Ревью
          project: 'Kanban-board',
          tags: ['Docs', 'API'],
          assignee: 'Пользователь',
          deadline: new Date(Date.now() + 86400000 * 8),
          order: 1,
          checklist: [
            { title: 'Установить swagger-ui-express и сконфигурировать роутинг', isCompleted: false },
            { title: 'Описать структуры Mongoose-схем в JSDoc', isCompleted: false }
          ]
        },
        {
          uuid: crypto.randomUUID(),
          title: '🚀 Подготовка интерактивной презентации для инвесторов',
          description: 'Оформить слайды с описанием FSD-архитектуры и событийной шины на базе RabbitMQ и WebSockets.',
          priority: 'Medium',
          column: activeCols[4]._id, // Готово
          project: 'Kanban-board',
          tags: ['Marketing', 'Management'],
          assignee: 'Владислав',
          deadline: new Date(Date.now() - 86400000),
          order: 0,
          checklist: [
            { title: 'Составить план презентации', isCompleted: true },
            { title: 'Отрисовать схему архитектуры', isCompleted: true }
          ]
        },
        {
          uuid: crypto.randomUUID(),
          title: '🔒 Интеграция двухфакторной аутентификации (2FA)',
          description: 'Подключить TOTP протокол (Google Authenticator) для админ-панелей сотрудников с повышенными правами.',
          priority: 'High',
          column: activeCols[4]._id, // Готово
          project: 'Kanban-board',
          tags: ['Security', 'Auth'],
          assignee: 'Владислав',
          deadline: new Date(Date.now() - 86400000 * 2),
          order: 1,
          checklist: [
            { title: 'Выбрать библиотеку для генерации секретов (speakeasy)', isCompleted: true },
            { title: 'Сгенерировать QR-код для настройки аутентификатора', isCompleted: true },
            { title: 'Написать middleware валидации TOTP-токенов', isCompleted: true }
          ]
        }
      ];
      
      await Task.insertMany(defaultTasks);
      console.log('[DB] Seeding 10 professional IT tasks completed.');
    }
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
});
