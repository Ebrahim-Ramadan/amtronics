// app/api/pay/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/cbk";

export async function POST(req: NextRequest) {
  try {
    const { amount, orderId } = await req.json();
    const accessToken = await getAccessToken();
    console.log('process.env.CBK_TEST_URL', process.env.CBK_TEST_URL);
    console.log('process.env.CBK_ENCRP_KEY', process.env.CBK_ENCRP_KEY);
    const returnUrl = `https://28980b98aab3.ngrok-free.app/api/cbk/result`;
    console.log('returnUrl', returnUrl);
    
    const checkoutUrl = `${process.env.CBK_TEST_URL}/ePay/pg/epay?_v=${accessToken}`;

const formHtml = `
  <form id="payForm" method="post" action="${checkoutUrl}" enctype="application/x-www-form-urlencoded">
    <input type="hidden" name="tij_MerchantEncryptCode" value="${process.env.CBK_ENCRP_KEY}" />
    <input type="hidden" name="tij_MerchAuthKeyApi" value="${accessToken}" />
    <input type="hidden" name="tij_MerchantPaymentLang" value="en" />
    <input type="hidden" name="tij_MerchantPaymentAmount" value="${Number(amount).toFixed(3)}" />
    <input type="hidden" name="tij_MerchantPaymentTrack" value="${orderId}" />
    <input type="hidden" name="tij_MerchantPaymentCurrency" value="KWD" />
    <input type="hidden" name="tij_MerchantPaymentRef" value="Order Payment" />
    <input type="hidden" name="tij_MerchReturnUrl" value="${returnUrl}" />
  </form>
  <script>document.getElementById("payForm").submit();</script>
`;


    return new NextResponse(formHtml, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
