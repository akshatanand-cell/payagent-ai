const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

/**
 * Generates an OAuth 2.0 access token using client credentials
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId === 'test') {
    // Return mock token for local preview/demo if credentials aren't supplied yet
    return 'sandbox_mock_token_' + Date.now();
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('PayPal OAuth Error:', errorData);
    throw new Error(`Failed to get PayPal Access Token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export interface OrderItem {
  name: string;
  unit_amount: {
    currency_code: string;
    value: string;
  };
  quantity: string;
  description?: string;
  category?: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS';
}

/**
 * Creates a PayPal Order (v2 Checkout)
 */
export async function createPayPalOrder({
  amount,
  currency = 'USD',
  description = 'Autonomous Agentic Purchase via PayAgent AI',
  items = [],
  customId = '',
}: {
  amount: string;
  currency?: string;
  description?: string;
  items?: OrderItem[];
  customId?: string;
}) {
  const accessToken = await getPayPalAccessToken();

  if (accessToken.startsWith('sandbox_mock_token_')) {
    // Deterministic mock order for instant offline testing
    return {
      id: 'MOCK-ORDER-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      status: 'CREATED',
      links: [
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=MOCK-${Date.now()}`,
          rel: 'approve',
          method: 'GET',
        },
      ],
    };
  }

  const payload: any = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        custom_id: customId || `agent_${Date.now()}`,
        description,
        amount: {
          currency_code: currency,
          value: amount,
          breakdown: items.length > 0 ? {
            item_total: {
              currency_code: currency,
              value: amount,
            },
          } : undefined,
        },
        items: items.length > 0 ? items : undefined,
      },
    ],
    application_context: {
      brand_name: 'PayAgent AI Protocol',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: 'http://localhost:3000/checkout/success',
      cancel_url: 'http://localhost:3000/checkout/cancel',
    },
  };

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('PayPal Create Order Error:', errorData);
    throw new Error(errorData.message || 'Failed to create PayPal Order');
  }

  return response.json();
}

/**
 * Captures an approved PayPal Order
 */
export async function capturePayPalOrder(orderId: string) {
  if (orderId.startsWith('MOCK-ORDER-')) {
    return {
      id: orderId,
      status: 'COMPLETED',
      payer: {
        email_address: 'buyer-sandbox@payagent.ai',
        name: { given_name: 'Alex', surname: 'Buyer' },
      },
      purchase_units: [
        {
          payments: {
            captures: [
              {
                id: 'MOCK-CAPTURE-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
                status: 'COMPLETED',
                amount: { currency_code: 'USD', value: '45.00' },
              },
            ],
          },
        },
      ],
    };
  }

  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `capture_${Date.now()}_${orderId}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('PayPal Capture Order Error:', errorData);
    throw new Error(errorData.message || 'Failed to capture PayPal Order');
  }

  return response.json();
}
