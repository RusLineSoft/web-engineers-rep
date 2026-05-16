import mongoose from 'mongoose'

const TaskSchema = new mongoose.Schema(
  {
    taskId: {
      type: Number,
      required: true,
      unique: true
    },

    taskName: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: '',
      trim: true
    },

    status: {
      type: String,
      enum: ['To Do', 'In progress', 'Done'],
      default: 'To Do'
    },

    priority: {
      type: String,
      enum: ['veryUrgent', 'urgently', 'notUrgently', 'noPriority'],
      default: 'notUrgently'
    },

    tags: {
      type: [String],
      default: []
    },

    deadline: {
        type: Date,
        default: Date.now
    },

    assignedUsers: [
      {
        userId: { type: String, required: true },
        username: { type: String, required: true },
        avatar: { type: String, required: true }
      }
    ],

    createdAt: {
        type: Date,
        default: Date.now
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.models.Task || mongoose.model('Task', TaskSchema)