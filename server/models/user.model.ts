import { Schema, model, Document } from "mongoose";
import bcrypt from 'bcryptjs';

interface IUser {
    userId: string;
    avatar: string;
    username: string;
    password: string;
    rank?: string;
    rights?: number;
    telegram?: string;
    email: string;
    phone?: string;
    company?: string;
    tasksCount?: number;
    notification?: number;
    currentTasks?: Array<{
        taskId: number;
        taskName: string;
        status: string;
        priority: string;
        tags: string;
        createdAt: Date;
        deadline: Date;
    }>;
    completedTasks?: number;
    createdAt?: Date;
}

interface IUserDocument extends IUser, Document {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>({
    userId: { type: String, unique: true, required: true },
    avatar: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    rank: { type: String, default: "Сотрудник" },
    rights: { type: Number, default: 0 },
    telegram: { type: String, default: "" },
    email: { type: String, unique: true, required: true },
    phone: { type: String, default: "" },
    company: { type: String, default: "Неизвестно" },
    notification: { type: Number, default: 0 },
    tasksCount: { type: Number, default: 0 },
    currentTasks: [{
        taskId: { type: Number, required: true },
        taskName: { type: String, required: true },
        status: { type: String, required: true },
        priority: { type: String, required: true },
        tags: { type: [String], default: [] },
        createdAt: { type: Date, default: Date.now, required: true },
        deadline: { type: Date, default: Date.now, required: true },
    }],
    completedTasks: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUserDocument>("User", UserSchema);