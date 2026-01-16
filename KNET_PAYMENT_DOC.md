# Knet Payment Button Implementation Guide

## Overview
This document provides step-by-step instructions for implementing the Knet payment button in the checkout page. The button should integrate with the CBK (Central Bank of Kuwait) payment gateway to process Knet payments after an order is placed.

---

## Prerequisites & Context

### What is Knet?
Knet is a payment gateway used in Kuwait for processing debit/credit card payments. When a customer selects "Knet" as their payment method, they need to complete payment through the CBK payment gateway before the order is fully confirmed.

### Current State
- ✅ Payment method selection UI is already implemented
- ✅ Authorization check for Knet is already in place
- ✅ Order creation API (`/api/orders`) already handles `paymentMethod: "knet"`
- ⚠️ **MISSING**: The actual Knet payment button and payment processing flow

### Where to Add Code
The Knet payment button should be added at **line 708** in `app/checkout/page.tsx`, where you'll find this comment:
```tsx
{/* here goes the knet pay button */}
```

---

## Understanding Next.js Basics

### Client Components vs Server Components
- **Client Components** (files with `"use client"` at the top): Run in the browser, can use React hooks like `useState`, `useEffect`, can make API calls
- **Server Components**: Run on the server, cannot use hooks or browser APIs

**Our checkout page is a Client Component** - it has `"use client"` at the top of the file.

### API Routes Pattern in This Codebase
The codebase follows a consistent pattern for API calls:

1. **Frontend (Client Component)** makes a `fetch` call to `/api/[route-name]`
2. **Backend (API Route)** is in `app/api/[route-name]/route.ts`
3. **API Route** uses `clientPromise` from `@/lib/mongodb` to connect to database
4. **API Route** returns a JSON response

### Example Pattern from Codebase

**Frontend (checkout/page.tsx):**
```tsx
const response = await fetch("/api/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(orderData),
})

if (response.ok) {
  const orderResult = await response.json()
  const newOrderID = orderResult.newOrderID
  // Handle success
}
```

**Backend (app/api/orders/route.ts):**
```tsx
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const orderData = await request.json()
    const client = await clientPromise
    const db = client.db("amtronics")
    
    // Process order...
    const result = await db.collection("orders").insertOne(...)
    
    return NextResponse.json({ 
      newOrderID: result.insertedId, 
      success: true 
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
```

---

## Implementation Steps

### Step 1: Understand the Flow

When `paymentMethod === "knet"`:
1. User fills checkout form and clicks "Confirm Order"
2. Order is created in database (via `/api/orders`)
3. **NEW**: User is redirected to CBK payment gateway OR a payment button appears
4. User completes payment on CBK gateway
5. CBK redirects back to our site with payment status
6. We update order status based on payment result

### Step 2: Create API Route for Knet Payment Initialization

Create a new file: `app/api/payments/knet/init/route.ts`

**Purpose**: This API route will:
- Get an access token from CBK (using `lib/cbk.ts`)
- Create a payment session/transaction with CBK
- Return payment URL or payment data to frontend

**Template:**
```tsx
import { NextResponse } from "next/server"
import { getAccessToken } from "@/lib/cbk"
import clientPromise from "@/lib/mongodb"
import axios from "axios"

export async function POST(request: Request) {
  try {
    const { orderId, amount, customerInfo } = await request.json()
    
    // Validate required fields
    if (!orderId || !amount || !customerInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get CBK access token
    const accessToken = await getAccessToken()
    
    // TODO: Initialize payment with CBK gateway
    // This will depend on CBK API documentation
    // Example structure:
    // const paymentResponse = await axios.post(
    //   `${process.env.CBK_TEST_URL}/ePay/api/cbk/online/pg/payment/Initiate`,
    //   {
    //     OrderId: orderId,
    //     Amount: amount,
    //     Currency: "KWD",
    //     CustomerName: customerInfo.name,
    //     CustomerEmail: customerInfo.email,
    //     // ... other required fields per CBK docs
    //   },
    //   {
    //     headers: {
    //       "Authorization": `Bearer ${accessToken}`,
    //       "Content-Type": "application/json"
    //     }
    //   }
    // )

    // Update order in database 