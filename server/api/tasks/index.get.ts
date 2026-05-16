import Task from '~/server/models/task.model'

export default defineEventHandler(async () => {
  const tasks = await Task.find().sort({ createdAt: -1 })
  return { tasks }
})