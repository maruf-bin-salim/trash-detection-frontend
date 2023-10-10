// pages/api/uploadImage.js

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Get the raw image data from the request body
      const imageBuffer = req.body;
      var buf = Buffer.from(body); 
      var base64Data = buf.toString('base64') 
      const dataUrl = 'data:image/jpeg;base64,' + base64Data; 

      

      // Example: Return the Data URL in the response
      return res.status(200).json({ dataUrl });
    } catch (error) {
      console.error('Error processing image:', error);
      return res.status(500).json({ message: 'Error processing image' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
