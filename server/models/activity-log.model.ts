import { Schema, model, Document } from 'mongoose'

export type ActivityLogType =
  | 'task-created'
  | 'task-updated'
  | 'task-deleted'
  | 'task-status-changed'
  | 'task-taken'
  | 'task-refused'
  | 'task-assigned'
  | 'task-unassigned'
  | 'user-login'
  | 'user-logout'
  | 'page-action'

interface IActivityActor {
  userId: string
  username: string
  avatar?: string
  rights?: number
}

interface IActivityLog {
  type: ActivityLogType
  title: string
  message: string
  actor?: IActivityActor
  targetUser?: IActivityActor
  taskId?: number
  taskName?: string
  meta?: Record<string, any>
  createdAt: Date
}

export interface IActivityLogDocument extends IActivityLog, Document {}

const ActorSchema = new Schema<IActivityActor>(
  {
    userId: { type: String, required: true },
    username: { type: String, required: true },
    avatar: { type: String, default: '' },
    rights: { type: Number, default: 0 }
  },
  { _id: false }
)

const ActivityLogSchema = new Schema<IActivityLogDocument>({
  type: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },

  actor: { type: ActorSchema, default: null },
  targetUser: { type: ActorSchema, default: null },

  taskId: { type: Number, default: null, index: true },
  taskName: { type: String, default: '' },

  meta: { type: Schema.Types.Mixed, default: {} },

  createdAt: { type: Date, default: Date.now, index: true }
})

export const ActivityLog = model<IActivityLogDocument>('ActivityLog', ActivityLogSchema)