import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const CLIENT_ID = process.env.CBK_CLIENT_ID;
const CLIENT_SECRET = process.env.CBK_CLIENT_SECRET;
const ENCRP_KEY = process.env.CBK_ENCRP_KEY;
const BASE_URL = process.env.CBK_TEST_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const response = await axios.post(
      `${BASE_URL}/ePay/api/cbk/online/pg/merchant/Authenticate`,
      { ClientId: CLIENT_ID, ClientSecret: CLIENT_SECRET, ENCRP_KEY },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data;
    if (data.Status === '1') {
      res.status(200).json({ accessToken: data.AccessToken });
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get token' });
  }
}