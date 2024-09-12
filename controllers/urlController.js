import Url from '../models/Url.js';
import crypto from 'crypto';
// function to handle shorten URL
export const shortenUrl = async (req, res) => {
  const { originalUrl } = req.body;
  try {
    const shortUrl = crypto.randomBytes(6).toString('hex');
    const url = await Url.create({ originalUrl, shortUrl });
    res.status(201).json(url);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// function to handle redirectUrl
export const redirectUrl = async (req, res) => {
    const { shortUrl } = req.params;
    try {
      const url = await Url.findOne({ shortUrl });
      if (!url) return res.status(404).json({ message: 'URL not found' });
  
      // Increment click count
      url.clicks += 1;
      await url.save();
  
      // Redirect to the original URL
      res.status(200).send(url.originalUrl);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
// function to handle dashboard 
export const getDashboardData = async (req, res) => {
  try {
    const dailyCounts = await Url.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
    ]);

    const monthlyCounts = await Url.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setDate(1)) } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } }
    ]);

    res.status(200).json({ dailyCounts, monthlyCounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// function to handle all urls and counts
export const getAllUrls = async (req, res) => {
  try {
    let urls = await Url.find({}); 
    res.status(200).json(urls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
