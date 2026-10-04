"use client";

import Link from 'next/link';
import { useSearchParams , useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'

import { CheckoutHeader } from '../../components/CheckoutHeader'
import { SaleBanner } from '../../components/SaleBanner'
import productsData from "../../data/products.json"




function OrderSummaryPage() {
  const router = useRouter()

  // Read saved address from sessionStorage
  const [addressData, setAddressData] = useState({
    name: 'User', tag: 'HOME', address: '', city: '', state: 'Uttar Pradesh', pincode: '', phone: ''
  })
  const [isQtyDropdownOpen, setIsQtyDropdownOpen] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const [cartProductIds, setCartProductIds] = useState<string[]>([]);

  const cartProducts = cartProductIds.map(id => productsData.find(p => p.id === id)).filter(Boolean) as typeof productsData;
  if (cartProducts.length === 0 && productsData.length > 0) cartProducts.push(productsData[0]);

  let currentMRP = 0;
  let currentTotal = 0;
  
  cartProducts.forEach(p => {
    const qty = quantities[p.id] || 1;
    currentMRP += (parseInt(p.oldPrice.replace(/[^\d]/g, ""), 10) || 0) * qty;
    currentTotal += (parseInt(p.newPrice.replace(/[^\d]/g, ""), 10) || 0) * qty;
  });
  
  const currentDiscount = currentMRP - currentTotal;

  const removeProduct = (id: string) => {
    const newIds = cartProductIds.filter(pid => pid !== id);
    setCartProductIds(newIds);
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        let cartItems = JSON.parse(savedCart);
        cartItems = cartItems.filter((i: any) => i.id !== id);
        localStorage.setItem('cart', JSON.stringify(cartItems));
        if (cartItems.length === 0) {
          router.push('/');
        }
      }
    } catch { }
  };

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('savedAddress')
      if (saved) setAddressData(JSON.parse(saved))
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (!parsed || parsed.length === 0) {
          router.push('/');
          return;
        }
        setCartProductIds(parsed.map((item: any) => item.id));
        const initialQtys: Record<string, number> = {};
        parsed.forEach((item: any) => { initialQtys[item.id] = 1; });
        setQuantities(initialQtys);
      } else {
        router.push('/');
      }
    } catch { 
      router.push('/');
    }
  }, [])

  return (
    <div className="store-shell" style={{ overflow: 'auto' }}>
      <style>{`
        .os-section { background: #fff; margin-bottom: 8px; }
        .os-divider { height: 8px; background: #f1f3f6; }
        .os-price-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; font-size: 14px; color: #212121; border-bottom: 1px solid #f0f0f0; }
        .os-price-row:last-child { border-bottom: none; }
        .os-price-label { color: #878787; }
        .os-total-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; font-size: 15px; font-weight: 700; color: #212121; }
        .os-savings { background: #e8f5e9; color: #388e3c; font-size: 13px; font-weight: 600; text-align: center; padding: 10px 16px; border-radius: 4px; margin-top: 4px; }
        .os-bottom-bar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: min(100%, 432px); background: #fff; border-top: 1px solid #e0e0e0; box-shadow: 0 -2px 8px rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: space-between; padding: 10px 16px 16px; gap: 16px; z-index: 10; }
        .os-continue-btn { flex-shrink: 0; width: 48%; height: 46px; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; border: none; background: #fbcd1e; color: #111; }
        .os-continue-btn:hover { background: #f5c200; }
        .tag-badge { display: inline-block; font-size: 10px; font-weight: 700; color: #878787; border: 1px solid #d4d5d9; border-radius: 2px; padding: 1px 5px; margin-left: 6px; letter-spacing: 0.04em; vertical-align: middle; }
        .qty-select { border: 1px solid #d4d5d9; border-radius: 4px; padding: 4px 8px; font-size: 13px; color: #212121; background: #fff; cursor: pointer; }
        .open-box-banner { background: #e8f0fe; border-radius: 4px; padding: 14px 16px; margin: 0 16px 0 16px; display: flex; gap: 12px; align-items: flex-start; }
      `}</style>

      <div style={{ paddingBottom: 80 }}>
        {/* Header */}
        <CheckoutHeader title="Order Summary" activeStep={2} />



        {/* Deliver To */}
        <div className="os-section" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: '#878787', fontWeight: 500 }}>Deliver to:</span>
            <button
              onClick={() => router.push('/address' + "?" + new URLSearchParams({ edit: true }).toString())}
              style={{ fontSize: 13, fontWeight: 600, color: '#2874f0', background: 'none', border: '1px solid #2874f0', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}
            >
              Change
            </button>
          </div>
          <div style={{ maxWidth: '70%' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#212121' }}>
              {addressData.name}
              <span className="tag-badge">{addressData.tag || 'HOME'}</span>
            </div>
            <div style={{ fontSize: 13, color: '#878787', marginTop: 2 }}>
              {[addressData.address, addressData.locality, addressData.city ? `${addressData.city}, ${addressData.state} - ${addressData.pincode}` : ''].filter(Boolean).join(', ')}
            </div>
            {addressData.phone && (
              <div style={{ fontSize: 13, color: '#878787', marginTop: 2 }}>
                {addressData.phone} {addressData.altPhone ? `, ${addressData.altPhone}` : ''}
              </div>
            )}
          </div>
        </div>

        <div className="os-divider" />

        <div style={{ background: '#fff', padding: '4px 0' }}>
          <SaleBanner />
        </div>

        <div className="os-divider" />

        {/* Products */}
        {cartProducts.map((product, idx) => (
          <div key={product.id} className="os-section" style={{ padding: '14px 16px', borderBottom: idx !== cartProducts.length - 1 ? '1px solid #f0f0f0' : 'none', marginBottom: idx !== cartProducts.length - 1 ? 0 : 8 }}>
            <Link href={{ pathname: "/product", query: { id: product.id } }} style={{ display: 'flex', gap: 12, textDecoration: 'none' }}>
              <img src={product.image} alt="product" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 4, border: '1px solid #f0f0f0', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#212121', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.title}
                </div>
                <div style={{ fontSize: 12, color: '#878787', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.highlights?.Brand ? `Brand: ${product.highlights.Brand}` : 'Flipkart Assured'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#388e3c' }}>{product.discount}</span>
                  <span style={{ fontSize: 13, color: '#878787', textDecoration: 'line-through' }}>₹{((parseInt(product.oldPrice.replace(/[^\d]/g, ""), 10) || 0) * (quantities[product.id] || 1)).toLocaleString('en-IN')}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#212121' }}>₹{((parseInt(product.newPrice.replace(/[^\d]/g, ""), 10) || 0) * (quantities[product.id] || 1)).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </Link>

            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#878787' }}>Qty:&nbsp;</span>
                  <div style={{ position: 'relative' }}>
                    <div 
                      className="qty-select" 
                      style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 48, justifyContent: 'space-between', userSelect: 'none' }}
                      onClick={() => setIsQtyDropdownOpen(isQtyDropdownOpen === product.id ? null : product.id)}
                    >
                      <span style={{ fontWeight: 500 }}>{quantities[product.id] || 1}</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                    {isQtyDropdownOpen === product.id && (
                      <>
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }} onClick={(e) => { e.stopPropagation(); setIsQtyDropdownOpen(null); }} />
                        <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, width: "100%", background: "white", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", border: "1px solid #e0e0e0", borderRadius: 4, overflow: 'hidden' }}>
                          {[1, 2, 3, 4, 5].map(n => (
                            <div key={n} style={{ padding: "6px 12px", cursor: "pointer", borderBottom: n !== 5 ? "1px solid #eee" : "none", color: quantities[product.id] === n ? "#2874f0" : "#333", backgroundColor: quantities[product.id] === n ? "#f0f5ff" : "white", fontSize: 13, textAlign: 'center' }} onClick={(e) => { e.stopPropagation(); setQuantities({ ...quantities, [product.id]: n }); setIsQtyDropdownOpen(null); }}>
                              {n}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => removeProduct(product.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#878787', fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: '4px 8px' }}
                >
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            </div>

            <div style={{ marginTop: 8, fontSize: 12, color: '#878787' }}>
              Delivery by <strong style={{ color: '#388e3c' }}>
                {new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', weekday: 'short' })}
              </strong>
            </div>
          </div>
        ))}

        <div className="os-divider" />

        {/* Open Box Banner */}
        <div style={{ background: '#fff' }}>
          <img src="/open-box-banner.png" alt="Rest assured with Open Box Delivery" style={{ width: '100%', display: 'block' }} />
        </div>

        <div className="os-divider" />

        {/* Price Details */}
        <div className="os-section" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#212121', marginBottom: 12 }}>Price Details</div>

          <div className="os-price-row">
            <span className="os-price-label" style={{ textDecoration: 'underline', textDecorationStyle: 'dashed', textUnderlineOffset: 3 }}>MRP (incl. of all taxes)</span>
            <span>₹{currentMRP.toLocaleString('en-IN')}</span>
          </div>
          <div className="os-price-row">
            <span className="os-price-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              Discounts
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#878787" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </span>
            <span style={{ color: '#388e3c', fontWeight: 600 }}>−₹{currentDiscount.toLocaleString('en-IN')}</span>
          </div>

          <div className="os-total-row">
            <span>Total Amount</span>
            <span>₹{currentTotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="os-savings">
            You will save ₹{currentDiscount.toLocaleString('en-IN')} on this order
          </div>
        </div>

        <div className="os-divider" />

        {/* Trust + Legal */}
        <div className="os-section" style={{ padding: '14px 16px', marginBottom: 10 }}>
          <div style={{ width: '60%', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/safe-payment-icon.png" alt="Safe payments" style={{ width: 36, height: 44, objectFit: 'contain', flexShrink: 0 }} />
              <div style={{ color: 'rgb(113, 116, 120)', fontSize: '12px', lineHeight: '18px', fontWeight: 600 }}>
                Safe and secure payments. Easy returns. 100% Authentic products.
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#878787', lineHeight: 1.7, marginTop: 12 }}>
            By continuing with the order, you confirm that you are above 18 years of age, and you agree to the{' '}
            <span style={{ color: '#2874f0', cursor: 'pointer' }}>Terms of Use</span> and{' '}
            <span style={{ color: '#2874f0', cursor: 'pointer' }}>Privacy Policy</span>
          </div>
        </div>
      </div>

      <div className="os-bottom-bar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 12, color: '#878787', textDecoration: 'line-through', lineHeight: 1 }}>
            ₹{currentMRP.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#212121', lineHeight: 1 }}>
            ₹{currentTotal.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 12, color: '#2874f0', fontWeight: 500, marginTop: 2, cursor: 'pointer' }}>
            View price details
          </div>
        </div>
        <button className="os-continue-btn" onClick={() => {
          sessionStorage.setItem('finalAmount', currentTotal.toString());
          router.push('/payment-page' + "?" + new URLSearchParams({ amt: currentTotal }).toString());
        }}>
          Continue
        </button>
      </div>
    </div>
  )
}

export default OrderSummaryPage;