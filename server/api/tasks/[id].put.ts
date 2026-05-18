import { Task } from '../../models/Task';
import { publishEvent } from '../../utils/rabbitmq';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Task ID is required' });
  }
  
  const body = await readBody(event);
  
  try {
    const task = await (Task as any).findByIdAndUpdate(id, body, { returnDocument: 'after' });
    if (!task) {
      throw createError({ statusCode: 404, statusMessage: 'Task not found' });
    }
    
    // Broadcast via socket.io
    // @ts-ignore
    if (global.__io) {
      // @ts-ignore
      global.__io.emit('task:updated', task);
    }
    
    // Publish event to RabbitMQ for background worker
    publishEvent('task.updated', task);
    
    return task;
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: err.message,
    });
  }
});
