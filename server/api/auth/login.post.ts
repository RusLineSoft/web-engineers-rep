import { User } from '~/server/models/user.model';
import type { IUserDocument } from '~/server/models/user.model';
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { email, password } = body;

    if (!email || !password) {
        setResponseStatus(event, 400);
        return { success: false, message: 'Пожалуйста, введите почту и пароль.' };
    }

    try {
        const user: IUserDocument | null = await User.findOne({ email });

        if (!user) {
            setResponseStatus(event, 401);
            return { success: false, message: 'Неверная почта или пароль.' };
        }
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            setResponseStatus(event, 401);
            return { success: false, message: 'Неверная почта или пароль.' };
        }

        setResponseStatus(event, 200);
        return {
            success: true,
            message: 'Авторизация успешна!',
            user: {
                userId: user.userId,
                username: user.username,
                email: user.email,
                rank: user.rank,
                rights: user.rights,
                avatar: user.avatar,
                phone: user.phone,
                telegram: user.telegram,
                company: user.company,
                tasksCount: user.tasksCount,
                completedTasks: user.completedTasks,
                createdAt: user.createdAt,
                notification: user.notification,
            }
        };

    } catch (error) {
        console.error('Login API error:', error);
        setResponseStatus(event, 500);
        return { success: false, message: 'Произошла ошибка на сервере. Пожалуйста, попробуйте позже.' };
    }
});