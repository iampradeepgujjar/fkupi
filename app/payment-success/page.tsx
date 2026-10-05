"use client";
import { useRouter, useSearchParams } from 'next/navigation';


import { useEffect, useState, useRef, Suspense } from "react"




function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [address, setAddress] = useState<any>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isScreen1Visible, setIsScreen1Visible] = useState(true);
  const [isScreen1SlideOut, setIsScreen1SlideOut] = useState(false);
  const [isScreen2Visible, setIsScreen2Visible] = useState(false);
  const confettiRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Payment Success";
    try {
      const orderSpecific = orderId ? (sessionStorage.getItem(`order_address_${orderId}`) || localStorage.getItem(`order_address_${orderId}`)) : null;
      const generic = sessionStorage.getItem("savedAddress") || localStorage.getItem("savedAddress");
      const savedStr = orderSpecific || generic;
      if (savedStr) {
        setAddress(JSON.parse(savedStr));
      }
    } catch (e) {
      console.error("Error reading savedAddress:", e);
    }

    // Verify payment status
    if (orderId) {
      fetch(`/api/verify-payment?order_id=${orderId}`)
        .then(res => res.json())
        .then(data => {
          if (data.order_status && data.order_status !== 'PAID') {
            // Payment failed or was cancelled
            router.push('/order-summary');
            return;
          }
          if (data.addressData) {
            setAddress(data.addressData);
            try {
              sessionStorage.setItem('savedAddress', JSON.stringify(data.addressData));
              localStorage.setItem('savedAddress', JSON.stringify(data.addressData));
              sessionStorage.setItem(`order_address_${orderId}`, JSON.stringify(data.addressData));
              localStorage.setItem(`order_address_${orderId}`, JSON.stringify(data.addressData));
            } catch (err) {}
          }
        })
        .catch(err => console.error('Verification error:', err));
    }

    // Loading overlay
    setTimeout(() => {
      setShowOverlay(false);
    }, 450);

    // Confetti
    setTimeout(() => {
      launchConfetti();
    }, 500);

    // Auto-transition
    const t1 = setTimeout(() => {
      setIsScreen1SlideOut(true);
      setTimeout(() => {
        setIsScreen1Visible(false);
        setIsScreen2Visible(true);
      }, 520);
    }, 2800);
    
    return () => clearTimeout(t1);
  }, [orderId, router]);

  const launchConfetti = () => {
    const container = confettiRef.current;
    if (!container) return;
    const colors = ['#2BB673','#FFD700','#2874f0','#FF6B6B','#A855F7','#F59E0B'];
    const card = cardRef.current;
    const w = card ? card.offsetWidth : 340;
    
    for (let i = 0; i < 22; i++) {
      setTimeout(() => {
        const dot = document.createElement('div');
        dot.className = 'confetti-dot';
        const size = 6 + Math.random() * 8;
        const x = Math.random() * w;
        const delay = Math.random() * 0.4;
        const tx = (Math.random() - 0.5) * 160 + 'px';
        const ty = -(60 + Math.random() * 120) + 'px';
        dot.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:50%;background:${colors[i%colors.length]};--tx:${tx};--ty:${ty};animation-delay:${delay}s;animation-duration:${0.9+Math.random()*0.5}s;`;
        container.appendChild(dot);
        setTimeout(() => { dot.remove(); }, 1800);
      }, i * 60);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1); // "Delivery by tomorrow"
  const dateString = tomorrow.toLocaleDateString("en-GB", { day: "numeric", month: "short", weekday: "short" });

  return (
    <div className="store-shell" style={{ height: "100dvh", maxHeight: "100dvh", position: "relative", fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, sans-serif", background: "#f0f0f0", overflow: isScreen2Visible ? "auto" : "hidden", margin: "0 auto", padding: 0 }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html, body { height: 100%; font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif; background: #f0f0f0; overflow: hidden; }

        /* ===== SCREEN 1 — Order Placed ===== */
        #screen1 {
            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: #f0f0f0;
            display: flex; align-items: center; justify-content: center;
            z-index: 200;
            transition: transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease;
        }
        #screen1.slide-out {
            transform: translateY(-110%);
            opacity: 0;
            pointer-events: none;
        }

        .success-card {
            background: #fff;
            border-radius: 16px;
            padding: 44px 28px 36px;
            text-align: center;
            width: 92%;
            max-width: 420px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.10);
            animation: cardSlideIn 0.5s ease;
        }
        @keyframes cardSlideIn {
            from { transform: translateY(40px); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
        }

        /* Green checkmark circle */
        .check-wrap {
            width: 92px; height: 92px;
            margin: 0 auto 26px;
            position: relative;
        }
        .check-wrap svg.bg-circle {
            width: 92px; height: 92px;
            position: absolute; top: 0; left: 0;
            animation: popIn 0.55s cubic-bezier(0.175,0.885,0.32,1.275) forwards;
        }
        @keyframes popIn {
            0%   { transform: scale(0);   opacity: 0; }
            70%  { transform: scale(1.12);}
            100% { transform: scale(1);   opacity: 1; }
        }
        .check-wrap .checkmark-path {
            stroke-dasharray: 60;
            stroke-dashoffset: 60;
            animation: drawTick 0.55s 0.45s ease forwards;
        }
        @keyframes drawTick {
            to { stroke-dashoffset: 0; }
        }

        .s1-title {
            font-size: 22px; font-weight: 700;
            color: #212121; margin-bottom: 12px;
            animation: fadeUp 0.4s 0.35s both;
        }
        .s1-coins {
            font-size: 14px; color: #878787;
            display: flex; align-items: center; justify-content: center; gap: 6px;
            margin-bottom: 10px;
            animation: fadeUp 0.4s 0.45s both;
        }
        .s1-coins svg { width: 18px; height: 18px; }
        
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        /* confetti dots */
        .confetti-dot {
            position: absolute; border-radius: 50%;
            animation: confettiFly 1.2s ease-out forwards;
            opacity: 0;
        }
        @keyframes confettiFly {
            0%   { opacity: 1; transform: scale(1) translate(0,0); }
            100% { opacity: 0; transform: scale(0.5) translate(var(--tx), var(--ty)); }
        }

        /* ===== SCREEN 2 — Thanks Page ===== */
        #screen2 {
            position: relative; 
            background: #f0f0f0;
            min-height: 100vh;
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.45s ease, transform 0.45s ease;
        }
        #screen2.visible {
            opacity: 1; transform: translateY(0);
        }

        /* Top card */
        .s2-top-card {
            background: #fff;
            padding: 20px 16px 18px;
            margin-bottom: 8px;
            animation: fadeUp 0.4s ease;
        }
        .s2-check-row {
            display: flex; align-items: flex-start; gap: 14px;
            margin-bottom: 8px;
        }
        .s2-heading { font-size: 18px; font-weight: 700; color: #212121; margin-bottom: 4px; }
        .s2-delivery-sub { font-size: 13px; color: #878787; margin-bottom: 8px; }
        .s2-supercoins {
            font-size: 13px; font-weight: 600; color: #388e3c;
            display: flex; align-items: center; gap: 4px;
        }
        .s2-supercoins .lightning { font-size: 14px; }

        /* Divider */
        .divider { height: 1px; background: #f0f0f0; margin: 12px 0; }

        /* Delivery section */
        .s2-delivery-card {
            background: #fff;
            padding: 16px;
            margin-bottom: 8px;
        }
        .s2-date-bold { font-size: 15px; font-weight: 700; color: #212121; margin-bottom: 14px; }
        .s2-name { font-size: 15px; font-weight: 700; color: #212121; margin-bottom: 4px; line-height: 1.5; }
        .tag-badge { display: inline-block; font-size: 10px; font-weight: 700; color: #878787; border: 1px solid #d4d5d9; border-radius: 2px; padding: 1px 5px; margin-left: 6px; letter-spacing: 0.04em; vertical-align: middle; }
        
        /* OTP Box */
        .otp-box {
            background: #f9f9f9;
            border-radius: 10px;
            padding: 14px;
            margin-bottom: 8px;
        }
        .otp-title {
            font-size: 14px; font-weight: 700; color: #212121;
            display: flex; align-items: center; gap: 6px;
            margin-bottom: 8px;
        }
        .otp-text { font-size: 13px; color: #878787; line-height: 1.55; }

        /* Bottom button */
        .s2-bottom-btn {
            position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: min(100%, 432px);
            background: #2874f0;
            color: #fff; font-size: 16px; font-weight: 600;
            text-align: center;
            padding: 16px; padding-bottom: calc(16px + env(safe-area-inset-bottom));
            border: none; cursor: pointer;
            letter-spacing: 0.3px;
            z-index: 100;
        }
        .s2-bottom-btn:active { background: #1a5ecf; }
        .s2-spacer { height: 84px; }

        /* Ripple animation on check in screen2 */
        @keyframes ripple {
            0%   { box-shadow: 0 0 0 0 rgba(43,182,115,0.35); }
            70%  { box-shadow: 0 0 0 14px rgba(43,182,115,0); }
            100% { box-shadow: 0 0 0 0 rgba(43,182,115,0); }
        }
        .s2-check-icon-bg {
            width: 40px; height: 40px; border-radius: 50%;
            background: linear-gradient(135deg,#2BB673,#1d9e5f);
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
            animation: ripple 1.5s 0.5s ease-out 2;
        }
        .s2-check-icon-bg svg { width: 22px; height: 22px; }

        #loading-overlay {
            position: absolute; inset: 0; background: #fff;
            z-index: 9999; display: flex; align-items: center; justify-content: center;
            transition: opacity 0.4s ease;
        }
        #loading-overlay.hidden { opacity: 0; pointer-events: none; }
        .spinner-ring {
            width: 44px; height: 44px;
            border: 4px solid #f0f0f0;
            border-top-color: #2874f0;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {showOverlay && (
        <div id="loading-overlay" className={showOverlay ? "" : "hidden"} style={{ display: showOverlay ? "flex" : "none" }}>
          <div className="spinner-ring"></div>
        </div>
      )}

      {isScreen1Visible && (
        <div id="screen1" className={isScreen1SlideOut ? "slide-out" : ""}>
          <div className="success-card" ref={cardRef} style={{ position: "relative", overflow: "hidden" }}>
            <div id="confetti-container" ref={confettiRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "hidden" }}></div>
            
            <div className="check-wrap">
              <svg className="bg-circle" viewBox="0 0 92 92" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="46" cy="46" r="46" fill="url(#greenGrad)" />
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="92" y2="92" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#2BB673" />
                    <stop offset="100%" stopColor="#1d9e5f" />
                  </linearGradient>
                </defs>
                <path className="checkmark-path" d="M28 47 L40 59 L64 34" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>

            <div className="s1-title">Order Placed Successfully</div>

            <div className="s1-coins">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="#FFD700" stroke="#FFA500" strokeWidth="1.5"/>
                <text x="12" y="16.5" fontSize="10" fontWeight="bold" fill="#b8860b" textAnchor="middle" fontFamily="Roboto">S</text>
              </svg>
              56 SuperCoins on the way
            </div>
          </div>
        </div>
      )}

      <div id="screen2" style={{ display: isScreen2Visible ? "block" : "none" }} className={isScreen2Visible ? "visible" : ""}>
        <div className="s2-top-card">
          <div className="s2-check-row">
            <div className="s2-check-icon-bg">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5L9.5 17L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="s2-heading">Thanks for shopping with us!</div>
              {orderId && <div className="s2-delivery-sub">Order ID: {orderId}</div>}
              <div className="s2-delivery-sub">Delivery by {dateString}</div>
              <div className="s2-supercoins">
                <span className="lightning">⚡</span>
                56 SuperCoins on the way
              </div>
            </div>
          </div>
        </div>

        <div className="s2-delivery-card">
          <div className="s2-date-bold">Delivery by {dateString}</div>
          <div className="divider"></div>
          <div className="s2-name" id="s2-name">
            <div dir="auto" className="css-146c3p1 r-1et8rh5 r-1b43r93 r-knv0ih" style={{ color: "rgb(17,17,18)", fontWeight: "normal" }}>
              {address ? (
                <>
                  {address.name && <strong>{address.name}<br/></strong>}
                  {address.address}<br/>
                  {address.locality && <>{address.locality}<br/></>}
                  {address.city ? `${address.city}, ${address.state} - ${address.pincode}` : ""}<br/>
                  {address.phone && <><strong>Phone:</strong> {address.phone}</>}
                </>
              ) : (
                <>
                  <strong>{address?.name || "User"}</strong><br/>
                  123 Main Street<br/>
                  Mumbai, Maharashtra - 400001<br/>
                  <strong>Phone:</strong> 9876543210
                </>
              )}
            </div>
          </div>
          <div className="divider"></div>
          <div className="otp-box">
            <div className="otp-title">
              <span>📦</span> Delivery requires an OTP
            </div>
            <div className="otp-text">
              We will open the package at your doorstep to check for damages or wrong product delivery. An OTP will be shared when the order is out for delivery.
            </div>
            <div style={{ height: "8px" }}></div>
            <div className="otp-text">Share the OTP with the agent to confirm open box delivery.</div>
          </div>
        </div>

        <div className="s2-spacer"></div>

        <button className="s2-bottom-btn" onClick={() => router.push("/")}>
          Continue Shopping
        </button>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="store-shell" style={{ height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Roboto', sans-serif" }}>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}