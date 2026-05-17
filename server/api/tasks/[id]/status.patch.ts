import Task from '~/server/models/task.model'
import { User } from '~/server/models/user.model'
import { sendRealtimeEvent } from '~/server/utils/realtime'
import { createActivityLog } from '~/server/utils/activity'

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

  const task = await Task.findOne({ taskId })

  if (!task) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Task not found'
    })
  }

  const assignedUserIds = (task.assignedUsers || []).map((u: any) => u.userId)

  task.status = status
  await task.save()

  const actorUserId = body.actorUserId?.toString()

  await createActivityLog({
    type: 'task-status-changed',
    title: 'Статус задачи изменён',
    message: `Статус задачи «${task.taskName}» изменён на «${status}»`,
    actorUserId,
    taskId: task.taskId,
    taskName: task.taskName,
    meta: {
      status
    }
  })

  for (const userId of assignedUserIds) {
    const user = await User.findOne({ userId })
    if (!user) continue

    const currentTask = (user.currentTasks || []).find((t: any) => t.taskId === task.taskId)
    if (currentTask) {
      currentTask.status = status
      user.currentTasks = [...(user.currentTasks || [])]
      await user.save()
    }
  }

  sendRealtimeEvent('tasks', { type: 'task-updated', task: task.toObject() })

  for (const userId of assignedUserIds) {
    const user = await User.findOne({ userId }).select('-password')
    if (user) {
      sendRealtimeEvent('me', { type: 'user-updated', user }, userId)
    }
  }

  return {
    success: true,
    task
  }
})