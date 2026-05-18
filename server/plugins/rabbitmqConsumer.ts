import amqp from 'amqplib';
import { Task } from '../models/Task';

// @ts-ignore
export default defineNitroPlugin(async (nitroApp) => {
  const connectAndConsume = async () => {
    try {
      const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      conn.on('error', (err) => {
        console.error('[RabbitMQ Consumer Connection Error]', err);
        setTimeout(connectAndConsume, 5000);
      });
      conn.on('close', () => {
        console.warn('[RabbitMQ Consumer Connection Closed]');
        setTimeout(connectAndConsume, 5000);
      });

      const channel = await conn.createChannel();
      await channel.assertQueue('kanban_events', { durable: true });
      
      console.log('RabbitMQ Consumer listening on "kanban_events"');

      channel.consume('kanban_events', async (msg) => {
        if (msg !== null) {
          try {
            const event = JSON.parse(msg.content.toString());
            console.log(`[Consumer] Received event: ${event.routingKey}`, event.data.title || event.data.id);
            
            if (event.routingKey === 'task.created' || event.routingKey === 'task.updated') {
              const task = event.data;
              if (task.tags && task.tags.includes('URGENT') && task.priority !== 'Urgent') {
                const updated = await Task.findByIdAndUpdate(task._id, { priority: 'Urgent' }, { returnDocument: 'after' });
                console.log(`[Consumer] Applied Rule A: Elevated priority to Urgent for task ${task._id}`);
                
                // @ts-ignore
                if (global.__io) {
                  // @ts-ignore
                  global.__io.emit('task:updated', updated);
                  // @ts-ignore
                  global.__io.emit('notification:urgent', { message: `Task "${updated.title}" elevated to URGENT priority automatically!` });
                }
              }
            }
            channel.ack(msg);
          } catch (err) {
            console.error('Error processing message:', err);
            channel.nack(msg);
          }
        }
      });
    } catch (err) {
      console.warn('[RabbitMQ Consumer Warning] Unavailable, running in degraded mode. Retrying connection in 5 seconds...');
      setTimeout(connectAndConsume, 5000);
    }
  };

  // Start connection asynchronously without blocking Nitro boot
  connectAndConsume();
});
