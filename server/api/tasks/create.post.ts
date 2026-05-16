import Task from '~/server/models/task.model'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const taskName = body.taskName?.trim()
  const description = body.description?.trim() || ''
  const status = body.status || 'To Do'
  const priority = body.priority || 'notUrgently'
  const tags = Array.isArray(body.tags) ? body.tags : []

  if (!taskName) {
    throw createError({
      statusCode: 400,
      message: 'Введите название задачи'
    })
  }

  const allowedStatuses = ['To Do', 'In progress', 'Done']
  const allowedPriorities = ['veryUrgent', 'urgently', 'notUrgently', 'noPriority']
  const allowedTags = ['design', 'testing', 'marketing', 'development', 'hr-management']

  if (!allowedStatuses.includes(status)) {
    throw createError({
      statusCode: 400,
      message: 'Некорректный статус задачи'
    })
  }

  if (!allowedPriorities.includes(priority)) {
    throw createError({
      statusCode: 400,
      message: 'Некорректный приоритет задачи'
    })
  }

  const filteredTags = tags.filter((tag: string) => allowedTags.includes(tag))

  const task = await Task.create({
    taskName,
    description,
    status,
    priority,
    tags: filteredTags
  })

  return {
    success: true,
    task
  }
})