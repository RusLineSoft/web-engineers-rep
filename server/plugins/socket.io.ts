import { Server } from 'socket.io';

export default defineNitroPlugin((nitroApp) => {
  let io: Server;

  // @ts-ignore
  nitroApp.hooks.hook('render:response', () => {
    if (io) return;

    // @ts-ignore
    const server = globalThis.$rtServer || globalThis.server;
    if (!server) return;

    io = new Server(server, {
      cors: { origin: '*' },
      path: '/socket.io/',
      transports: ['polling', 'websocket']
    });

    // @ts-ignore
    global.__io = io;
    console.log('[Socket] Server initialized and locked to /socket.io/');
  });

  nitroApp.hooks.hook('request', (event) => {
    if (event.path.startsWith('/socket.io/')) {
      (event as any).handled = true;
    }
  });
});
