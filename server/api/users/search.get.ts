import { User } from '~/server/models/user.model'

export default defineEventHandler(async (event) => {
  const query = getQuery(event).q?.toString().trim() || ''

  if (!query) {
    return { users: [] }
  }

  const users = await User.find({
    username: { $regex: query, $options: 'i' }
  }).select('userId username avatar rights')

  return { users }
})