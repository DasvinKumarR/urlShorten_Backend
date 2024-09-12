import crypto from 'crypto';
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config();
// function call to generate token
export const generateToken = () => crypto.randomBytes(20).toString('hex');

export const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
