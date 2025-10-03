import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('body', body)
    
    // Validate required fields
    const requiredFields = ['title',  'serviceType', 'price'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    
    const client = await clientPromise;
    const db = client.db("amtronics")
    const newFee = {
      ...body,
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection('hwsd').insertOne(newFee);
    
    return NextResponse.json({ 
      success: true, 
      message: 'HWSD fee request submitted successfully', 
      id: result.insertedId 
    });
  } catch (error) {
    console.error('Failed to submit HWSD fee request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
