import { NextRequest, NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';
import { slackNotifier } from '@/lib/slack-notifications';
import { airtableIntegration } from '@/lib/airtable-integration';
import { FormData } from '@/lib/formData';

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.NODE_ENV === 'production' 
    ? SquareEnvironment.Production 
    : SquareEnvironment.Sandbox,
});

export async function POST(request: NextRequest) {
  let amount = 2800; // Default $28.00 in cents
  
  try {
    const body = await request.json();
    const sourceId = body.sourceId;
    amount = body.amount || 2800; // $28.00 in cents
    const formData = body.formData as FormData | null;
    const submissionDetails = body.submissionDetails;
    
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
    
    // TEMPORARILY DISABLED: Skip actual payment processing
    // const response = await client.payments.create({
    //   sourceId,
    //   amountMoney: {
    //     amount: BigInt(amount),
    //     currency: 'USD',
    //   },
    //   locationId,
    //   idempotencyKey: crypto.randomUUID(),
    //   note: 'Electronic Customs Declaration Processing Fee',
    // });

    // Create mock payment response for testing
    const mockPaymentId = `TEMP-${Date.now()}`;
    const paymentData: any = {
      result: {
        payment: {
          id: mockPaymentId,
          status: 'PENDING',
          amountMoney: {
            amount: amount.toString(),
            currency: 'USD',
          },
          createdAt: new Date().toISOString(),
          note: 'Electronic Customs Declaration Processing Fee (NOT CHARGED)',
        },
      },
      payment: {
        id: mockPaymentId,
        status: 'PENDING',
      },
    };

    // Check different possible payment locations
    const payment = paymentData?.result?.payment || paymentData?.payment || paymentData;

    // Send Slack notification for successful payment
    if (paymentData?.result?.payment) {
      const paymentId = paymentData.result.payment.id;
      
      await slackNotifier.notifyPaymentSuccess({
        paymentId: paymentId,
        amount: 0, // Amount removed from display, keeping for interface compatibility
        currency: 'USD',
        status: 'success',
        timestamp: paymentData.result.payment.createdAt,
        paymentMethod: 'TEMP - Not Charged',
      });
      
      // If we have form data, store in Airtable and send submission complete notification
      if (formData) {
        // Store traveller data in Airtable
        let airtableUrl: string | undefined;
        try {
          const airtableResult = await airtableIntegration.storeTravellerData(formData, {
            paymentId: paymentId,
            submissionId: `TEMP-${paymentId || Date.now()}`,
          });
          airtableUrl = airtableResult.airtableUrl;
        } catch (error) {
          console.error('Airtable integration error:', error);
        }
        
        // Send submission complete notification with Airtable link
        if (submissionDetails) {
          try {
            await slackNotifier.notifySubmissionComplete({
              submissionId: `TEMP-${paymentId || Date.now()}`,
              arrivalCardNumber: 'Pending manual submission (TEMP)',
              passengerName: submissionDetails.passengerName || formData.fullPassportName,
              passportNumber: submissionDetails.passportNumber || formData.passportNumber,
              nationality: submissionDetails.nationality || formData.nationality,
              arrivalDate: submissionDetails.arrivalDate || formData.arrivalDate,
              paymentId: paymentId,
              airtableUrl: airtableUrl,
            });
          } catch (error) {
            console.error('Slack submission notification error:', error);
          }
        }
      }
    } else {
      // Try to process integrations anyway if we have a payment ID anywhere
      if (payment?.id && formData) {
        const paymentId = payment.id;
        
        // Store traveller data in Airtable
        let airtableUrl: string | undefined;
        try {
          const airtableResult = await airtableIntegration.storeTravellerData(formData, {
            paymentId: paymentId,
            submissionId: `TEMP-${paymentId || Date.now()}`,
          });
          airtableUrl = airtableResult.airtableUrl;
        } catch (error) {
          console.error('Airtable integration error:', error);
        }
        
        // Send submission complete notification
        if (submissionDetails) {
          try {
            await slackNotifier.notifySubmissionComplete({
              submissionId: `TEMP-${paymentId || Date.now()}`,
              arrivalCardNumber: 'Pending manual submission (TEMP)',
              passengerName: submissionDetails.passengerName || formData.fullPassportName,
              passportNumber: submissionDetails.passportNumber || formData.passportNumber,
              nationality: submissionDetails.nationality || formData.nationality,
              arrivalDate: submissionDetails.arrivalDate || formData.arrivalDate,
              paymentId: paymentId,
              airtableUrl: airtableUrl,
            });
          } catch (error) {
            console.error('Slack submission notification error:', error);
          }
        }
      }
    }

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
    
    // Send Slack notification for failed payment
    await slackNotifier.notifyPaymentFailed({
      amount: 0, // Amount removed from display, keeping for interface compatibility
      currency: 'USD',
      status: 'failed',
      errorMessage: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    
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

