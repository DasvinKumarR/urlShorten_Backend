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
    
    const url = `http://localhost:5000/auth/activate/${token}`;
    
    // Store token in database (or a better method might be using Redis)
    await user.updateOne({ $set: { token } });

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
    await user.updateOne({ $set: { isActive: true }, $unset: { token: 1 } });
    //res.status(200).json({ message: 'Account activated. You can now login.' });
    res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Account Activated</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .container { border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
              h1 { color: #4CAF50; }
              p { color: #555; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Account Activated!</h1>
              <p>You can now <a href="/login">login</a> to your account.</p>
            </div>
          </body>
        </html>
      `);
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
    const url = `http://localhost:5000/auth/reset-password/${token}`;
    
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
    user.resetPasswordToken = undefined;
    await user.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
