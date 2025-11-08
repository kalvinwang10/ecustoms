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
    const { sourceId, amount = 3500 } = await request.json(); // $35.00 in cents
    
    const response = await client.payments.create({
      sourceId,
      amountMoney: {
        amount: BigInt(amount),
        currency: 'USD',
      },
      locationId: process.env.SQUARE_LOCATION_ID!,
      idempotencyKey: crypto.randomUUID(),
      note: 'Electronic Customs Declaration Processing Fee',
    });

    return NextResponse.json({ 
      payment: response,
      success: true 
    });
  } catch (error) {
    console.error('Square payment error:', error);
    return NextResponse.json(
      { error: 'Payment failed', details: error },
      { status: 500 }
    );
  }
}

