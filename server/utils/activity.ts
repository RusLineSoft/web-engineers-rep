import { ActivityLog, ActivityLogType } from '~/server/models/activity-log.model'
import { User } from '~/server/models/user.model'
import { sendRealtimeEvent } from '~/server/utils/realtime'

type LogActor = {
  userId: string
  username: string
  avatar?: string
  rights?: number
}

type CreateActivityPayload = {
  type: ActivityLogType
  title: string
  message: string
  actorUserId?: string
  targetUserId?: string
  actor?: LogActor | null
  targetUser?: LogActor | null
  taskId?: number
  taskName?: string
  meta?: Record<string, any>
}

const buildActorFromUserId = async (userId?: string): Promise<LogActor | null> => {
  if (!userId) return null

  const user = await User.findOne({ userId }).select('userId username avatar rights')
  if (!user) return null

  return {
    userId: user.userId,
    username: user.username,
    avatar: user.avatar,
    rights: user.rights
  }
}

export const createActivityLog = async (payload: CreateActivityPayload) => {
  const actor = payload.actor ?? await buildActorFromUserId(payload.actorUserId)
  const targetUser = payload.targetUser ?? await buildActorFromUserId(payload.targetUserId)

  const log = await ActivityLog.create({
    type: payload.type,
    title: payload.title,
    message: payload.message,
    actor,
    targetUser,
    taskId: payload.taskId ?? null,
    taskName: payload.taskName ?? '',
    meta: payload.meta ?? {},
    createdAt: new Date()
  })

  sendRealtimeEvent('activity', {
    type: 'activity-created',
    activity: log.toObject()
  })

  return log
}