type Client = {
  id: string
  res: any
  channel: 'tasks' | 'me' | 'activity'
  userId?: string
}

const globalForRealtime = globalThis as typeof globalThis & {
  __realtimeClients__?: Client[]
}

const clients = globalForRealtime.__realtimeClients__ || []
globalForRealtime.__realtimeClients__ = clients

export const addRealtimeClient = (client: Client) => {
  clients.push(client)
}

export const removeRealtimeClient = (id: string) => {
  const index = clients.findIndex(c => c.id === id)
  if (index !== -1) clients.splice(index, 1)
}

export const sendRealtimeEvent = (
  channel: Client['channel'],
  payload: any,
  userId?: string
) => {
  const message = `data: ${JSON.stringify(payload)}\n\n`

  clients.forEach((client) => {
    if (client.channel !== channel) return
    if (userId && client.userId && client.userId !== userId) return

    try {
      client.res.write(message)
    } catch {
      removeRealtimeClient(client.id)
    }
  })
}