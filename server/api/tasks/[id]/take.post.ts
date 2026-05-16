import Task from '~/server/models/task.model'
import { User } from '~/server/models/user.model'

export default defineEventHandler(async (event) => {
  const taskId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { userId } = body

  if (!taskId || !userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'taskId and userId are required'
    })
  }

  const task = await Task.findOne({ taskId })
  const user = await User.findOne({ userId })

  if (!task || !user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Task or user not found'
    })
  }

  const userHasTask = user.currentTasks?.some((t) => t.taskId === taskId)

  if (!userHasTask) {
    user.currentTasks.push({
      taskId: task.taskId,
      taskName: task.taskName,
      status: task.status,
      priority: task.priority,
      tags: task.tags,
      createdAt: task.createdAt,
      deadline: task.deadline
    })

    user.tasksCount = (user.tasksCount || 0) + 1
  }

  const taskHasUser = task.assignedUsers?.some((u) => u.userId === userId)

  if (!taskHasUser) {
    task.assignedUsers.push({
      userId: user.userId,
      username: user.username,
      avatar: user.avatar
    })
  }

  await Promise.all([user.save(), task.save()])

  return {
    success: true,
    task,
    user
  }
})