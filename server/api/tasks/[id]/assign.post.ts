import Task from '~/server/models/task.model'
import { User } from '~/server/models/user.model'
import { sendRealtimeEvent } from '~/server/utils/realtime'

export default defineEventHandler(async (event) => {
  const taskId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const targetUserId = body.targetUserId?.toString()

  if (!taskId || !targetUserId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'taskId and targetUserId are required'
    })
  }

  const task = await Task.findOne({ taskId })
  const user = await User.findOne({ userId: targetUserId })

  if (!task) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Task not found'
    })
  }

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found'
    })
  }

  const alreadyAssigned = task.assignedUsers?.some((u: any) => u.userId === targetUserId)

  if (!alreadyAssigned) {
    task.assignedUsers.push({
      userId: user.userId,
      username: user.username,
      avatar: user.avatar
    })
  }

  const currentTaskExists = (user.currentTasks || []).some((t: any) => t.taskId === task.taskId)

  if (!currentTaskExists) {
    user.currentTasks = [
      ...(user.currentTasks || []),
      {
        taskId: task.taskId,
        taskName: task.taskName,
        status: task.status,
        priority: task.priority,
        tags: task.tags,
        createdAt: task.createdAt,
        deadline: task.deadline
      }
    ]
  }

  user.tasksCount = user.currentTasks.length

  await task.save()
  await user.save()

  sendRealtimeEvent('tasks', { type: 'task-updated', task: task.toObject() })
  sendRealtimeEvent('me', { type: 'user-updated', userId: targetUserId, user: user.toObject() }, targetUserId)

  return {
    success: true,
    task
  }
})