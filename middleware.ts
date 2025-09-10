import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("amtronics_order_auth")
  // You can add route protection logic here if needed
  // Example: restrict /api/orders DELETE to authorized users
  return NextResponse.next()
}