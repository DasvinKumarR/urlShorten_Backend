import crypto from 'crypto';
// function call to generate token
export const generateToken = () => crypto.randomBytes(20).toString('hex');
