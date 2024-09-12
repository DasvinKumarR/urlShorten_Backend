import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { generateToken } from '../utils/tokenUtils.js';
import dotenv from 'dotenv'

dotenv.config(); // Loads environmental variables
// declaring constant to mail transfer instants
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// function to handle register user
export const registerUser = async (req, res) => {
  const { email, firstName, lastName, password } = req.body;
  try {
    const token = generateToken();
    const user = await User.create({ email, firstName, lastName, password });
    
    const url = `https://shortenurlft.netlify.app/auth/activate/${token}`;
    
    // Store token in database (or a better method might be using Redis)
    await user.updateOne({ $set: { token: token } });

    await transporter.sendMail({
      to: email,
      subject: 'Activate your account',
      html: `<a href="${url}">Activate your account</a>`,
    });

    res.status(201).json({ message: 'User registered. Please check your email to activate your account.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// function to handle activate user
export const activateUser = async (req, res) => {
  const { token } = req.params;
    // Set the Content-Type header to text/html
   res.setHeader('Content-Type', 'text/html');
  try {
    const user = await User.findOne({ token });
    if (!user) return res.status(400).json({ message: 'Invalid token' });
    await user.updateOne({ $set: { isActive: true }, $set: { token: null } });
    res.status(200).json({ message: 'Account activated. You can now login.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// funciton to handle login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account not activated' });
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// function to handle forgot password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email not found' });
    
    const token = generateToken();
    const url = `https://shortenurlft.netlify.app/auth/reset-password/${token}`;
    
    // Store token in database (or use Redis)
    await user.updateOne({ $set: { resetPasswordToken: token } });

    await transporter.sendMail({
      to: email,
      subject: 'Reset Password',
      html: `<a href="${url}">Reset your password</a>`,
    });

    res.status(200).json({ message: 'Reset password link sent to email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// function to handle reset password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid token' });
    
    user.password = newPassword;
    user.resetPasswordToken = null;
    await user.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
