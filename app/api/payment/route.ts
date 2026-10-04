import { CASHFREE_CONFIG } from '../../../lib/cashfree';

export async function POST(request: Request) {
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

    // Call Cashfree API
    const cashfreePayload = {
      order_amount: parseFloat(amount) || 1,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: "cust_" + Math.random().toString(36).substr(2, 9),
        customer_phone: mobileNumber,
        customer_name: addressData?.name || "User"
      },
      order_meta: {
        // We will verify the payment or show success on this page
        return_url: "http://localhost:5173/payment-success?order_id={order_id}"
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
      return Response.json({ redirectUrl: 'http://localhost:5173/order-summary' });
    }

  } catch (error) {
    console.error('Payment API error:', error);
    // On exception, redirect to order summary
    return Response.json({ redirectUrl: 'http://localhost:5173/order-summary' });
  }
}
