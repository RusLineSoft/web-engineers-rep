import Task from '~/server/models/task.model'
import { sendRealtimeEvent } from '~/server/utils/realtime'

export default defineEventHandler(async (event) => {
  const taskId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { status } = body

  const allowedStatuses = ['To Do', 'In progress', 'Done']

  if (!taskId || !status) {
    throw createError({
      statusCode: 400,
      statusMessage: 'taskId and status are required'
    })
  }

  if (!allowedStatuses.includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid status'
    })
  }

  const task = await Task.findOneAndUpdate(
    { taskId },
    { status },
    { new: true }
  )

  if (!task) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Task not found'
    })
  }

  sendRealtimeEvent('tasks', { type: 'task-updated', task: task.toObject() })

  return {
    success: true,
    task
  }
})