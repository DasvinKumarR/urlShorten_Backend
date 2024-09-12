import express from 'express';
import { shortenUrl, redirectUrl, getDashboardData, getAllUrls } from '../controllers/urlController.js';

const urlRoute = express.Router();
// created routes for url functionality
urlRoute.post('/shorten', shortenUrl);
urlRoute.get('/url/:shortUrl', redirectUrl);
urlRoute.get('/dashboard', getDashboardData);
urlRoute.get('/all', getAllUrls);

export default urlRoute;
