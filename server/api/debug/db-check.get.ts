import mongoose from 'mongoose';
import { Task } from '../../models/Task';
import { Column } from '../../models/Column';

export default defineEventHandler(async () => {
  const dbName = mongoose.connection.name;
  const readyState = mongoose.connection.readyState;
  const taskCount = await (Task as any).countDocuments();
  const columnCount = await (Column as any).countDocuments();
  
  return {
    database: dbName,
    status: readyState === 1 ? 'Connected' : 'Disconnected',
    stats: {
      tasks: taskCount,
      columns: columnCount
    }
  };
});
