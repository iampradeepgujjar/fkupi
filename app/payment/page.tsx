"use client";

import '../../lib/polyfill-self';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { SaleBanner } from "../../components/SaleBanner";
import { createPaymentUri, buildAppLink, detectPlatform, generateQRCode } from 'upi-intents';

function PaymentContent() {
  const router = useRouter();
  useEffect(() => {
    document.title = "Payment";
  }, []);

  const searchParams = Object.fromEntries(useSearchParams().entries());
  const [activeAccordion, setActiveAccordion] = useState<"upi" | "cod">("upi");
  const [selectedMethod, setSelectedMethod] = useState("phonepe");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [processingTimeLeft, setProcessingTimeLeft] = useState(15);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const finalAmt = searchParams.amt || (typeof window !== "undefined" ? sessionStorage.getItem("finalAmount") : null) || (() => {
    try {
      if (typeof window === "undefined") return 0;
      const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
      return cartItems.reduce((acc: number, item: any) => acc + (item.price || 0), 0);
    } catch {
      return 0;
    }
  })();

  const isCod = activeAccordion === "cod";
  const payableAmount = isCod ? 59 : Number(finalAmt);

  const activeAppMethod = isCod
    ? (selectedMethod === "cod_paytm" ? "paytm" : selectedMethod === "cod_qr" ? "qr_upi" : "phonepe")
    : (selectedMethod.startsWith("cod") ? "phonepe" : selectedMethod);

  const upiUri = useMemo(() => {
    try {
      const amtStr = payableAmount > 0 ? payableAmount.toFixed(2) : "59.00";
      const note = isCod ? "Shipping charge for COD order" : "Payment for goods";
      return createPaymentUri(
        "paytm.s27ww6s@pty",
        "online store",
        amtStr,
        note
      );
    } catch (e) {
      return `upi://pay?pa=paytm.s27ww6s@pty&pn=online%20store&am=${payableAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(isCod ? "Shipping charge for COD order" : "Payment for goods")}`;
    }
  }, [payableAmount, isCod]);

  // Generate QR Code image whenever upiUri changes
  useEffect(() => {
    if (!upiUri) return;
    try {
      if (typeof window !== "undefined") {
        const qrResult = generateQRCode(upiUri, {
          size: 180,
          errorCorrectionLevel: "M",
          foregroundColor: "#000000",
          backgroundColor: "#ffffff",
        });
        if (qrResult?.dataUrl) {
          setQrCodeDataUrl(qrResult.dataUrl);
          return;
        }
      }
    } catch (err) {
      console.warn("generateQRCode error, fallback to server API:", err);
    }
    setQrCodeDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUri)}`);
  }, [upiUri]);

  // Start 15s timer to success, resetting after every click
  const startSuccessTimer = () => {
    setIsProcessing(true);
    lastActivityRef.current = Date.now();
    setProcessingTimeLeft(15);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    timerRef.current = setTimeout(() => {
      router.push("/success");
    }, 15000);

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, 15 - elapsed);
      setProcessingTimeLeft(remaining);
      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 500);
  };

  const resetSuccessTimer = () => {
    lastActivityRef.current = Date.now();
    setProcessingTimeLeft(15);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      router.push("/success");
    }, 15000);
  };

  // Reset timer on every click during processing
  useEffect(() => {
    const handleGlobalClick = () => {
      if (isProcessing) {
        resetSuccessTimer();
      }
    };

    window.addEventListener("click", handleGlobalClick, true);
    window.addEventListener("touchstart", handleGlobalClick, true);

    return () => {
      window.removeEventListener("click", handleGlobalClick, true);
      window.removeEventListener("touchstart", handleGlobalClick, true);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isProcessing]);

  const handlePay = () => {
    if (activeAppMethod === "qr_upi") {
      setShowQR(true);
      return;
    }

    try {
      const platform = detectPlatform();
      const link = buildAppLink({
        appId: activeAppMethod,
        upiUri,
        platform,
      });

      if (link && link.url) {
        window.location.href = link.url;
      }
    } catch (err) {
      console.warn("UPI intent error:", err);
    }

    startSuccessTimer();
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
        .cod-sub-option {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 11px 14px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s;
            background: white;
        }
        .cod-sub-option.selected {
            background: #f0fdf4;
            border-color: #16a34a;
            box-shadow: 0 0 0 1px #16a34a;
        }
        .cod-sub-option.selected .radio-circle {
            border-color: #16a34a;
        }
        .cod-sub-option.selected .radio-dot {
            background: #16a34a;
            display: block;
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
                <img className="w-[18px] h-[18px]" src="/assets/images/AXIS.svg" alt="Axis Bank" />
              </span>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-100 shadow-sm -ml-3 z-0">
                <img className="w-[18px] h-[18px]" src="/assets/images/SBI.svg" alt="SBI" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion Item 1: UPI Section (Default Open) */}
      <section className="bg-white mt-2 shadow-sm overflow-hidden">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
          onClick={() => {
            setActiveAccordion("upi");
            if (selectedMethod.startsWith("cod")) {
              setSelectedMethod("phonepe");
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className="radio-circle" style={{ borderColor: activeAccordion === "upi" ? "#2874f0" : "#ccc" }}>
              <div className="radio-dot" style={{ display: activeAccordion === "upi" ? "block" : "none" }}></div>
            </div>
            <img src="/assets/images/upi.svg" className="w-8" alt="UPI" />
            <div>
              <h3 className="font-bold text-[15px] text-gray-900">UPI</h3>
              <p className="text-[12px] text-gray-500">Pay by any UPI app</p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${activeAccordion === "upi" ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>

        {activeAccordion === "upi" && (
          <div className="p-4 border-t border-gray-100">
            <div className={`pay-option ${selectedMethod === "phonepe" ? "selected" : ""}`} onClick={() => setSelectedMethod("phonepe")}>
              <div className="opt-left">
                <img src="/assets/images/phonepe.svg" className="opt-img" alt="PhonePe" />
                <div>
                  <span className="opt-name">PhonePe</span>
                  <span className="opt-tag">Fastest</span>
                </div>
              </div>
              <div className="radio-circle"><div className="radio-dot"></div></div>
            </div>

            <div className={`pay-option ${selectedMethod === "paytm" ? "selected" : ""}`} onClick={() => setSelectedMethod("paytm")}>
              <div className="opt-left">
                <img src="/assets/images/paytm_icon.svg" className="opt-img" alt="Paytm" />
                <span className="opt-name">Paytm</span>
              </div>
              <div className="radio-circle"><div className="radio-dot"></div></div>
            </div>

            <div className={`pay-option ${selectedMethod === "qr_upi" ? "selected" : ""}`} onClick={() => setSelectedMethod("qr_upi")}>
              <div className="opt-left">
                <img src="/assets/images/qr.png" className="opt-img" alt="QR" />
                <span className="opt-name">Scan QR Code</span>
              </div>
              <div className="radio-circle"><div className="radio-dot"></div></div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "12px", marginBottom: "4px" }}>
              <SaleBanner />
            </div>
          </div>
        )}
      </section>

      {/* Accordion Item 2: Cash on Delivery Section (One Open One Closed) */}
      <section className="bg-white mt-2 shadow-sm overflow-hidden">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
          onClick={() => {
            setActiveAccordion("cod");
            if (!selectedMethod.startsWith("cod")) {
              setSelectedMethod("cod_phonepe");
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className="radio-circle" style={{ borderColor: activeAccordion === "cod" ? "#2874f0" : "#ccc" }}>
              <div className="radio-dot" style={{ display: activeAccordion === "cod" ? "block" : "none" }}></div>
            </div>
            <img src="/assets/images/cash-icon.svg" className="w-7 h-7 object-contain" alt="Cash on Delivery" />
            <div>
              <h3 className="font-bold text-[15px] text-gray-900">Cash on Delivery</h3>
              <p className="text-[12px] text-gray-500">Pay ₹59 advance shipping charge</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">
              ₹59 Advance
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${activeAccordion === "cod" ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {activeAccordion === "cod" && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/30">
            <div
              className={`cod-sub-option ${selectedMethod === "cod_phonepe" ? "selected" : ""}`}
              onClick={() => setSelectedMethod("cod_phonepe")}
            >
              <div className="opt-left">
                <img src="/assets/images/phonepe.svg" className="w-5 h-5 object-contain" alt="PhonePe" />
                <div>
                  <span className="opt-name text-[13px]">PhonePe</span>
                  <span className="text-[11px] text-gray-500">Pay ₹59</span>
                </div>
              </div>
              <div className="radio-circle"><div className="radio-dot"></div></div>
            </div>

            <div
              className={`cod-sub-option ${selectedMethod === "cod_paytm" ? "selected" : ""}`}
              onClick={() => setSelectedMethod("cod_paytm")}
            >
              <div className="opt-left">
                <img src="/assets/images/paytm_icon.svg" className="w-5 h-5 object-contain" alt="Paytm" />
                <div>
                  <span className="opt-name text-[13px]">Paytm</span>
                  <span className="text-[11px] text-gray-500">Pay ₹59</span>
                </div>
              </div>
              <div className="radio-circle"><div className="radio-dot"></div></div>
            </div>

            <div
              className={`cod-sub-option ${selectedMethod === "cod_qr" ? "selected" : ""}`}
              onClick={() => setSelectedMethod("cod_qr")}
            >
              <div className="opt-left">
                <img src="/assets/images/qr.png" className="w-5 h-5 object-contain" alt="QR" />
                <div>
                  <span className="opt-name text-[13px]">Scan QR Code</span>
                  <span className="text-[11px] text-gray-500">Pay ₹59</span>
                </div>
              </div>
              <div className="radio-circle"><div className="radio-dot"></div></div>
            </div>

            <div className="text-[11px] text-gray-500 mt-2 bg-white p-2.5 rounded border border-gray-200">
              ℹ️ Balance ₹{Number(finalAmt).toLocaleString("en-IN")} will be collected in cash at the time of delivery.
            </div>
          </div>
        )}
      </section>

      {/* Unavailable payment options */}
      <div className="bg-white mt-2 shadow-sm divide-y divide-gray-100">
        <div className="flex items-start gap-4 px-4 py-4 opacity-50 grayscale pointer-events-none">
          <img className="w-6" src="/assets/images/card.svg" alt="Card" />
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h3 className="text-[14px] font-semibold text-gray-800">Credit / Debit / ATM Card</h3>
              <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold tracking-wider">UNAVAILABLE</span>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-4 px-4 py-4 opacity-50 grayscale pointer-events-none">
          <img className="w-6" src="/assets/images/net-banking-08092023.svg" alt="Net Banking" />
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h3 className="text-[14px] font-semibold text-gray-800">Net Banking</h3>
              <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold tracking-wider">UNAVAILABLE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-24"></div>

      {/* Fixed bottom payment bar */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 p-3 flex justify-between items-center shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40" style={{ maxWidth: "432px", left: "50%", transform: "translateX(-50%)" }}>
        <button className="footer-btn flex justify-center items-center gap-2" onClick={handlePay}>
          {activeAppMethod === "qr_upi"
            ? (isCod ? "View QR Code (₹59)" : "View QR Code")
            : (isCod ? "Pay ₹59 Shipping Charge" : `Pay ₹${Number(finalAmt).toLocaleString("en-IN")}`)}
        </button>
      </div>

      {/* Processing Payment Overlay */}
      {isProcessing && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm cursor-pointer"
          onClick={resetSuccessTimer}
        >
          <div className="bg-white p-6 rounded-xl w-[85%] max-w-[340px] text-center shadow-2xl">
            <div className="w-11 h-11 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Processing Payment...</h3>
            <p className="text-sm text-gray-500">Please do not close this page or press back button</p>
          </div>
        </div>
      )}

      {/* QR Code Modal (Scan & Pay) */}
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
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">online store</div>
              {isCod && (
                <div className="text-xs font-bold text-orange-700 bg-orange-100/90 px-3 py-1 rounded-md inline-block mb-3 border border-orange-200">
                  COD Shipping Charge: ₹59
                </div>
              )}
              <div className="bg-white p-4 rounded-xl inline-block shadow-sm mb-4">
                <img
                  src={qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUri)}`}
                  alt="QR Code"
                  width="180"
                  height="180"
                />
              </div>
              <div className="font-bold text-[22px] text-blue-600 mb-3">₹{payableAmount.toLocaleString("en-IN")}</div>
              <div className="flex justify-center gap-4 opacity-80 mb-4">
                <img src="/assets/images/phonepe.svg" width="28" alt="PhonePe" />
                <img src="/assets/images/paytm_icon.svg" width="28" alt="Paytm" />
                <img src="/assets/images/bhim.png" width="28" alt="BHIM" />
              </div>
              <button
                onClick={() => {
                  setShowQR(false);
                  startSuccessTimer();
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm shadow transition"
              >
                Payment Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="store-shell" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}