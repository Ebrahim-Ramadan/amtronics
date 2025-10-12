'use client';
import { useState } from 'react';

export default function PaymentButton({ amount, trackid = "ass5"}: { amount: any; trackid: string }) {
  const [loading, setLoading] = useState(false);
  // Format amount as integer value
  const formattedAmount = Math.floor(Number(amount));

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Get HTML form from the API
      const res = await fetch('/api/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formattedAmount,
          trackid,
          reference: `REF-${Date.now()}`,
          returl: 'https://amtronics.co/payment-result',
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed with status ${res.status}: ${errorText}`);
      }

      // Response is HTML form, not JSON
      const htmlContent = await res.text();
      console.log('htmlContent', htmlContent);
      
      // Create temporary container and inject HTML
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = htmlContent;
      document.body.appendChild(tempContainer);
      
      // Find and submit the form
      const form = tempContainer.querySelector('form');
      if (form) {
        form.submit();
      } else {
        throw new Error('Payment form not found in response');
      }
    } catch (error) {
      console.error('Payment failed', error);
      alert('Payment initialization failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={loading}
      className="w-full py-3 rounded-md bg-[#00B8DB] text-white font-medium hover:bg-[#009cba] transition-colors"
    >
      {loading ? 'Processing...' : `Pay ${formattedAmount} KWD with KNET`}
    </button>
  );
}