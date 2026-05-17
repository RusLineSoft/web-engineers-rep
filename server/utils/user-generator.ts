import { User } from '~/server/models/user.model'

export const generateUserId = async (): Promise<string> => {
  while (true) {
    const userId = Math.floor(10000000 + Math.random() * 90000000).toString()
    const exists = await User.exists({ userId })

    if (!exists) {
      return userId
    }
  }
}

const gradients = [
  ['#3b82f6', '#8b5cf6'],
  ['#06b6d4', '#3b82f6'],
  ['#22c55e', '#14b8a6'],
  ['#f97316', '#ef4444'],
  ['#ec4899', '#8b5cf6'],
  ['#f59e0b', '#ef4444'],
  ['#10b981', '#2563eb'],
  ['#6366f1', '#d946ef']
]

export const getInitialsFromUsername = (username: string): string => {
  const words = username
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!words.length) return '??'

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase()
}

export const generateAvatar = (username: string): string => {
  const initials = getInitialsFromUsername(username)
  const [colorA, colorB] = gradients[Math.floor(Math.random() * gradients.length)]

  const svg = `
    <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="128" y2="128">
          <stop offset="0%" stop-color="${colorA}"/>
          <stop offset="100%" stop-color="${colorB}"/>
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="64" fill="url(#g)"/>
      <text
        x="50%"
        y="54%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="42"
        font-weight="800"
        fill="#ffffff"
      >${initials}</text>
    </svg>
  `.trim()

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}