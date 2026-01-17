# Checkout Page Flow Documentation - Knet Payment Button Implementation

## Purpose
This document explains the current checkout page flow and provides guidance for implementing the Knet payment button. It's designed for developers who may not be familiar with Next.js, explaining the patterns and flow in a clear, step-by-step manner.

---

## Overview of Next.js Architecture in This Project

### Client Components vs Server Components

**Client Components** (files with `"use client"` at the top):
- These files run in the user's web browser
- They can use React features like `useState`, `useEffect`, and event handlers
- They can make API calls to the backend using `fetch`
- They can interact with browser features like `localStorage`

**Server Components** (files without `"use client"`):
- These run on the server before sending HTML to the browser
- They cannot use React hooks or browser APIs
- They're mainly for rendering static content

**The checkout page (`app/checkout/page.tsx`) is a Client Component** - you'll see `"use client"` at the very top of the file. This means all the logic, form handling, and API calls happen in the browser.

---

## How API Routes Work (The Client Promise Pattern)

This codebase uses a consistent pattern for handling database operations. Here's how it works:

### The Pattern Flow

1. **Frontend (Client Component)** → User interacts with the page, triggers an action
2. **Frontend makes API call** → Uses `fetch()` to call `/api/[route-name]`
3. **Backend (API Route)** → File located at `app/api/[route-name]/route.ts` handles the request
4. **Database Connection** → API route uses `clientPromise` from `@/lib/mongodb` to connect
5. **Response** → API route returns JSON data back to frontend
6. **Frontend handles response** → Updates UI, shows success/error messages

### What is `clientPromise`?

`clientPromise` is a MongoDB connection utility located at `lib/mongodb.ts`. It's a special pattern used in Next.js to efficiently manage database connections.

**Key Points:**
- Every API route imports it: `import clientPromise from "@/lib/mongodb"`
- You await it to get the MongoDB client: `const client = await clientPromise`
- Then you get the database: `const db = client.db("amtronics")`
- This pattern ensures connections are reused and managed properly

**Example pattern you'll see in every API route:**
- Import `clientPromise` and `NextResponse`
- Parse the incoming request data (usually `await request.json()`)
- Await `clientPromise` to get the client
- Get the database instance: `client.db("amtronics")`
- Perform database operations (find, insert, update, etc.)
- Return `NextResponse.json()` with results or errors

---

## Current Checkout Flow

### Step-by-Step: What Happens When a User Checks Out

1. **User fills out the form** on `app/checkout/page.tsx`
   - Customer information (name, phone, email, address)
   - Payment method selection (currently: "cod", "pickup", or "knet")
   - Optional promo code application

2. **User clicks "Confirm Order" button**
   - The `handleSubmit` function is triggered (starts at line 198)
   - Form validation happens (required fields, phone format, name format)

3. **If validation passes, the form is submitted**
   - Loading state is set to `true`
   - Loading message is displayed to user

4. **Order data is prepared**
   - Includes: items, customerInfo, total, discount, promoCode, shippingFee, paymentMethod
   - Customer phone is formatted: `"+965" + customerInfo.phone`

5. **Frontend makes API call to `/api/orders`**
   - Method: POST
   - Body: JSON stringified order data
   - Headers: Content-Type: application/json

6. **Backend API route (`app/api/orders/route.ts`) processes the order**
   - Uses `clientPromise` to connect to MongoDB
   - Starts a database transaction (for data integrity)
   - Enhances order items with `ave_cost` if missing
   - Updates project quantities sold (for project bundles)
   - Inserts the order into the `orders` collection
   - Sends confirmation email (background process)
   - Returns `{ newOrderID, success: true }`

