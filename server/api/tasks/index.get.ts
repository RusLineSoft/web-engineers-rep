import { Task } from '../../models/Task';

export default defineEventHandler(async (event) => {
  try {
    const tasks = await (Task as any).find().populate('column');
    return tasks;
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: err.message,
    });
  }
});
