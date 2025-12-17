import { logger } from './logger';

interface SlackPaymentNotification {
  paymentId?: string;
  amount: number;
  currency: string;
  customerName?: string;
  passportNumber?: string;
  nationality?: string;
  submissionId?: string;
  arrivalCardNumber?: string;
  timestamp?: string;
  paymentMethod?: string;
  status: 'success' | 'failed';
  errorMessage?: string;
}

interface SlackMessage {
  text: string;
  blocks?: Array<{
    type: string;
    text?: {
      type: string;
      text: string;
      emoji?: boolean;
    };
    elements?: Array<any>;
    fields?: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

class SlackNotifier {
  private webhookUrl: string | undefined;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL;
  }

  private formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  }

  private async sendToSlack(message: SlackMessage): Promise<boolean> {
    if (!this.webhookUrl) {
      logger.debug('SLACK_NOTIFICATION', 'Slack webhook URL not configured');
      return false;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      
      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Slack API returned ${response.status}: ${responseText}`);
      }

      logger.info('SLACK_NOTIFICATION', 'Notification sent successfully');
      return true;
    } catch (error) {
      console.error('Slack notification error:', error);
      logger.warn(
        'SLACK_NOTIFICATION_ERROR',
        'Failed to send Slack notification'
      );
      return false;
    }
  }

  async notifyPaymentSuccess(data: SlackPaymentNotification): Promise<boolean> {
    const timestamp = data.timestamp || new Date().toISOString();
    
    const message: SlackMessage = {
      text: '@channel New payment received successfully',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '@channel',
          },
        },
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '💰 Payment Received Successfully',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Payment ID:*\n${data.paymentId || 'N/A'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Customer:*\n${data.customerName || 'Not provided'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Passport:*\n${data.passportNumber || 'Not provided'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Nationality:*\n${data.nationality || 'Not provided'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Submission ID:*\n${data.submissionId || 'Not generated'}`,
            },
          ],
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Arrival Card:*\n${data.arrivalCardNumber || 'Not generated'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Timestamp:*\n${new Date(timestamp).toLocaleString()}`,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Payment Method: ${data.paymentMethod || 'Square'} | Environment: ${
                process.env.NODE_ENV === 'production' ? 'Production' : 'Sandbox'
              }`,
            },
          ],
        },
      ],
    };

    return this.sendToSlack(message);
  }

  async notifyPaymentFailed(data: SlackPaymentNotification): Promise<boolean> {
    const timestamp = data.timestamp || new Date().toISOString();

    const message: SlackMessage = {
      text: '@channel Payment failed',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '@channel',
          },
        },
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '⚠️ Payment Failed',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Error:*\n${data.errorMessage || 'Unknown error'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Customer:*\n${data.customerName || 'Not provided'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Timestamp:*\n${new Date(timestamp).toLocaleString()}`,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Environment: ${
                process.env.NODE_ENV === 'production' ? 'Production' : 'Sandbox'
              }`,
            },
          ],
        },
      ],
    };

    return this.sendToSlack(message);
  }

  async notifySubmissionComplete(
    submissionDetails: {
      submissionId?: string;
      arrivalCardNumber?: string;
      passengerName?: string;
      passportNumber?: string;
      nationality?: string;
      arrivalDate?: string;
      paymentId?: string;
      airtableUrl?: string;
    }
  ): Promise<boolean> {
    const message: SlackMessage = {
      text: '@channel New customs submission completed',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '@channel',
          },
        },
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '✅ Customs Submission Complete',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Submission ID:*\n${submissionDetails.submissionId || 'N/A'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Arrival Card:*\n${submissionDetails.arrivalCardNumber || 'N/A'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Passenger:*\n${submissionDetails.passengerName || 'Not provided'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Passport:*\n${submissionDetails.passportNumber || 'Not provided'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Nationality:*\n${submissionDetails.nationality || 'Not provided'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Arrival Date:*\n${submissionDetails.arrivalDate || 'Not provided'}`,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Timestamp: ${new Date().toLocaleString()} | Environment: ${
                process.env.NODE_ENV === 'production' ? 'Production' : 'Sandbox'
              }`,
            },
          ],
        },
      ],
    };

    if (submissionDetails.paymentId) {
      const paymentSection = {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `💳 *Payment ID:* ${submissionDetails.paymentId}`,
        },
      };
      message.blocks?.splice(3, 0, paymentSection);
    }

    if (submissionDetails.airtableUrl) {
      const airtableSection = {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `📊 *Airtable Record:* <${submissionDetails.airtableUrl}|View Details>`,
        },
      };
      message.blocks?.splice(-1, 0, airtableSection);
    }

    // Add All Indonesia submission link
    const allIndonesiaSection = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📝 *Manual Submission:* <https://allindonesia.imigrasi.go.id/arrival-card-submission/personal-information|Submit to All Indonesia>`,
      },
    };
    message.blocks?.splice(-1, 0, allIndonesiaSection);

    return this.sendToSlack(message);
  }
}

export const slackNotifier = new SlackNotifier();