import { User } from '~/server/models/user.model'
import { sendRealtimeEvent } from '~/server/utils/realtime'
import { createActivityLog } from '~/server/utils/activity'

export default defineEventHandler(async (event) => {
  const targetUserId = getRouterParam(event, 'userId')?.toString()
  const body = await readBody(event)

  const adminUserId = body.adminUserId?.toString()
  const isBlocked = Boolean(body.isBlocked)

  if (!targetUserId || !adminUserId) {
    throw createError({
      statusCode: 400,
      message: 'targetUserId and adminUserId are required'
    })
  }

  const admin = await User.findOne({ userId: adminUserId })

  if (!admin || admin.rights !== 1) {
    throw createError({
      statusCode: 403,
      message: 'Access denied'
    })
  }

  if (adminUserId === targetUserId && isBlocked) {
    throw createError({
      statusCode: 400,
      message: 'Нельзя заблокировать самого себя'
    })
  }

  const user = await User.findOne({ userId: targetUserId }).select('-password')

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }

  user.isBlocked = isBlocked
  await user.save()

  sendRealtimeEvent(
    'me',
    {
      type: 'user-updated',
      user: user.toObject()
    },
    targetUserId
  )

  await createActivityLog({
    type: 'page-action',
    title: isBlocked ? 'Пользователь заблокирован' : 'Пользователь разблокирован',
    message: isBlocked
      ? `Администратор заблокировал пользователя ${user.username}`
      : `Администратор разблокировал пользователя ${user.username}`,
    actorUserId: adminUserId,
    targetUserId: user.userId,
    meta: {
      isBlocked
    }
  }).catch(() => {})

  return {
    success: true,
    user
  }
})