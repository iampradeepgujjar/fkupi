"use client";

import { useEffect, useRef } from 'react';

export default function PaymentPage() {
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    if (hasCalledAPI.current) return;
    hasCalledAPI.current = true;

    const processPayment = async () => {
      try {
        const orderId = 'OD' + Math.floor(Math.random() * 1000000000000000).toString();
        let cartItems = [];
        let addressData = null;
        let amount = '0';

        try {
          const savedCart = localStorage.getItem('cart');
          if (savedCart) cartItems = JSON.parse(savedCart);

          const savedAddress = sessionStorage.getItem('savedAddress');
          if (savedAddress) addressData = JSON.parse(savedAddress);

          const savedAmount = sessionStorage.getItem('finalAmount');
          if (savedAmount) amount = savedAmount;
        } catch (e) {
          console.error('Error parsing data:', e);
        }

        const startDigit = ['7', '8', '9'][Math.floor(Math.random() * 3)];
        const restDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
        const mobileNumber = startDigit + restDigits;

        const payload = {
          orderId,
          amount,
          cartItems,
          addressData,
          mobileNumber
        };

        const encryptedPayload = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));

        const response = await fetch('/api/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payload: encryptedPayload })
        });

        const data = await response.json();
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      } catch (error) {
        console.error('Payment failed', error);
      }
    };

    processPayment();
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      width: '100vw',
      background: '#f1f3f6',
      fontSize: '20px',
      fontWeight: 600,
      color: '#212121'
    }}>
      Please wait...
    </div>
  );
}
