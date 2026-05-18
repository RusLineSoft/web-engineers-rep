import { User } from '~/server/models/user.model';

/**
 * API эндпоинт для получения списка всех пользователей.
 * Исключает пароли из выборки для обеспечения безопасности.
 */
export default defineEventHandler(async (event) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    return users;
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: err.message,
    });
  }
});
