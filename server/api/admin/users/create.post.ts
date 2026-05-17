import bcrypt from 'bcryptjs'
import { User } from '~/server/models/user.model'
import { generateAvatar, generateUserId } from '~/server/utils/user-generator'
import { createActivityLog } from '~/server/utils/activity'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const adminUserId = body.adminUserId?.toString()

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

  const username = body.username?.toString().trim()
  const email = body.email?.toString().trim().toLowerCase()
  const password = body.password?.toString()
  const rank = body.rank?.toString().trim() || 'Сотрудник'
  const rights = Number(body.rights ?? 0)
  const telegram = body.telegram?.toString().trim() || ''
  const phone = body.phone?.toString().trim() || ''
  const company = body.company?.toString().trim() || 'Неизвестно'

  if (!username || !email || !password) {
    throw createError({
      statusCode: 400,
      message: 'username, email and password are required'
    })
  }

  if (!username.trim().includes(' ')) {
    throw createError({
      statusCode: 400,
      message: 'username должен содержать имя и фамилию'
    })
  }

  if (![0, 1].includes(rights)) {
    throw createError({
      statusCode: 400,
      message: 'rights must be 0 or 1'
    })
  }

  const emailExists = await User.exists({ email })

  if (emailExists) {
    throw createError({
      statusCode: 409,
      message: 'Пользователь с таким email уже существует'
    })
  }

  const userId = await generateUserId()
  const avatar = generateAvatar(username)
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await User.create({
    userId,
    avatar,
    username,
    email,
    password: hashedPassword,
    rank,
    rights,
    telegram,
    phone,
    company,
    isBlocked: false,
    tasksCount: 0,
    currentTasks: [],
    completedTasks: 0
  })

  await createActivityLog({
    type: 'page-action',
    title: 'Создан новый пользователь',
    message: `Администратор создал пользователя ${username}`,
    actorUserId: adminUserId,
    targetUserId: user.userId,
    meta: {
      createdUserId: user.userId,
      rights: user.rights
    }
  }).catch(() => {})

  const result = user.toObject()
  delete result.password

  return {
    success: true,
    user: result
  }
})