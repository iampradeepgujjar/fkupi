import { CASHFREE_CONFIG } from '../../../lib/cashfree';

function getOrigin(request: Request): string {
  const originHeader = request.headers.get('origin');
  if (originHeader && originHeader !== 'null') {
    return originHeader.replace(/\/+$/, '');
  }

  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (forwardedHost) {
    const proto = request.headers.get('x-forwarded-proto') || (forwardedHost.includes('localhost') || forwardedHost.includes('127.0.0.1') ? 'http' : 'https');
    return `${proto}://${forwardedHost}`.replace(/\/+$/, '');
  }

  try {
    const url = new URL(request.url);
    return url.origin;
  } catch {
    return '';
  }
}

export async function POST(request: Request) {
  const origin = getOrigin(request);

  try {
    const body = await request.json();
    const { payload } = body;

    if (!payload) {
      return Response.json({ error: 'Missing encrypted payload' }, { status: 400 });
    }

    // Decrypt the payload (Base64)
    const decryptedString = decodeURIComponent(escape(atob(payload)));
    const data = JSON.parse(decryptedString);

    const { orderId, amount, mobileNumber, addressData } = data;

    const rawPhone = (addressData?.phone || mobileNumber || '').toString().replace(/\D/g, '');
    const phone = rawPhone.length >= 10 ? rawPhone.slice(-10) : '9876543210';

    // Call Cashfree API
    const cashfreePayload = {
      order_amount: parseFloat(amount) || 1,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: "cust_" + Math.random().toString(36).substr(2, 9),
        customer_phone: phone,
        customer_name: addressData?.name || "User"
      },
      order_meta: {
        // We will verify the payment or show success on this page
        return_url: `${origin}/payment-success?order_id={order_id}`
      }
    };

    const cashfreeResponse = await fetch(`${CASHFREE_CONFIG.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': CASHFREE_CONFIG.clientId,
        'x-client-secret': CASHFREE_CONFIG.clientSecret,
        'x-api-version': CASHFREE_CONFIG.apiVersion,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(cashfreePayload)
    });

    const cashfreeData = await cashfreeResponse.json();

    if (cashfreeResponse.ok && cashfreeData.payment_link) {
      // Return the direct payment_link which Cashfree provides to redirect the user
      return Response.json({ redirectUrl: cashfreeData.payment_link });
    } else {
      console.error('Cashfree order creation failed:', cashfreeData);
      // On failure to create order, redirect to order summary
      return Response.json({ 
        redirectUrl: `${origin}/order-summary`,
        error: cashfreeData?.message || 'Order creation failed'
      });
    }

  } catch (error) {
    console.error('Payment API error:', error);
    // On exception, redirect to order summary
    return Response.json({ 
      redirectUrl: `${origin}/order-summary`,
      error: 'Payment API error' 
    });
  }
}

