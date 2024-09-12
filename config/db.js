import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables
// database connections code
export const dbConnect = () => {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => { console.log('DB connected successfully'); })
        .catch((err) => { console.log('DB connection error:', err); });
};
