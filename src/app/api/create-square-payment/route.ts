import { NextRequest, NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.NODE_ENV === 'production' 
    ? SquareEnvironment.Production 
    : SquareEnvironment.Sandbox,
});

export async function POST(request: NextRequest) {
  try {
    const { sourceId, amount = 2800 } = await request.json(); // $28.00 in cents
    
    // Validate required environment variables
    if (!process.env.SQUARE_ACCESS_TOKEN) {
      console.error('Missing SQUARE_ACCESS_TOKEN');
      return NextResponse.json(
        { error: 'Payment system not configured', details: 'Missing access token' },
        { status: 500 }
      );
    }
    
    const locationId = process.env.SQUARE_LOCATION_ID || process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
    if (!locationId) {
      console.error('Missing SQUARE_LOCATION_ID or NEXT_PUBLIC_SQUARE_LOCATION_ID');
      return NextResponse.json(
        { error: 'Payment system not configured', details: 'Missing location ID' },
        { status: 500 }
      );
    }
    
    const response = await client.payments.create({
      sourceId,
      amountMoney: {
        amount: BigInt(amount),
        currency: 'USD',
      },
      locationId,
      idempotencyKey: crypto.randomUUID(),
      note: 'Electronic Customs Declaration Processing Fee',
    });

    // Convert BigInt values to strings for JSON serialization
    const paymentData = JSON.parse(
      JSON.stringify(response, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    return NextResponse.json({ 
      payment: paymentData,
      success: true 
    });
  } catch (error: any) {
    console.error('Square payment error:', error);
    
    // Log more details for debugging
    if (error.errors) {
      console.error('Square API errors:', JSON.stringify(error.errors, null, 2));
    }
    
    return NextResponse.json(
      { 
        error: 'Payment failed', 
        details: error.message || 'Unknown error',
        errors: error.errors || []
      },
      { status: 500 }
    );
  }
}

