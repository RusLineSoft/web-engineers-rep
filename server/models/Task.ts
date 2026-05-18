import mongoose from 'mongoose';

/**
 * 📦 FSD Model: Task Schema
 * Схема задачи в MongoDB. Поддерживает расширенные фичи, такие как дедлайны,
 * теги, ответственные лица и подзадачи (чеклисты) для более глубокого трекинга.
 */
const taskSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  column: { type: mongoose.Schema.Types.ObjectId, ref: 'Column', required: true },
  project: { type: String, default: 'Kanban-board' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  tags: [{ type: String }],
  deadline: { type: Date },
  assignee: { type: String }, // Имя или ID ответственного
  checklist: [{ 
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false }
  }]
}, { timestamps: true });

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
