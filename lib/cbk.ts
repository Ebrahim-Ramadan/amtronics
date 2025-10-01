// lib/cbk.ts
import axios from "axios";

const BASE_URL = process.env.CBK_TEST_URL; // switch to PROD in production

export async function getAccessToken() {
  const url = `${BASE_URL}/ePay/api/cbk/online/pg/merchant/Authenticate`;

  const body = {
    ClientId: process.env.CBK_CLIENT_ID,
    ClientSecret: process.env.CBK_CLIENT_SECRET,
    ENCRP_KEY: process.env.CBK_ENCRP_KEY,
  };

  const res = await axios.post(url, body, {
    headers: {
      "Content-Type": "application/json",
    },
    auth: {
      username: process.env.CBK_CLIENT_ID!,
      password: process.env.CBK_CLIENT_SECRET!,
    },
  });

  if (res.data.Status !== "1") {
    throw new Error("Authentication failed: " + res.data.Message);
  }

  return res.data.AccessToken;
}
