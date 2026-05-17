import Task from '~/server/models/task.model'
import { User } from '~/server/models/user.model'
import { sendRealtimeEvent } from '~/server/utils/realtime'
import { createActivityLog } from '~/server/utils/activity'

const parseTags = (value: any): string[] => {
  if (!value) return []

  if (Array.isArray(value)) {
    return value.map((t) => String(t).trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []

    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.map((t) => String(t).trim()).filter(Boolean)
      }
    } catch {}

    return trimmed.split(',').map((t) => t.trim()).filter(Boolean)
  }

  return []
}

const parseDeadline = (value: any): Date => {
  if (!value) return new Date()

  const parsed = new Date(String(value))
  if (isNaN(parsed.getTime())) return new Date()
  return parsed
}

export default defineEventHandler(async (event) => {
  const taskId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  if (!taskId) {
    throw createError({ statusCode: 400, message: 'taskId is required' })
  }

  const task = await Task.findOne({ taskId })
  if (!task) {
    throw createError({ statusCode: 404, message: 'Task not found' })
  }

  const oldAssignedIds = (task.assignedUsers || []).map((u: any) => u.userId)

  const taskName = body.taskName?.trim()
  if (!taskName) {
    throw createError({ statusCode: 400, message: 'Введите название задачи' })
  }

  const allowedStatuses = ['To Do', 'In progress', 'Done']
  const allowedPriorities = ['veryUrgent', 'urgently', 'notUrgently', 'noPriority']
  const allowedTags = ['design', 'testing', 'marketing', 'development', 'hr-management']

  const status = body.status || task.status
  const priority = body.priority || task.priority
  const tags = parseTags(body.tags)
  const deadline = parseDeadline(body.deadline)

  if (!allowedStatuses.includes(status)) {
    throw createError({ statusCode: 400, message: 'Некорректный статус задачи' })
  }

  if (!allowedPriorities.includes(priority)) {
    throw createError({ statusCode: 400, message: 'Некорректный приоритет задачи' })
  }

  task.taskName = taskName
  task.description = body.description?.trim() || ''
  task.status = status
  task.priority = priority
  task.tags = tags.filter((tag) => allowedTags.includes(tag))
  task.deadline = deadline

  await task.save()

  const actorUserId = body.actorUserId?.toString()

  await createActivityLog({
    type: 'task-updated',
    title: 'Задача изменена',
    message: `Задача «${task.taskName}» была изменена`,
    actorUserId,
    taskId: task.taskId,
    taskName: task.taskName,
    meta: {
      status: task.status,
      priority: task.priority,
      tags: task.tags,
      deadline: task.deadline
    }
  })

  for (const userId of oldAssignedIds) {
    const user = await User.findOne({ userId })
    if (!user) continue

    const currentTask = (user.currentTasks || []).find((t: any) => t.taskId === task.taskId)
    if (currentTask) {
      currentTask.taskName = task.taskName
      currentTask.status = task.status
      currentTask.priority = task.priority
      currentTask.tags = task.tags
      currentTask.deadline = task.deadline
      user.currentTasks = [...(user.currentTasks || [])]
      await user.save()
    }
  }

  sendRealtimeEvent('tasks', { type: 'task-updated', task: task.toObject() })

  for (const userId of oldAssignedIds) {
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