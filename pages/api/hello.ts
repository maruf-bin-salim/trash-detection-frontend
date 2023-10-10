// pages/api/uploadImage.js

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Get the raw image data from the request body
      const imageBuffer = req.body;

      // Process the imageBuffer as needed
      // You can save the image, perform classification, etc.
      // For example, you can use a library like 'sharp' to process the image:
      // const sharp = require('sharp');
      // const processedImage = await sharp(imageBuffer).resize(300, 200).toBuffer();

      // Example: Return a JSON response indicating the image upload was successful
      return res.status(200).json({ message: 'Image upload successful' });
    } catch (error) {
      console.error('Error processing image:', error);
      return res.status(500).json({ message: 'Error processing image' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
