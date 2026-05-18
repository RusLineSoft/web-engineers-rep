import mongoose from 'mongoose';

const automationRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  trigger: { type: String, required: true }, // e.g., 'tag_added', 'status_changed', 'deadline_passed'
  triggerValue: { type: String }, // e.g., 'URGENT', 'Done'
  action: { type: String, required: true }, // e.g., 'set_priority', 'add_tag', 'notify'
  actionValue: { type: String }, // e.g., 'Urgent', 'READY_FOR_DEPLOY'
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const AutomationRule = mongoose.models.AutomationRule || mongoose.model('AutomationRule', automationRuleSchema);


