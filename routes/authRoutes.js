import express from 'express';
import { registerUser, activateUser, loginUser, forgotPassword, resetPassword } from '../controllers/authController.js';

const authRoutes = express.Router();
// created routes for user authentications
authRoutes.post('/register', registerUser);
authRoutes.get('/activate/:token', activateUser);
authRoutes.post('/login', loginUser);
authRoutes.post('/forgot-password', forgotPassword);
authRoutes.post('/reset-password/:token', resetPassword);

export default authRoutes;
