import { Task } from '../../models/Task';
import crypto from 'crypto';
import { publishEvent } from '../../utils/rabbitmq';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  try {
    const task = new Task({
      ...body,
      uuid: crypto.randomUUID(),
    });
    await task.save();
    
    // Broadcast via socket.io
    // @ts-ignore
    if (global.__io) {
      // @ts-ignore
      global.__io.emit('task:created', task);
    }
    
    // Publish event to RabbitMQ for background worker
    publishEvent('task.created', task);
    
    return task;
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: err.message,
    });
  }
});
