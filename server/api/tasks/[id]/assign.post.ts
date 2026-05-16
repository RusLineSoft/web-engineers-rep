import Task from '~/server/models/task.model'
import { User } from '~/server/models/user.model'

export default defineEventHandler(async (event) => {
  const taskId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { assignerUserId, targetUserId } = body

  if (!taskId || !assignerUserId || !targetUserId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'taskId, assignerUserId and targetUserId are required'
    })
  }

  const [task, assigner, targetUser] = await Promise.all([
    Task.findOne({ taskId }),
    User.findOne({ userId: assignerUserId }),
    User.findOne({ userId: targetUserId })
  ])

  if (!task || !assigner || !targetUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Task, assigner or target user not found'
    })
  }

  if (assigner.rights !== 1) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied'
    })
  }

  const userHasTask = targetUser.currentTasks?.some((t) => t.taskId === taskId)

  if (!userHasTask) {
    targetUser.currentTasks.push({
      taskId: task.taskId,
      taskName: task.taskName,
      status: task.status,
      priority: task.priority,
      tags: task.tags,
      createdAt: task.createdAt,
      deadline: task.deadline
    })

    targetUser.tasksCount = (targetUser.tasksCount || 0) + 1
  }

  const taskHasUser = task.assignedUsers?.some((u) => u.userId === targetUserId)

  if (!taskHasUser) {
    task.assignedUsers.push({
      userId: targetUser.userId,
      username: targetUser.username,
      avatar: targetUser.avatar
    })
  }

  await Promise.all([targetUser.save(), task.save()])

  return {
    success: true
  }
})