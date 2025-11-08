import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-square-signature');
    
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha256', process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!)
      .update(body)
      .digest('base64');
    
    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    const event = JSON.parse(body);
    
    // Handle payment events
    if (event.type === 'payment.created') {
      console.log('Payment successful:', event.data.object.payment);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

