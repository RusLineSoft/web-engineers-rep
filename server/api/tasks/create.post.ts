import Task from '~/server/models/task.model'
import { sendRealtimeEvent } from '~/server/utils/realtime'

const generateSixDigitId = () => Math.floor(100000 + Math.random() * 900000)

const GRID_STEP_X = 360
const GRID_STEP_Y = 280
const START_X = 100
const START_Y = 100
const MAX_COLUMNS = 12

const getNextFreePosition = async () => {
  const tasks = await Task.find().select('position')

  const occupied = new Set(
    tasks.map((task) => `${task.position?.x || 0}:${task.position?.y || 0}`)
  )

  for (let row = 0; row < 200; row++) {
    for (let col = 0; col < MAX_COLUMNS; col++) {
      const x = START_X + col * GRID_STEP_X
      const y = START_Y + row * GRID_STEP_Y
      const key = `${x}:${y}`

      if (!occupied.has(key)) {
        return { x, y }
      }
    }
  }

  return { x: START_X, y: START_Y }
}

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

    return trimmed
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  }

  return []
}

const parseDeadline = (value: any): Date => {
  if (!value) return new Date()

  const parsed = new Date(String(value))
  if (isNaN(parsed.getTime())) {
    return new Date()
  }

  return parsed
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const taskName = body.taskName?.trim()
  const description = body.description?.trim() || ''
  const status = body.status || 'To Do'
  const priority = body.priority || 'notUrgently'
  const tags = parseTags(body.tags)
  const deadline = parseDeadline(body.deadline)

  if (!taskName) {
    throw createError({ statusCode: 400, message: 'Введите название задачи' })
  }

  const allowedStatuses = ['To Do', 'In progress', 'Done']
  const allowedPriorities = ['veryUrgent', 'urgently', 'notUrgently', 'noPriority']
  const allowedTags = ['design', 'testing', 'marketing', 'development', 'hr-management']

  if (!allowedStatuses.includes(status)) {
    throw createError({ statusCode: 400, message: 'Некорректный статус задачи' })
  }

  if (!allowedPriorities.includes(priority)) {
    throw createError({ statusCode: 400, message: 'Некорректный приоритет задачи' })
  }

  const filteredTags = tags.filter((tag) => allowedTags.includes(tag))

  let taskId = generateSixDigitId()
  let exists = await Task.findOne({ taskId })

  while (exists) {
    taskId = generateSixDigitId()
    exists = await Task.findOne({ taskId })
  }

  const position = body.position || await getNextFreePosition()

  const task = await Task.create({
    taskId,
    taskName,
    description,
    status,
    priority,
    tags: filteredTags,
    deadline,
    position,
    assignedUsers: []
  })

  sendRealtimeEvent('tasks', {
    type: 'task-created',
    task: task.toObject()
  })

  return { success: true, task }
})