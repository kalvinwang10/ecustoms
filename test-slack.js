// Test script for Slack notifications
// Run with: node test-slack.js

require('dotenv').config({ path: '.env.local' });

async function testSlackWebhook() {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.error('❌ SLACK_WEBHOOK_URL is not configured in .env.local');
    console.log('Please add your Slack webhook URL to .env.local');
    console.log('You can get a webhook URL from: https://api.slack.com/messaging/webhooks');
    return;
  }

  console.log('📤 Sending test notification to Slack...');
  
  const testMessage = {
    text: 'Test notification from eCustoms',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🧪 Test Notification - eCustoms Payment System',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'This is a test notification to verify Slack integration is working correctly.',
        },
        fields: [
          {
            type: 'mrkdwn',
            text: '*Status:*\n✅ Working',
          },
          {
            type: 'mrkdwn',
            text: '*Environment:*\n' + (process.env.NODE_ENV || 'development'),
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Sample Payment Notification Preview:*',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: '*Amount:*\n$28.00',
          },
          {
            type: 'mrkdwn',
            text: '*Payment ID:*\ntest_payment_123',
          },
          {
            type: 'mrkdwn',
            text: '*Customer:*\nJohn Doe',
          },
          {
            type: 'mrkdwn',
            text: '*Passport:*\nA1234567',
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Test sent at: ${new Date().toLocaleString()} | Integration successful!`,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
    });

    if (response.ok) {
      console.log('✅ Test notification sent successfully!');
      console.log('Check your Slack channel for the test message.');
    } else {
      console.error('❌ Failed to send notification');
      console.error('Status:', response.status);
      const text = await response.text();
      console.error('Response:', text);
    }
  } catch (error) {
    console.error('❌ Error sending notification:', error.message);
  }
}

testSlackWebhook();