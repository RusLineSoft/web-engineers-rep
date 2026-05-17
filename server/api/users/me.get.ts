import { User } from '~/server/models/user.model'

export default defineEventHandler(async (event) => {
  const userId = getQuery(event).userId?.toString()

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: 'userId is required'
    })
  }

  const user = await User.findOne({ userId }).select('-password')

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }

  return { user }
})