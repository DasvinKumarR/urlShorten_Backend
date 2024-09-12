// server.js
import express from 'express';
import cors from 'cors';
import { dbConnect } from './config/db.js';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import urlRoute from './routes/urlRoutes.js';

dotenv.config(); // Load environment variables

const app = express();

app.use(express.json());

app.use(cors()); // Use cors middleware if needed

dbConnect(); // Connect to the database
// calling api functionality from controller
app.use('/auth', authRoutes);
app.use('/url', urlRoute);

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is up at ${process.env.PORT || 5000}`);
});
