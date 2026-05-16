import Task from '~/server/models/task.model'

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

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const taskName = body.taskName?.trim()
  const description = body.description?.trim() || ''
  const status = body.status || 'To Do'
  const priority = body.priority || 'notUrgently'
  const tags = Array.isArray(body.tags) ? body.tags : []
  const deadline = body.deadline ? new Date(body.deadline) : new Date()

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

  const filteredTags = tags.filter((tag: string) => allowedTags.includes(tag))

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

  return { success: true, task }
})