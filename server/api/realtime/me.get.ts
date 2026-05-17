import { addRealtimeClient, removeRealtimeClient } from '~/server/utils/realtime'
import { User } from '~/server/models/user.model'

export default defineEventHandler(async (event) => {
  const res = event.node.res
  const clientId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const userId = getQuery(event).userId?.toString()

  if (!userId) {
    throw createError({ statusCode: 400, message: 'userId is required' })
  }

  const user = await User.findOne({ userId }).select('-password')

  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  setHeader(event, 'Content-Type', 'text/event-stream; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-cache, no-transform')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'X-Accel-Buffering', 'no')

  res.write(`data: ${JSON.stringify({ type: 'initial', user })}\n\n`)

  addRealtimeClient({
    id: clientId,
    res,
    channel: 'me',
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