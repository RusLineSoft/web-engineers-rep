import { User } from '~/server/models/user.model'

export const syncUserCounters = async (userId: string) => {
  const user = await User.findOne({ userId })
  if (!user) return null

  const currentTasks = user.currentTasks || []

  await User.findOneAndUpdate(
    { userId },
    {
      tasksCount: currentTasks.length
    },
    { new: true }
  )

  return true
}