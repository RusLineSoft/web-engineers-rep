import { ActivityLog } from '~/server/models/activity-log.model'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const limit = Math.min(Number(query.limit || 100), 300)

  const logs = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()

  return {
    success: true,
    logs
  }
})