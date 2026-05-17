import { addRealtimeClient, removeRealtimeClient } from '~/server/utils/realtime'

export default defineEventHandler((event) => {
  const res = event.node.res
  const clientId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const userId = getQuery(event).userId?.toString()

  setHeader(event, 'Content-Type', 'text/event-stream; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-cache, no-transform')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'X-Accel-Buffering', 'no')

  res.write(': connected\n\n')

  addRealtimeClient({
    id: clientId,
    res,
    channel: 'activity',
    userId
  })

  const ping = setInterval(() => {
    try {
      res.write(': ping\n\n')
    } catch {
      clearInterval(ping)
    }
  }, 25000)

  event.node.req.on('close', () => {
    clearInterval(ping)
    removeRealtimeClient(clientId)
  })
})