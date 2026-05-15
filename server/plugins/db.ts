import mongoose from 'mongoose';

export default defineNitroPlugin(async (nitroApp) => {
    const config = useRuntimeConfig();
    const MONGODB_URI = process.env.MONGODB_URI;

    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('MongoDB | Connection successful');
    } catch (err) {
        console.error('MongoDB | Connection error:', err);
    }
});