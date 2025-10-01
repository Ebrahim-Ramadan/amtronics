// app/api/cbk/result/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/cbk";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const encrp = searchParams.get("encrp");

    if (!encrp) {
      return NextResponse.json({ error: "Missing encrp param" }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    const url = `${process.env.CBK_TEST_URL}/ePay/api/cbk/online/pg/GetTransactions/${encrp}/${accessToken}`;

    const { data } = await axios.get(url);

    // ⚡ save transaction details in your DB here
    console.log("Payment result:", data);

    if (data.Status === "1") {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment-success?trackId=${data.TrackId}`);
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/payment-failed?msg=${data.Message}`);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
