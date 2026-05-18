import { User } from '~/server/models/user.model';
import bcrypt from 'bcryptjs';

/**
 * API эндпоинт для создания нового пользователя.
 * Хэширует пароль перед сохранением в MongoDB.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, email, password, rank, rights, telegram, avatar } = body;

  if (!username || !email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Имя пользователя, электронная почта и пароль обязательны.',
    });
  }

  try {
    // Проверяем, существует ли пользователь с такой почтой
    const exists = await User.findOne({ email });
    if (exists) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Пользователь с таким email уже зарегистрирован.',
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = 'usr_' + Math.random().toString(36).substring(2, 11);

    const newUser = await User.create({
      userId,
      username,
      email,
      password: hashedPassword,
      rank: rank || 'Сотрудник',
      rights: rights || 0,
      telegram: telegram || '',
      avatar: avatar || '👤',
      company: 'Web Engineers',
      notification: 0,
      tasksCount: 0,
      completedTasks: 0
    });

    return {
      success: true,
      user: {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        rank: newUser.rank,
        rights: newUser.rights,
        avatar: newUser.avatar,
        telegram: newUser.telegram
      }
    };
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: err.message,
    });
  }
});
