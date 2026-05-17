import Task from '~/server/models/task.model'
import { User } from '~/server/models/user.model'
import { sendRealtimeEvent } from '~/server/utils/realtime'

export default defineEventHandler(async (event) => {
  const taskId = Number(getRouterParam(event, 'id'))

  if (!taskId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'taskId is required'
    })
  }

  const task = await Task.findOne({ taskId })

  if (!task) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Task not found'
    })
  }

  const assignedUserIds = (task.assignedUsers || []).map((u: any) => u.userId)

  for (const userId of assignedUserIds) {
    const user = await User.findOne({ userId })
    if (!user) continue

    user.currentTasks = (user.currentTasks || []).filter((t: any) => t.taskId !== task.taskId)
    user.tasksCount = user.currentTasks.length

    await user.save()
  }


  await Task.deleteOne({ taskId })

  sendRealtimeEvent('tasks', {
    type: 'task-deleted',
    taskId
  })

  for (const userId of assignedUserIds) {
    const user = await User.findOne({ userId }).select('-password')
    if (user) {
      sendRealtimeEvent('me', { type: 'user-updated', user }, userId)
    }
  }

  return {
    success: true,
    taskId
  }
})