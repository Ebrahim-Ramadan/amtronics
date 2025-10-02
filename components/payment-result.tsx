'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import LoadingDots from '@/components/ui/loading-spinner';

interface PaymentResult {
  Status: string;
  Amount: string;
  TrackId: string;
  PaymentId: string;
  Result: string;
  PostDate: string;
  TranId: string;
  Auth: string;
  Ref: string;
  // Add other fields as needed
}

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const encrp = searchParams.get('encrp');
  
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!encrp) {
      setLoading(false);
      setError('Missing payment information');
      return;
    }

    async function fetchPaymentResult() {
      try {
        const res = await fetch(`/api/payment-result?encrp=${encrp}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to verify payment');
        }
        
        setResult(data);
        
        // Here you could also update your order status
        // For example, call another API endpoint to update the order status
        // if (data.Status === '1') {
        //   await fetch('/api/orders/update-status', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //       trackId: data.TrackId,
        //       status: 'paid',
        //       paymentId: data.PaymentId
        //     })
        //   });
        // }
        
      } catch (err) {
        console.error('Error fetching payment result:', err);
        setError('Failed to verify payment status. Please contact customer support.');
      } finally {
        setLoading(false);
      }
    }

    fetchPaymentResult();
  }, [encrp]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Verifying Payment</h1>
          <LoadingDots />
          <p className="mt-4 text-gray-600">Please wait while we verify your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Verification Failed</h1>
          <p className="mb-6 text-gray-700">{error || 'Unable to verify payment status'}</p>
          <Link href="/">
            <Button variant="default" className="w-full">Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isSuccessful = result.Status === '1';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className={`text-2xl font-bold mb-4 ${isSuccessful ? 'text-green-600' : 'text-red-600'}`}>
          {isSuccessful ? 'Payment Successful' : 'Payment Failed'}
        </h1>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Status:</span>
            <span className={isSuccessful ? 'text-green-600' : 'text-red-600'}>
              {isSuccessful ? 'Success' : 'Failed'}
            </span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Amount:</span>
            <span>{result.Amount} KWD</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Transaction ID:</span>
            <span>{result.TranId || 'N/A'}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Payment Date:</span>
            <span>{result.PostDate || 'N/A'}</span>
          </div>
          
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Reference:</span>
            <span>{result.Ref || 'N/A'}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <Link href="/orders">
            <Button variant="default" className="w-full">
              View My Orders
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}