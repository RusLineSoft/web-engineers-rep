import Task from '~/server/models/task.model'

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

  return { task }
})