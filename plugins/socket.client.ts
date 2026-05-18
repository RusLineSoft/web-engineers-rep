import { io } from 'socket.io-client';

export default defineNuxtPlugin((nuxtApp) => {
  const socket = io({
    autoConnect: false,
  });

  return {
    provide: {
      socket
    }
  }
});
