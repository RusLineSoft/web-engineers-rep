import amqp from 'amqplib';

let channel: amqp.Channel | null = null;
let connectionAttempted = false;

export const connectRabbitMQ = async () => {
  if (channel) return channel;
  if (connectionAttempted) return null; // Avoid infinite retries
  
  connectionAttempted = true;
  
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    conn.on('error', (err) => {
      console.error('[RabbitMQ Connection Error]', err);
      channel = null;
      connectionAttempted = false;
    });
    conn.on('close', () => {
      console.warn('[RabbitMQ Connection Closed]');
      channel = null;
      connectionAttempted = false;
    });

    channel = await conn.createChannel();
    await channel.assertQueue('kanban_events', { durable: true });
    console.log('RabbitMQ connected and queue "kanban_events" asserted');
    return channel;
  } catch (error) {
    console.warn('[RabbitMQ Warning] Unavailable, running in degraded mode. Events will not be published.');
    connectionAttempted = false;
    return null;
  }
};

export const publishEvent = async (routingKey: string, data: any) => {
  const ch = await connectRabbitMQ();
  if (ch) {
    const payload = JSON.stringify({ routingKey, data, timestamp: new Date() });
    ch.sendToQueue('kanban_events', Buffer.from(payload), { persistent: true });
    console.log(`[RabbitMQ] Published ${routingKey} to kanban_events`);
  }
};
