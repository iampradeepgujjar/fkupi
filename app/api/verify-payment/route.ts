import { CASHFREE_CONFIG } from '../../../lib/cashfree';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('order_id');

  if (!orderId) {
    return Response.json({ error: 'Missing order_id' }, { status: 400 });
  }

  try {
    const cashfreeResponse = await fetch(`${CASHFREE_CONFIG.baseUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': CASHFREE_CONFIG.clientId,
        'x-client-secret': CASHFREE_CONFIG.clientSecret,
        'x-api-version': CASHFREE_CONFIG.apiVersion,
        'Accept': 'application/json'
      }
    });

    const cashfreeData = await cashfreeResponse.json();

    if (cashfreeResponse.ok) {
      return Response.json({ order_status: cashfreeData.order_status }); // Usually "PAID" or "ACTIVE"
    } else {
      return Response.json({ error: 'Failed to fetch order status' }, { status: 500 });
    }
  } catch (error) {
    console.error('Verify API error:', error);
    return Response.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
