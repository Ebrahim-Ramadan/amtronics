"use client";
import { useState } from "react";

export function KNETPaymentButton({ amount }: { amount: string }) {
  const [loading, setLoading] = useState(false);
  
  // Option 1: Convert to integer (removes decimal places)
  const formattedAmount = Math.floor(Number(amount)); // e.g. "2.000" -> 2

  console.log('formattedAmount', formattedAmount, typeof formattedAmount);

  const handlePay = async () => {
    setLoading(true);
    const res = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: formattedAmount, orderId: Date.now().toString() }),
    });

    const html = await res.text();
    const popup = window.open("", "_self");
    if (popup) popup.document.write(html);
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      {loading ? "Redirecting..." : "Pay with KNET"}
    </button>
  );
}

export default KNETPaymentButton;