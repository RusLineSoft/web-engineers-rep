import Task from '~/server/models/task.model'
import { User } from '~/server/models/user.model'
import { sendRealtimeEvent } from '~/server/utils/realtime'
import { createActivityLog } from '~/server/utils/activity'

export default defineEventHandler(async (event) => {
  const taskId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const userId = body.userId?.toString()

  if (!taskId || !userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'taskId and userId are required'
    })
  }

  const task = await Task.findOne({ taskId })
  const user = await User.findOne({ userId })

  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  task.assignedUsers = (task.assignedUsers || []).filter((u: any) => u.userId !== userId)
  user.currentTasks = (user.currentTasks || []).filter((t: any) => t.taskId !== task.taskId)
  user.tasksCount = user.currentTasks.length

  await task.save()
  await user.save()

  const actorUserId = body.actorUserId?.toString() || userId

  await createActivityLog({
    type: 'task-unassigned',
    title: 'Пользователь снят с задачи',
    message: `Пользователь ${user.username} снят с задачи «${task.taskName}»`,
    actorUserId,
    targetUserId: userId,
    taskId: task.taskId,
    taskName: task.taskName
  })

  sendRealtimeEvent('tasks', { type: 'task-updated', task: task.toObject() })
  sendRealtimeEvent('me', { type: 'user-updated', user: user.toObject() }, userId)

  return {
    success: true,
    task
  }
})