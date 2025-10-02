// app/api/payment-result/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const CLIENT_ID = process.env.CBK_CLIENT_ID;
const CLIENT_SECRET = process.env.CBK_CLIENT_SECRET;
const ENCRP_KEY = process.env.CBK_ENCRP_KEY;
const BASE_URL = process.env.CBK_TEST_URL;

async function getAccessToken() {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const response = await axios.post(
    `${BASE_URL}/ePay/api/cbk/online/pg/merchant/Authenticate`,
    { ClientId: CLIENT_ID, ClientSecret: CLIENT_SECRET, ENCRP_KEY },
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
      },
    }
  );

  const data = response.data;
  if (data.Status === '1') return data.AccessToken;
  throw new Error('Authentication failed');
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const encrp = searchParams.get('encrp');

  console.log('BASE_URL', BASE_URL);
  console.log('encrp', encrp);
  console.log('CLIENT_ID', CLIENT_ID);
  console.log('CLIENT_SECRET', CLIENT_SECRET);

  console.log('ENCRP_KEY', ENCRP_KEY);
  
  if (!encrp) {
    return NextResponse.json({ error: 'Missing encrp parameter' }, { status: 400 });
  }

  try {
    const accessToken = await getAccessToken();
    const url = `${BASE_URL}/ePay/api/cbk/online/pg/GetTransactions/${encrp}/${accessToken}`;

    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
      },
    });

    const data = response.data;
    if (data.Status === '0' || data.Status === '-1') {
      return NextResponse.json({ error: 'Invalid transaction' }, { status: 404 });
    } else {
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Failed to fetch payment result:', error);
    return NextResponse.json({ error: 'Failed to fetch payment result' }, { status: 500 });
  }
}