import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  order: { type: Number, required: true },
}, { timestamps: true });

export const Column = mongoose.models.Column || mongoose.model('Column', columnSchema);