7. **Frontend receives response**
   - If successful, creates an order object in memory
   - Saves order to `localStorage` (for user's order history)
   - Clears the cart
   - Redirects user to `/myorders` page

8. **What's Missing for Knet?**
   - Currently, when `paymentMethod === "knet"`, the order is created but there's no payment button
   - The order status is set to "pending"
   - No connection to CBK payment gateway happens
   - The comment `{/* here goes the knet pay button */}` marks where the button should go (line 708)

---

## Current Payment Method Implementation

### Current State (Before Changes)

Currently, the checkout page has three payment method options:

1. **"cod"** - Cash on Delivery (Delivery)
   - User pays cash when order is delivered
   - Shipping fee: 2 KD
   - No special handling needed

2. **"pickup"** - Pickup from Shop
   - User picks up order from physical store
   - No shipping fee
   - No special handling needed

3. **"knet"** - In Shop (Knet) ⚠️ **CURRENTLY RESTRICTED**
   - Currently requires authorization (login check)
   - Shows auth dialog if user not logged in
   - Order is created but no payment button appears
   - This will change (see below)

### Authorization Check (Will Be Removed)

Currently, when user selects "knet":
- `handlePaymentMethodChange` function checks `isAuthorized` state
- If not authorized, shows a login dialog
- User must enter email/password (stored in environment variables)
- Auth status stored in cookie: `amtronics_order_auth`
- Submit button is disabled if not authorized

**IMPORTANT:** This authorization requirement will be removed. Everyone should be able to pay with Knet without logging in.

---

## Future Payment Method Structure (After Changes)

The payment methods will be updated to:

1. **Cash on Delivery** - User pays cash when order is delivered
2. **Knet** - User pays online via CBK payment gateway (NO authorization required)
3. **In Shop** - User pays in the physical store location
4. **Pickup** - User picks up order from physical store

**Key Changes Needed:**
- Remove authorization requirement for Knet
- Remove auth dialog and related state/functionality
- Add actual Knet payment button/flow
- Ensure Knet button appears after order is created

---

## Where the Knet Button Should Be Implemented

### Location in Code

The Knet payment button should be added at **line 708** in `app/checkout/page.tsx`, right after the form closing tag and before the Auth Dialog component.

**Context:**
- Line 707: `</form>` - Form ends here
- Line 708: `{/* here goes the knet pay button */}` - **THIS IS WHERE IT GOES**
- Line 709 onwards: Auth Dialog component (which may be removed or modified)

### When Should the Button Appear?

The Knet payment button should appear when:
1. `paymentMethod === "knet"`
2. Order has been successfully created (you'll have `newOrderID` from the API response)
3. Order status is "pending"

**Important Consideration:** The button needs to appear AFTER the order is created. Currently, the order creation happens inside `handleSubmit`, and after success, the user is redirected to `/myorders`. You may need to adjust the flow so that for Knet payments, the user stays on the checkout page to complete payment before redirecting.

---

## Understanding the Order Creation API

### API Route: `app/api/orders/route.ts`

**What it does:**
- Receives order data from frontend
- Uses `clientPromise` to connect to MongoDB
- Validates and enhances order items
- Creates order document in `orders` collection
- Returns the new order ID

**Key Details:**
- Uses MongoDB transactions (`session.withTransaction`) for data integrity
- Adds `ave_cost` to products if missing (fetches from database)
- Updates project quantities sold for project bundles
- Sends emails in background (doesn't wait for completion)
- Returns: `{ newOrderID, success: true, message: "Order placed successfully" }`

**Order Document Structure:**
- `items`: Array of cart items
- `customerInfo`: Customer details (name, phone, email, address)
- `total`: Order total
- `discount`: Discount amount
- `promoCode`: Applied promo code
- `shippingFee`: Shipping fee (2 for COD, 0 for others)
- `paymentMethod`: "cod", "pickup", or "knet"
- `status`: "pending" (initially)
- `createdAt`: Timestamp

---

## Expected Knet Payment Flow

## Expected Knet Payment Flow
## Expected Knet Payment Flow
# Checkout Page Flow Documentation - Knet Payment Button Implementation

## Purpose
This document explains the current checkout page flow and provides guidance for implementing the Knet payment button. It's designed for developers who may not be familiar with Next.js, explaining the patterns and flow in a clear, step-by-step manner.

---

## Overview of Next.js Architecture in This Project

### Client Components vs Server Components

**Client Components** (files with `"use client"` at the top):
- These files run in the user's web browser
- They can use React features like `useState`, `useEffect`, and event handlers
- They can make API calls to the backend using `fetch`
- They can interact with browser features like `localStorage`

**Server Components** (files without `"use client"`):
- These run on the server before sending HTML to the browser
- They cannot use React hooks or browser APIs
- They're mainly for rendering static content

**The checkout page (`app/checkout/page.tsx`) is a Client Component** - you'll see `"use client"` at the very top of the file. This means all the logic, form handling, and API calls happen in the browser.

---

## How API Routes Work (The Client Promise Pattern)

This codebase uses a consistent pattern for handling database operations. Here's how it works:

### The Pattern Flow

1. **Frontend (Client Component)** → User interacts with the page, triggers an action
2. **Frontend makes API call** → Uses `fetch()` to call `/api/[route-name]`
3. **Backend (API Route)** → File located at `app/api/[route-name]/route.ts` handles the request
4. **Database Connection** → API route uses `clientPromise` from `@/lib/mongodb` to connect
5. **Response** → API route returns JSON data back to frontend
6. **Frontend handles response** → Updates UI, shows success/error messages

### What is `clientPromise`?

`clientPromise` is a MongoDB connection utility located at `lib/mongodb.ts`. It's a special pattern used in Next.js to efficiently manage database connections.

**Key Points:**
- Every API route imports it: `import clientPromise from "@/lib/mongodb"`
- You await it to get the MongoDB client: `const client = await clientPromise`
- Then you get the database: `const db = client.db("amtronics")`
- This pattern ensures connections are reused and managed properly

**Example pattern you'll see in every API route:**
- Import `clientPromise` and `NextResponse`
- Parse the incoming request data (usually `await request.json()`)
- Await `clientPromise` to get the client
- Get the database instance: `client.db("amtronics")`
- Perform database operations (find, insert, update, etc.)
- Return `NextResponse.json()` with results or errors

---

## Current Checkout Flow

### Step-by-Step: What Happens When a User Checks Out

1. **User fills out the form** on `app/checkout/page.tsx`
   - Customer information (name, phone, email, address)
   - Payment method selection (currently: "cod", "pickup", or "knet")
   - Optional promo code application

2. **User clicks "Confirm Order" button**
   - The `handleSubmit` function is triggered (starts at line 198)
   - Form validation happens (required fields, phone format, name format)

3. **If validation passes, the form is submitted**
   - Loading state is set to `true`
   - Loading message is displayed to user

4. **Order data is prepared**
   - Includes: items, customerInfo, total, discount, promoCode, shippingFee, paymentMethod
   - Customer phone is formatted: `"+965" + customerInfo.phone`

5. **Frontend makes API call to `/api/orders`**
   - Method: POST
   - Body: JSON stringified order data
   - Headers: Content-Type: application/json

6. **Backend API route (`app/api/orders/route.ts`) processes the order**
   - Uses `clientPromise` to connect to MongoDB
   - Starts a database transaction (for data integrity)
   - Enhances order items with `ave_cost` if missing
   - Updates project quantities sold (for project bundles)
   - Inserts the order into the `orders` collection
   - Sends confirmation email (background process)
   - Returns `{ newOrderID, success: true }`

7. **Frontend receives response**
   - If successful, creates an order object in memory
   - Saves order to `localStorage` (for user's order history)
   - Clears the cart
   - Redirects user to `/myorders` page

8. **What's Missing for Knet?**
   - Currently, when `paymentMethod === "knet"`, the order is created but there's no payment button
   - The order status is set to "pending"
   - No connection to CBK payment gateway happens
   - The comment `{/* here goes the knet pay button */}` marks where the button should go (line 708)

---

## Current Payment Method Implementation

### Current State (Before Changes)

Currently, the checkout page has three payment method options:

1. **"cod"** - Cash on Delivery (Delivery)
   - User pays cash when order is delivered
   - Shipping fee: 2 KD
   - No special handling needed

2. **"pickup"** - Pickup from Shop
   - User picks up order from physical store
   - No shipping fee
   - No special handling needed

3. **"knet"** - In Shop (Knet) ⚠️ **CURRENTLY RESTRICTED**
   - Currently requires authorization (login check)
   - Shows auth dialog if user not logged in
   - Order is created but no payment button appears
   - This will change (see below)

### Authorization Check (Will Be Removed)

Currently, when user selects "knet":
- `handlePaymentMethodChange` function checks `isAuthorized` state
- If not authorized, shows a login dialog
- User must enter email/password (stored in environment variables)
- Auth status stored in cookie: `amtronics_order_auth`
- Submit button is disabled if not authorized

**IMPORTANT:** This authorization requirement will be removed. Everyone should be able to pay with Knet without logging in.

---

## Future Payment Method Structure (After Changes)

The payment methods will be updated to:

1. **Cash on Delivery** - User pays cash when order is delivered
2. **Knet** - User pays online via CBK payment gateway (NO authorization required)
3. **In Shop** - User pays in the physical store location
4. **Pickup** - User picks up order from physical store

**Key Changes Needed:**
- Remove authorization requirement for Knet
- Remove auth dialog and related state/functionality
- Add actual Knet payment button/flow
- Ensure Knet button appears after order is created

---

## Where the Knet Button Should Be Implemented

### Location in Code

The Knet payment button should be added at **line 708** in `app/checkout/page.tsx`, right after the form closing tag and before the Auth Dialog component.

**Context:**
- Line 707: `</form>` - Form ends here
- Line 708: `{/* here goes the knet pay button */}` - **THIS IS WHERE IT GOES**
- Line 709 onwards: Auth Dialog component (which may be removed or modified)

### When Should the Button Appear?

The Knet payment button should appear when:
1. `paymentMethod === "knet"`
2. Order has been successfully created (you'll have `newOrderID` from the API response)
3. Order status is "pending"

**Important Consideration:** The button needs to appear AFTER the order is created. Currently, the order creation happens inside `handleSubmit`, and after success, the user is redirected to `/myorders`. You may need to adjust the flow so that for Knet payments, the user stays on the checkout page to complete payment before redirecting.

---

## Understanding the Order Creation API

### API Route: `app/api/orders/route.ts`

**What it does:**
- Receives order data from frontend
- Uses `clientPromise` to connect to MongoDB
- Validates and enhances order items
- Creates order document in `orders` collection
- Returns the new order ID

**Key Details:**
- Uses MongoDB transactions (`session.withTransaction`) for data integrity
- Adds `ave_cost` to products if missing (fetches from database)
- Updates project quantities sold for project bundles
- Sends emails in background (doesn't wait for completion)
- Returns: `{ newOrderID, success: true, message: "Order placed successfully" }`

**Order Document Structure:**
- `items`: Array of cart items
- `customerInfo`: Customer details (name, phone, email, address)
- `total`: Order total
- `discount`: Discount amount
- `promoCode`: Applied promo code
- `shippingFee`: Shipping fee (2 for COD, 0 for others)
- `paymentMethod`: "cod", "pickup", or "knet"
- `status`: "pending" (initially)
- `createdAt`: Timestamp

---

## Expected Knet Payment Flow

### What Should Happen (The Goal)

When user selects Knet and confirms order:

1. **Order is created** - The order is saved to the database with `paymentMethod: "knet"` and `status: "pending"` (same as current flow)
2. **Payment button appears** - Instead of redirecting to `/myorders`, the checkout page should show a Knet payment button
3. **User clicks "Pay with Knet" button** - This triggers the payment process
4. **Frontend calls Knet payment API** - A new API route (e.g., `/api/payments/knet/init`) is called with the order ID
5. **Backend initializes payment** - The API route:
   - Connects to CBK payment gateway using `lib/cbk.ts` (for access token)
   - Creates a payment session with CBK
   - Stores payment session ID in the order document
   - Returns a payment URL or payment data to the frontend
6. **User is redirected to CBK gateway** - Or payment form appears inline (depends on CBK implementation)
7. **User completes payment** - Enters card details on CBK's secure payment page
8. **CBK redirects back** - CBK redirects user to a callback URL (e.g., `/api/payments/knet/callback`)
9. **Callback processes payment** - The callback route:
   - Verifies payment status with CBK
   - Updates order status in database (`status: "paid"` or `status: "failed"`)
   - Redirects user to success or failure page
10. **Order is completed** - User sees confirmation, order status updated, emails sent

---

## Key Implementation Points

### State Management in Checkout Page

The checkout page uses React state to manage the order flow. Key state variables you'll need to work with:

- `paymentMethod` - Currently set to "cod", "pickup", or "knet"
- `loading` - Boolean for showing loading states
- `loadingMessage` - String for displaying loading messages
- You'll likely need to add:
  - `orderCreated` - Boolean to track if order was successfully created
  - `newOrderID` - String to store the order ID after creation
  - `showKnetButton` - Boolean to control when the Knet button appears

### Modifying the handleSubmit Function

Currently, `handleSubmit` (starting at line 198) does the following for ALL payment methods:
- Validates form
- Creates order via `/api/orders`
- Saves to localStorage
- Clears cart
- Redirects to `/myorders`

**For Knet, you'll need to change the flow:**
- Keep everything the same until order is created
- Instead of redirecting, set `orderCreated = true` and `newOrderID = orderResult.newOrderID`
- Don't clear cart or redirect yet
- Show the Knet payment button instead
- Only redirect/clear cart after successful payment

### Conditional Rendering

You'll need to conditionally render the Knet button. The button should appear:
- When `paymentMethod === "knet"`
- When `orderCreated === true`
- When `newOrderID` exists
- When payment hasn't been completed yet

Use React conditional rendering like:
```
{paymentMethod === "knet" && orderCreated && newOrderID && (
  // Knet payment button component here
)}
```

---

## API Routes You'll Need to Create

### 1. Payment Initialization Route: `/api/payments/knet/init`

**Location:** `app/api/payments/knet/init/route.ts`

**Method:** POST

**Purpose:** Initialize payment with CBK gateway

**Expected Request Body:**
- `orderId`: String - The order ID from MongoDB
- `amount`: Number - Total amount to charge
- `customerInfo`: Object - Customer details (name, email, phone)

**What it should do:**
- Import `clientPromise` from `@/lib/mongodb`
- Parse request body
- Get access token from CBK (using `getAccessToken()` from `lib/cbk.ts`)
- Call CBK API to create payment session
- Update order document with payment session ID
- Return payment URL or payment form data to frontend

**Expected Response:**
```json
{
  "success": true,
  "paymentUrl": "https://cbk-gateway.com/pay/...",
  "sessionId": "cbk-session-id-123"
}
```

### 2. Payment Callback Route: `/api/payments/knet/callback`

**Location:** `app/api/payments/knet/callback/route.ts`

**Method:** GET or POST (depends on how CBK sends callbacks)

**Purpose:** Handle payment result from CBK gateway

**Expected Parameters:**
- Query parameters or body from CBK (sessionId, orderId, paymentStatus, etc.)

**What it should do:**
- Import `clientPromise` from `@/lib/mongodb`
- Extract payment status from CBK callback
- Verify payment with CBK (confirm it's legitimate)
- Update order status in database:
  - If successful: `status: "paid"` or `status: "confirmed"`
  - If failed: `status: "payment_failed"` or keep as `status: "pending"`
- Redirect user to appropriate page (success page or back to checkout with error)

**Expected Response:**
- Redirect using `NextResponse.redirect()` to success or failure page

---

## Understanding CBK Integration

### The `lib/cbk.ts` File

This file contains functions for interacting with the CBK (Central Bank of Kuwait) payment gateway. You'll likely find:

- `getAccessToken()` - Function that authenticates with CBK and returns an access token
- This token is needed for all CBK API calls

**How to use it:**
- Import it in your API route: `import { getAccessToken } from "@/lib/cbk"`
- Call it: `const token = await getAccessToken()`
- Use the token in authorization headers when calling CBK APIs

### CBK API Documentation

You'll need to refer to CBK's official API documentation to understand:
- What endpoints to call for payment initialization
- What data format they expect
- How they send payment callbacks
- What their response structure looks like
- How to verify payment authenticity

**Note:** The actual CBK API endpoints and request/response formats are not documented in this codebase. You'll need CBK's API documentation or work with someone who has access to it.

---

## Database Changes You Might Need

### Order Document Fields

When implementing Knet payment, you may want to add these fields to the order document:

- `paymentSessionId` - String - Stores the CBK session ID
- `paymentStatus` - String - "pending", "processing", "completed", "failed"
- `paymentTransactionId` - String - CBK transaction reference
- `paymentDate` - Date - When payment was completed
- `paymentGateway` - String - "knet" or "cbk"

These fields help track payment progress and troubleshoot issues.

### Updating Order Status

Orders typically have these statuses:
- `pending` - Order created, awaiting payment/action
- `paid` - Payment completed
- `confirmed` - Order confirmed and being processed
- `shipped` - Order shipped
- `delivered` - Order delivered
- `canceled` - Order canceled
- `payment_failed` - Payment attempt failed

For Knet flow:
- Order starts as `pending` after creation
- After successful payment: change to `paid` or `confirmed`
- After failed payment: keep as `pending` or set to `payment_failed`

---

## Testing Considerations

### Development vs Production

- CBK likely has separate test and production environments
- Use test credentials for development
- Test environment URLs and credentials should be in `.env.local` file
- Never commit production credentials to git

### Test Scenarios

When implementing, test these scenarios:

1. **Successful Payment Flow**
   - Create order with Knet
   - Click payment button
   - Complete payment on CBK
   - Verify order status updates correctly
   - Verify user sees success message

2. **Failed Payment Flow**
   - Create order with Knet
   - Click payment button
   - Cancel or fail payment on CBK
   - Verify order remains in pending state
   - Verify user sees appropriate error message

3. **Callback Handling**
   - Test that CBK callbacks are received correctly
   - Test callback verification (security)
   - Test order status updates from callbacks

4. **Edge Cases**
   - What happens if user closes browser during payment?
   - What happens if callback URL is called multiple times?
   - What happens if payment succeeds but order update fails?
   - What happens if network fails during payment initialization?

---

## Common Pitfalls to Avoid

1. **Don't redirect immediately after order creation** - For Knet, you need to show the payment button first

2. **Always verify payment callbacks** - Don't trust data from CBK without verification. Always verify the payment status with CBK's API.

3. **Handle payment timeouts** - CBK payment sessions might expire. Handle cases where user takes too long.

4. **Keep order ID consistent** - Make sure the order ID used in payment initialization matches the one in the callback.

5. **Don't clear cart until payment confirmed** - Only clear cart and redirect after payment is successful, not just after order creation.

6. **Handle duplicate callbacks** - CBK might call your callback URL multiple times. Make sure your callback handler is idempotent (can handle being called multiple times safely).

---

## Summary

The key steps for implementing Knet payment are:

1. **Modify checkout flow** - Change `handleSubmit` to not redirect for Knet orders
2. **Add state management** - Track when order is created and show payment button
3. **Create payment initialization API** - Route that connects to CBK and starts payment
4. **Add payment button UI** - Button that triggers payment initialization
5. **Create callback handler** - API route that receives payment result from CBK
6. **Update order status** - Modify order document based on payment result
7. **Handle success/failure** - Redirect users appropriately after payment

Remember: Follow the same `clientPromise` pattern used in all other API routes in this codebase. This ensures consistency and proper database connection management.

Good luck with the implementation! If you get stuck, refer to existing API routes like `app/api/orders/route.ts` or `app/api/promo/route.ts` as examples of how to structure your code.ted** - The order is saved to the database with `paymentMethod: "knet"` and `status: "pending"` (same as current flow)
2. **Payment button appears** - Instead of redirecting to `/myorders`, the checkout page should show a Knet payment button
3. **User clicks "Pay with Knet" button** - This triggers the payment process
4. **Frontend calls Knet payment API** - A new API route (e.g., `/api/payments/knet/init`) is called with the order ID
5. **Backend initializes payment** - The API route:
   - Connects to CBK payment gateway using `lib/cbk.ts` (for access token)
   - Creates a payment session with CBK
   - Stores payment session ID in the order document
   - Returns a payment URL or payment data to the frontend
6. **User is redirected to CBK gateway** - Or payment form appears inline (depends on CBK implementation)
7. **User completes payment** - Enters card details on CBK's secure payment page
8. **CBK redirects back** - CBK redirects user to a callback URL (e.g., `/api/payments/knet/callback`)
9. **Callback processes payment** - The callback route:
   - Verifies payment status with CBK
   - Updates order status in database (`status: "paid"` or `status: "failed"`)
   - Redirects user to success or failure page
10. **Order is completed** - User sees confirmation, order status updated, emails sent

---

## Key Implementation Points

### State Management in Checkout Page

The checkout page uses React state to manage the order flow. Key state variables you'll need to work with:

- `paymentMethod` - Currently set to "cod", "pickup", or "knet"
- `loading` - Boolean for showing loading states
- `loadingMessage` - String for displaying loading messages
- You'll likely need to add:
  - `orderCreated` - Boolean to track if order was successfully created
  - `newOrderID` - String to store the order ID after creation
  - `showKnetButton` - Boolean to control when the Knet button appears

### Modifying the handleSubmit Function

Currently, `handleSubmit` (starting at line 198) does the following for ALL payment methods:
- Validates form
- Creates order via `/api/orders`
- Saves to localStorage
- Clears cart
- Redirects to `/myorders`

**For Knet, you'll need to change the flow:**
- Keep everything the same until order is created
- Instead of redirecting, set `orderCreated = true` and `newOrderID = orderResult.newOrderID`
- Don't clear cart or redirect yet
- Show the Knet payment button instead
- Only redirect/clear cart after successful payment

### Conditional Rendering

You'll need to conditionally render the Knet button. The button should appear:
- When `paymentMethod === "knet"`
- When `orderCreated === true`
- When `newOrderID` exists
- When payment hasn't been completed yet

Use React conditional rendering like:
```
{paymentMethod === "knet" && orderCreated && newOrderID && (
  // Knet payment button component here
)}
```

---

## API Routes You'll Need to Create

### 1. Payment Initialization Route: `/api/payments/knet/init`

**Location:** `app/api/payments/knet/init/route.ts`

**Method:** POST

**Purpose:** Initialize payment with CBK gateway

**Expected Request Body:**
- `orderId`: String - The order ID from MongoDB
- `amount`: Number - Total amount to charge
- `customerInfo`: Object - Customer details (name, email, phone)

**What it should do:**
- Import `clientPromise` from `@/lib/mongodb`
- Parse request body
- Get access token from CBK (using `getAccessToken()` from `lib/cbk.ts`)
- Call CBK API to create payment session
- Update order document with payment session ID
- Return payment URL or payment form data to frontend

**Expected Response:**
```json
{
  "success": true,
  "paymentUrl": "https://cbk-gateway.com/pay/...",
  "sessionId": "cbk-session-id-123"
}
```

### 2. Payment Callback Route: `/api/payments/knet/callback`

**Location:** `app/api/payments/knet/callback/route.ts`

**Method:** GET or POST (depends on how CBK sends callbacks)

**Purpose:** Handle payment result from CBK gateway

**Expected Parameters:**
- Query parameters or body from CBK (sessionId, orderId, paymentStatus, etc.)

**What it should do:**
- Import `clientPromise` from `@/lib/mongodb`
- Extract payment status from CBK callback
- Verify payment with CBK (confirm it's legitimate)
- Update order status in database:
  - If successful: `status: "paid"` or `status: "confirmed"`
  - If failed: `status: "payment_failed"` or keep as `status: "pending"`
- Redirect user to appropriate page (success page or back to checkout with error)

**Expected Response:**
- Redirect using `NextResponse.redirect()` to success or failure page

---

## Understanding CBK Integration

### The `lib/cbk.ts` File

This file contains functions for interacting with the CBK (Central Bank of Kuwait) payment gateway. You'll likely find:

- `getAccessToken()` - Function that authenticates with CBK and returns an access token
- This token is needed for all CBK API calls

**How to use it:**
- Import it in your API route: `import { getAccessToken } from "@/lib/cbk"`
- Call it: `const token = await getAccessToken()`
- Use the token in authorization headers when calling CBK APIs

### CBK API Documentation

You'll need to refer to CBK's official API documentation to understand:
- What endpoints to call for payment initialization
- What data format they expect
- How they send payment callbacks
- What their response structure looks like
- How to verify payment authenticity

**Note:** The actual CBK API endpoints and request/response formats are not documented in this codebase. You'll need CBK's API documentation or work with someone who has access to it.
