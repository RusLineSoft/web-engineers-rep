import { User } from '~/server/models/user.model'

export default defineEventHandler(async (event) => {
  const adminUserId = getQuery(event).adminUserId?.toString()

  if (!adminUserId) {
    throw createError({
      statusCode: 400,
      message: 'adminUserId is required'
    })
  }

  const admin = await User.findOne({ userId: adminUserId })

  if (!admin || admin.rights !== 1) {
    throw createError({
      statusCode: 403,
      message: 'Access denied'
    })
  }

  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .lean()

  return {
    success: true,
    users
  }
})