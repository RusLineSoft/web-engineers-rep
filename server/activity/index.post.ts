import { createActivityLog } from '~/server/utils/activity'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.type || !body.title || !body.message) {
    throw createError({
      statusCode: 400,
      message: 'type, title and message are required'
    })
  }

  const log = await createActivityLog({
    type: body.type,
    title: body.title,
    message: body.message,
    actorUserId: body.actorUserId,
    targetUserId: body.targetUserId,
    taskId: body.taskId,
    taskName: body.taskName,
    meta: body.meta || {}
  })

  return {
    success: true,
    log
  }
})