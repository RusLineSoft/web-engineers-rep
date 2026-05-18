import { Column } from '../../models/Column';

export default defineEventHandler(async (event) => {
  try {
    const columns = await (Column as any).find().sort({ order: 1 });
    return columns;
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: err.message,
    });
  }
});
