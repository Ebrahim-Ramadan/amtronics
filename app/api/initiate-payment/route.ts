import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const CLIENT_ID = process.env.CBK_CLIENT_ID;
const CLIENT_SECRET = process.env.CBK_CLIENT_SECRET;
const ENCRP_KEY = process.env.CBK_ENCRP_KEY;
const BASE_URL = process.env.CBK_TEST_URL;
console.log(CLIENT_ID, CLIENT_SECRET, ENCRP_KEY, BASE_URL);

async function getAccessToken() {
  try {
    // Create credentials - don't encode the whole string, only password
    const encodedPassword = Buffer.from(CLIENT_SECRET || '').toString('base64');
    
    console.log('Attempting authentication with:', {
      url: `${BASE_URL}/ePay/api/cbk/online/pg/merchant/Authenticate`,
      merchantId: CLIENT_ID?.slice(0, 5) + '...',
    });

    const response = await axios.post(
      `${BASE_URL}/ePay/api/cbk/online/pg/merchant/Authenticate`,
      {
        id: CLIENT_ID,         // Changed from merchantId to id
        password: encodedPassword  // Send base64 encoded password
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
        timeout: 30000  // Increased timeout to 30 seconds
      }
    );

    if (!response.data?.token) {  // Changed from AccessToken to token
      throw new Error(`Invalid authentication response: ${JSON.stringify(response.data)}`);
    }

    return response.data.token;

  } catch (error: any) {
    console.error('Authentication error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      requestConfig: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data
      }
    });

    throw new Error(
      `Authentication failed: ${error.response?.data?.message || error.message}`
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('body00', body);
    
    const {
      formattedAmount,
      trackid,
      reference,
      udf1 = '',
      udf2 = '',
      udf3 = '',
      udf4 = '',
      udf5 = '',
      paymentType = 1,
      lang = 'en',
      returl,
    } = body;

    console.log('Request payload:', {
      amount: formattedAmount,
      trackid,
      reference,
      returl
    });

    // Ensure we have required fields
    if (!formattedAmount || !trackid || !reference || !returl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();
    console.log('Access token obtained:', accessToken);
    
    // Direct form submission to KNET without redirect
    const pgUrl = `${BASE_URL}/ePay/pg/epay`;

    // Form data preparation
    const formData = {
      tij_MerchantEncryptCode: ENCRP_KEY,
      tij_MerchAuthKeyApi: accessToken,
      tij_MerchantPaymentLang: lang,
      tij_MerchantPaymentAmount: formattedAmount,
      tij_MerchantPaymentTrack: trackid,
      tij_MerchantPaymentRef: reference,
      tij_MerchantUdf1: udf1,
      tij_MerchantUdf2: udf2,
      tij_MerchantUdf3: udf3,
      tij_MerchantUdf4: udf4,
      tij_MerchantUdf5: udf5,
      tij_MerchPayType: paymentType,
      tij_MerchReturnUrl: returl,
    };

    console.log('Form data:', formData);

    // Create an HTML form for direct submission
    let formHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Redirecting to payment gateway...</title>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f5f5f5;
        }
        .container {
          text-align: center;
          padding: 2rem;
          border-radius: 8px;
          background-color: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h2 {
          color: #333;
        }
        .loader {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Redirecting to KNET payment gateway</h2>
        <div class="loader"></div>
        <p>Please wait...</p>
        <p><b>DO NOT REFRESH OR CLOSE THIS PAGE</b></p>
        <form id="pgForm" method="POST" action="${pgUrl}">`;

    // Add all form fields
    Object.entries(formData).forEach(([key, value]) => {
      formHtml += `<input type="hidden" name="${key}" value="${value}">`;
    });

    formHtml += `
        </form>
        <script>
          // Submit the form automatically
          document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
              document.getElementById('pgForm').submit();
            }, 1500);
          });
        </script>
      </div>
    </body>
    </html>`;

    return new NextResponse(formHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Payment initiation failed:', error);
    return NextResponse.json(
      { error: 'Payment initiation failed', details: error.message },
      { status: 500 }
    );
  }
}