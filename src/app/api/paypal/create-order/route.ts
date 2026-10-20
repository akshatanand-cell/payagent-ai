import { NextResponse } from 'next/server';
import { createPayPalOrder } from '@/lib/paypal';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency, description, items, customId } = body;

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    const order = await createPayPalOrder({
      amount: String(amount),
      currency: currency || 'USD',
      description: description || 'Agentic Autonomous Payment',
      items: items || [],
      customId,
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('API /api/paypal/create-order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
