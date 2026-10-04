"use client";
import { useRouter, useSearchParams } from 'next/navigation';


import { useState } from "react"
import { SaleBanner } from "../../components/SaleBanner"



function PaymentPage() {
  const router = useRouter();
  const searchParams = Object.fromEntries(useSearchParams().entries());
  const [selectedMethod, setSelectedMethod] = useState("phonepe");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  const finalAmt = searchParams.amt || sessionStorage.getItem("finalAmount") || (() => {
    try {
      const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
      return cartItems.reduce((acc: number, item: any) => acc + (item.price || 0), 0);
    } catch {
      return 0;
    }
  })();

  const handlePay = () => {
    if (selectedMethod === "qr_upi") {
      setShowQR(true);
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      router.push("/success");
    }, 2000);
  };

  return (
    <div className="store-shell" style={{ overflow: "auto", position: "relative" }}>
      <style>{`
        /* Custom styles */
        .cashback-glow {
            position: relative;
            display: inline-block;
            color: #15803d;
            font-weight: 800;
        }
        .cashback-glow::after {
            content: attr(data-text);
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-image: linear-gradient(120deg, transparent 0%, transparent 35%, rgba(255, 255, 255, 0.9) 50%, transparent 65%, transparent 100%);
            background-size: 200% 100%;
            -webkit-background-clip: text;
            color: transparent;
            animation: cashbackShine 2.5s infinite linear;
            pointer-events: none;
        }
        @keyframes cashbackShine {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        .pay-option {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.2s;
            background: white;
        }
        .pay-option.selected {
            background: #f0f9ff;
            border-color: #2874f0;
            box-shadow: 0 0 0 1px #2874f0;
        }
        .opt-left { display: flex; align-items: center; gap: 12px; }
        .opt-img { width: 30px; height: 30px; object-fit: contain; }
        .opt-name { font-size: 14px; font-weight: 600; color: #212121; display: block; }
        .opt-tag { font-size: 10px; font-weight: 700; color: #16a34a; background: #dcfce7; padding: 2px 6px; border-radius: 4px; margin-left: 6px; }
        .radio-circle { width: 18px; height: 18px; border: 2px solid #ccc; border-radius: 50%; position: relative; display: flex; align-items: center; justify-content: center; }
        .pay-option.selected .radio-circle { border-color: #2874f0; }
        .radio-dot { width: 10px; height: 10px; background: #2874f0; border-radius: 50%; display: none; }
        .pay-option.selected .radio-dot { display: block; }
        
        .footer-btn {
            background: #fb641b;
            color: white;
            border: none;
            width: 100%;
            padding: 14px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: 700;
            box-shadow: 0 2px 8px rgba(251, 100, 27, 0.4);
            cursor: pointer;
            transition: background 0.2s;
        }
      `}</style>

      <header>
          <div className="flex items-center justify-between bg-white px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                  <button className="p-1 text-gray-700" onClick={() => history.back()}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 12H5M12 19l-7-7 7-7"></path>
                      </svg>
                  </button>
                  <div className="flex flex-col leading-tight">
                      <span className="text-[11px] text-gray-500 font-medium tracking-wide uppercase">Step 3 of 3</span>
                      <span className="text-[17px] font-bold text-gray-900">Payments</span>
                  </div>
              </div>
              <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 rounded px-2 py-1 text-[11px] font-semibold text-blue-700">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  100% Secure
              </div>
          </div>
      </header>

      <section className="bg-white py-3 border-b border-gray-200 mt-2 shadow-sm">
          <div className="px-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                      <div className="text-[15px]">
                          <span className="cashback-glow" data-text="95% Cashback">95% Cashback</span>
                      </div>
                      <div className="text-[11px] font-medium text-green-700 mt-0.5">
                          Claim now with UPI payment offers
                      </div>
                  </div>
                  <div className="flex items-center gap-1">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm z-10">
                          <img className="w-[18px] h-[18px]" src="/assets/images/AXIS.svg" />
                      </span>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm -ml-3 z-0">
                          <img className="w-[18px] h-[18px]" src="/assets/images/SBI.svg" />
                      </span>
                  </div>
              </div>
          </div>
      </section>

      <section className="bg-white mt-2 pb-4 shadow-sm">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <img src="/assets/images/upi.svg" className="w-8" />
              <div>
                  <h3 className="font-bold text-[15px] text-gray-900">UPI</h3>
                  <p className="text-[12px] text-gray-500">Pay by any UPI app</p>
              </div>
          </div>

          <div className="p-4">
              <div className={`pay-option ${selectedMethod === "phonepe" ? "selected" : ""}`} onClick={() => setSelectedMethod("phonepe")}>
                  <div className="opt-left">
                      <img src="/assets/images/phonepe.svg" className="opt-img" />
                      <div>
                          <span className="opt-name">PhonePe</span>
                          <span className="opt-tag">Fastest</span>
                      </div>
                  </div>
                  <div className="radio-circle"><div className="radio-dot"></div></div>
              </div>

              <div className={`pay-option ${selectedMethod === "paytm" ? "selected" : ""}`} onClick={() => setSelectedMethod("paytm")}>
                  <div className="opt-left">
                      <img src="/assets/images/paytm_icon.svg" className="opt-img" />
                      <span className="opt-name">Paytm</span>
                  </div>
                  <div className="radio-circle"><div className="radio-dot"></div></div>
              </div>

              <div className={`pay-option ${selectedMethod === "qr_upi" ? "selected" : ""}`} onClick={() => setSelectedMethod("qr_upi")}>
                  <div className="opt-left">
                      <img src="/assets/images/qr.png" className="opt-img" />
                      <span className="opt-name">Scan QR Code</span>
                  </div>
                  <div className="radio-circle"><div className="radio-dot"></div></div>
              </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
            <SaleBanner />
          </div>
      </section>

      <div className="bg-white mt-2 shadow-sm divide-y divide-gray-100">
          <div className="flex items-start gap-4 px-4 py-4 opacity-50 grayscale pointer-events-none">
              <img className="w-6" src="/assets/images/card.svg" />
              <div className="flex-1">
                  <div className="flex justify-between items-center">
                      <h3 className="text-[14px] font-semibold text-gray-800">Credit / Debit / ATM Card</h3>
                      <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold tracking-wider">UNAVAILABLE</span>
                  </div>
              </div>
          </div>
          <div className="flex items-start gap-4 px-4 py-4 opacity-50 grayscale pointer-events-none">
              <img className="w-6" src="/assets/images/net-banking-08092023.svg" />
              <div className="flex-1">
                  <div className="flex justify-between items-center">
                      <h3 className="text-[14px] font-semibold text-gray-800">Net Banking</h3>
                      <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold tracking-wider">UNAVAILABLE</span>
                  </div>
              </div>
          </div>
          <div className="flex items-start gap-4 px-4 py-4 opacity-50 grayscale pointer-events-none">
              <img className="w-6" src="/assets/images/cash-icon.svg" />
              <div className="flex-1">
                  <div className="flex justify-between items-center">
                      <h3 className="text-[14px] font-semibold text-gray-800">Cash on Delivery</h3>
                      <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold tracking-wider">UNAVAILABLE</span>
                  </div>
              </div>
          </div>
      </div>

      <div className="h-24"></div>

      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 p-3 flex justify-between items-center shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40" style={{ maxWidth: "432px", left: "50%", transform: "translateX(-50%)" }}>
          <button className="footer-btn flex justify-center items-center gap-2" onClick={handlePay}>
              {selectedMethod === "qr_upi" ? "View QR Code" : `Pay ₹${Number(finalAmt).toLocaleString("en-IN")}`}
          </button>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-[85%] max-w-[340px] text-center">
            <div className="w-11 h-11 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Processing Payment...</h3>
            <p className="text-sm text-gray-500">Please do not close this page or press back button</p>
          </div>
        </div>
      )}

      {showQR && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl w-[85%] max-w-[340px] overflow-hidden text-center relative shadow-2xl">
            <div className="bg-blue-600 text-white p-4 flex items-center gap-4">
              <button onClick={() => setShowQR(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
              </button>
              <h3 className="font-semibold text-lg m-0">Scan & Pay</h3>
            </div>
            <div className="p-6 bg-blue-50/50">
              <img src="/assets/images/fk_logo.png" className="h-7 mx-auto mb-5 object-contain" />
              <div className="bg-white p-4 rounded-xl inline-block shadow-sm mb-4">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=fakeupi@ybl&pn=Flipkart&am=${finalAmt}`} alt="QR Code" width="180" height="180" />
              </div>
              <div className="font-bold text-[22px] text-blue-600 mb-3">₹{Number(finalAmt).toLocaleString("en-IN")}</div>
              <div className="flex justify-center gap-4 opacity-80">
                  <img src="/assets/images/phonepe.svg" width="28" />
                  <img src="/assets/images/paytm_icon.svg" width="28" />
                  <img src="/assets/images/bhim.png" width="28" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentPage;