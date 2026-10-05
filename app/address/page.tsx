"use client";
import { useRouter } from 'next/navigation';


import { useEffect, useState, Suspense } from 'react'

import { CheckoutHeader } from '../../components/CheckoutHeader'
import { SaleBanner } from '../../components/SaleBanner'

const statesList = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];


function AddressContent() {
  const router = useRouter()
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [initialData] = useState(() => {
    try {
      const saved = sessionStorage.getItem('savedAddress') || localStorage.getItem('savedAddress');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [selectedState, setSelectedState] = useState(initialData.state || "Uttar Pradesh");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const name = (data.get('name') as string || '').trim();
    const phone = (data.get('phone') as string || '').trim();
    const pincode = (data.get('pincode') as string || '').trim();
    const locality = (data.get('locality') as string || '').trim();
    const address = (data.get('address') as string || '').trim();
    const city = (data.get('city') as string || '').trim();
    const landmark = (data.get('landmark') as string || '').trim();
    const altPhone = (data.get('altPhone') as string || '').trim();
    const tag = (data.get('locationTypeTag') as string || 'HOME');

    const newErrors: Record<string, string> = {};

    if (!name) {
      newErrors.name = "Name is required";
    }

    if (!phone) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Must be 10 digits";
    }

    if (!pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(pincode)) {
      newErrors.pincode = "Must be 6 digits";
    }

    if (!address) {
      newErrors.address = "Address is required";
    }

    if (!city) {
      newErrors.city = "City is required";
    }

    if (altPhone && !/^\d{10}$/.test(altPhone)) {
      newErrors.altPhone = "Must be 10 digits";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstKey = Object.keys(newErrors)[0];
      const el = form.querySelector(`[name="${firstKey}"]`) as HTMLElement;
      if (el) el.focus();
      return;
    }

    setErrors({});

    const saved = {
      name,
      tag,
      address,
      city,
      state: selectedState,
      pincode,
      locality,
      landmark,
      altPhone,
      phone,
    };
    const savedString = JSON.stringify(saved);
    try {
      sessionStorage.setItem('savedAddress', savedString);
      localStorage.setItem('savedAddress', savedString);
    } catch (err) {}
    router.push('/order-summary');
  }

  useEffect(() => {
    document.title = "Address";
    try {
      const existing = sessionStorage.getItem('savedAddress') || localStorage.getItem('savedAddress');
      if (existing) {
        sessionStorage.setItem('savedAddress', existing);
        const parsed = JSON.parse(existing);
        if (parsed.state) setSelectedState(parsed.state);

        const form = document.getElementById('addressform') as HTMLFormElement | null;
        if (form) {
          const fields = ['name', 'phone', 'pincode', 'locality', 'address', 'city', 'landmark', 'altPhone'];
          fields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
            if (input && parsed[field] !== undefined && parsed[field] !== null && parsed[field] !== '') {
              input.value = parsed[field];
              input.closest('._3xNCye')?.classList.add('has-value');
            }
          });
          if (parsed.tag) {
            const radio = form.querySelector(`input[name="locationTypeTag"][value="${parsed.tag}"]`) as HTMLInputElement | null;
            if (radio) radio.checked = true;
          }
        }
      }
    } catch (err) {}

    const inputs = document.querySelectorAll("input[type='text'], input[type='tel'], input[type='number'], textarea, select") as NodeListOf<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

    function checkValue(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.value.trim() !== '') {
            target.closest('._3xNCye')?.classList.add('has-value');
        } else {
            target.closest('._3xNCye')?.classList.remove('has-value');
        }
    }

    inputs.forEach(input => {
        if (input.value.trim() !== '') {
            input.closest('._3xNCye')?.classList.add('has-value');
        }
        input.addEventListener('input', checkValue);
        input.addEventListener('focus', function(e) {
            (e.target as HTMLElement).closest('._3xNCye')?.classList.add('is-focused');
        });
        input.addEventListener('blur', function(e) {
            (e.target as HTMLElement).closest('._3xNCye')?.classList.remove('is-focused');
            checkValue(e);
        });
    });
  }, []);

  return (
    <div className="store-shell" style={{ height: "100%", maxHeight: "100dvh", paddingBottom: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>

      <style>{`
        /* Inheriting global body styles for fonts and background */
        *{cursor:pointer;-webkit-tap-highlight-color:transparent; box-sizing: border-box;}
        *:not(input):not(textarea):not(button){-webkit-touch-callout: none;-webkit-user-select: none;-moz-user-select: none;user-select: none;}
        
        html, body {
          height: 100% !important;
          height: 100vh !important;
          height: 100dvh !important;
          max-height: 100dvh !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .store-shell {
          width: min(100%, 432px);
          height: 100% !important;
          height: 100vh !important;
          height: 100dvh !important;
          max-height: 100dvh !important;
          min-height: unset !important;
          margin: 0 auto;
          padding-bottom: 0 !important;
          background: #fff;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
        }

        #fk-cp-checkout {
          width: 100%;
          height: 100%;
          max-height: 100%;
          background: #fff;
          min-height: unset !important;
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        .RcJR_D { font-size: 16px; font-weight: 500; margin-left: 16px; color: #000;}
        
        ._3YEz5Y {
          padding: 12px 18px 14px;
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          scrollbar-width: none;
        }
        ._3YEz5Y::-webkit-scrollbar {
          display: none;
        }

        ._1HKanm {
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: space-between;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        .full-width { grid-column: span 2; }
        
        ._3xNCye { position: relative; }
        ._3xNCye label {
            transition: all 0.2s ease;
            pointer-events: none;
            color: #878787;
            font-size: 14px;
            position: absolute;
            top: 14px;
            left: 14px;
            margin: 0;
            padding: 0;
            transform-origin: left top;
            z-index: 1;
        }
        ._3xNCye input, ._2Ck2Ek {
            width: 100%;
            height: 48px;
            background: #fff;
            border: 1px solid #d4d5d9;
            border-radius: 4px;
            outline: none !important;
            font-size: 14px;
            padding: 18px 14px 6px 14px !important;
            box-shadow: none !important;
            color: #212121;
        }
        ._3xNCye textarea {
            width: 100%;
            height: 68px;
            background: #fff;
            border: 1px solid #d4d5d9;
            border-radius: 4px;
            outline: none !important;
            font-size: 14px;
            padding: 18px 14px 6px 14px !important;
            box-shadow: none !important;
            color: #212121;
            resize: none;
        }
        ._3xNCye.has-value label, ._3xNCye.is-focused label {
            transform: translateY(-8px) scale(0.78);
        }
        ._3xNCye.is-focused label { color: #2874f0; }
        ._3xNCye input:focus, ._3xNCye textarea:focus { border: 1px solid #2874f0; }
        ._3xNCye.is-focused ._2Ck2Ek { border: 1px solid #2874f0; }

        ._3xNCye.has-error input,
        ._3xNCye.has-error textarea,
        ._3xNCye.has-error ._2Ck2Ek {
            border: 1px solid #d32f2f !important;
            background: #fffafa;
        }
        ._3xNCye.has-error label {
            color: #d32f2f !important;
        }
        .field-error {
            font-size: 11px;
            color: #d32f2f;
            font-weight: 500;
            margin-top: 2px;
            padding-left: 2px;
            line-height: 1.1;
        }
        
        .address-type-label { font-size: 12px; color: #878787; margin-bottom: 6px; font-weight: 500; }
        .radio-group { display: flex; gap: 24px; margin-bottom: 14px; }
        .radio-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #212121; cursor: pointer; }
        .radio-label input[type="radio"] { width: 18px; height: 18px; cursor: pointer; accent-color: #2874f0; margin: 0; }
        
        .form-actions { display: flex; gap: 24px; align-items: center; width: 100%; margin-top: auto; padding-top: 4px; }
        .btn-save { width: 100%; height: 46px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; border: none; background: #fbcd1e; color: #111; }
        .btn-save:hover { background: #f3c316; }
      `}</style>
      
      <div id="fk-cp-checkout">
        <div style={{ display: "flex", justifyContent: "center", width: "100%", height: "100%", flex: 1, flexDirection: "column" }}>
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                <CheckoutHeader title="Add delivery address" activeStep={1} />
                <div style={{ width: "100%", display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    <div>
                          <SaleBanner />
                    </div>
                    <div className="_3YEz5Y">
                        <form className="_1HKanm" method="post" id="addressform" onSubmit={handleSave} noValidate>
                            <div className="form-grid">
                                <div className={`_3xNCye ${errors.name ? 'has-error' : ''}`}>
                                    <label htmlFor="name">Name *</label>
                                    <input
                                      id="name"
                                      name="name"
                                      type="text"
                                      defaultValue={initialData.name || ""}
                                      onInput={(e) => {
                                        if (errors.name && e.currentTarget.value.trim()) {
                                          setErrors(prev => ({ ...prev, name: '' }));
                                        }
                                      }}
                                    />
                                    {errors.name && <div className="field-error">{errors.name}</div>}
                                </div>
                                <div className={`_3xNCye ${errors.phone ? 'has-error' : ''}`}>
                                    <label htmlFor="phone">10-digit mobile number *</label>
                                    <input
                                      id="phone"
                                      name="phone"
                                      type="tel"
                                      inputMode="numeric"
                                      maxLength={10}
                                      defaultValue={initialData.phone || ""}
                                      onInput={(e) => {
                                        e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
                                        if (errors.phone && e.currentTarget.value.length === 10) {
                                          setErrors(prev => ({ ...prev, phone: '' }));
                                        }
                                      }}
                                      onBlur={(e) => {
                                        const val = e.currentTarget.value.trim();
                                        if (val && !/^\d{10}$/.test(val)) {
                                          setErrors(prev => ({ ...prev, phone: "Must be 10 digits" }));
                                        }
                                      }}
                                    />
                                    {errors.phone && <div className="field-error">{errors.phone}</div>}
                                </div>
                                <div className={`_3xNCye ${errors.pincode ? 'has-error' : ''}`}>
                                    <label htmlFor="pincode">Pincode *</label>
                                    <input
                                      id="pincode"
                                      name="pincode"
                                      type="text"
                                      inputMode="numeric"
                                      maxLength={6}
                                      defaultValue={initialData.pincode || ""}
                                      onInput={(e) => {
                                        e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 6);
                                        if (errors.pincode && e.currentTarget.value.length === 6) {
                                          setErrors(prev => ({ ...prev, pincode: '' }));
                                        }
                                      }}
                                      onBlur={(e) => {
                                        const val = e.currentTarget.value.trim();
                                        if (val && !/^\d{6}$/.test(val)) {
                                          setErrors(prev => ({ ...prev, pincode: "Must be 6 digits" }));
                                        }
                                      }}
                                    />
                                    {errors.pincode && <div className="field-error">{errors.pincode}</div>}
                                </div>
                                <div className="_3xNCye">
                                    <label htmlFor="locality">Locality</label>
                                    <input id="locality" name="locality" type="text" defaultValue={initialData.locality || ""} />
                                </div>
                                <div className={`_3xNCye full-width ${errors.address ? 'has-error' : ''}`}>
                                    <label htmlFor="address">Address (Area and Street) *</label>
                                    <textarea
                                      id="address"
                                      name="address"
                                      defaultValue={initialData.address || ""}
                                      onInput={(e) => {
                                        if (errors.address && e.currentTarget.value.trim()) {
                                          setErrors(prev => ({ ...prev, address: '' }));
                                        }
                                      }}
                                    />
                                    {errors.address && <div className="field-error">{errors.address}</div>}
                                </div>
                                <div className={`_3xNCye ${errors.city ? 'has-error' : ''}`}>
                                    <label htmlFor="city">City/District/Town *</label>
                                    <input
                                      id="city"
                                      name="city"
                                      type="text"
                                      defaultValue={initialData.city || ""}
                                      onInput={(e) => {
                                        if (errors.city && e.currentTarget.value.trim()) {
                                          setErrors(prev => ({ ...prev, city: '' }));
                                        }
                                      }}
                                    />
                                    {errors.city && <div className="field-error">{errors.city}</div>}
                                </div>
                                <div className="_3xNCye has-value">
                                    <label htmlFor="state">State</label>
                                    <div className="_2Ck2Ek" onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)} style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        {selectedState}
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                    </div>
                                    <input type="hidden" name="state" id="state" value={selectedState} />
                                    {isStateDropdownOpen && (
                                        <>
                                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }} onClick={(e) => { e.stopPropagation(); setIsStateDropdownOpen(false); }} />
                                            <div style={{ position: "absolute", top: "100%", left: 0, width: "100%", maxHeight: "180px", overflowY: "auto", background: "white", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", border: "1px solid #e0e0e0" }}>
                                                {statesList.map(stateName => (
                                                    <div key={stateName} style={{ padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #eee", color: selectedState === stateName ? "#2874f0" : "#333", backgroundColor: selectedState === stateName ? "#f0f5ff" : "white" }} onClick={(e) => { e.stopPropagation(); setSelectedState(stateName); setIsStateDropdownOpen(false); }}>
                                                        {stateName}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="_3xNCye">
                                    <label htmlFor="landmark">Landmark (Optional)</label>
                                    <input id="landmark" name="landmark" type="text" defaultValue={initialData.landmark || ""} />
                                </div>
                                <div className={`_3xNCye ${errors.altPhone ? 'has-error' : ''}`}>
                                    <label htmlFor="altPhone">Alternate Phone (Optional)</label>
                                    <input
                                      id="altPhone"
                                      name="altPhone"
                                      type="tel"
                                      inputMode="numeric"
                                      maxLength={10}
                                      defaultValue={initialData.altPhone || ""}
                                      onInput={(e) => {
                                        e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
                                        if (errors.altPhone && (!e.currentTarget.value || e.currentTarget.value.length === 10)) {
                                          setErrors(prev => ({ ...prev, altPhone: '' }));
                                        }
                                      }}
                                      onBlur={(e) => {
                                        const val = e.currentTarget.value.trim();
                                        if (val && !/^\d{10}$/.test(val)) {
                                          setErrors(prev => ({ ...prev, altPhone: "Must be 10 digits" }));
                                        }
                                      }}
                                    />
                                    {errors.altPhone && <div className="field-error">{errors.altPhone}</div>}
                                </div>
                            </div>
                            
                            <div className="address-type-label">Address Type</div>
                            <div className="radio-group">
                                <label className="radio-label">
                                    <input type="radio" name="locationTypeTag" value="HOME" defaultChecked={!initialData.tag || initialData.tag === 'HOME'} /> Home
                                </label>
                                <label className="radio-label">
                                    <input type="radio" name="locationTypeTag" value="WORK" defaultChecked={initialData.tag === 'WORK'} /> Work
                                </label>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-save">SAVE</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div></div>
        </div>
      </div>
    </div>
  )
}

export default function AddressPage() {
  return (
    <Suspense fallback={<div className="store-shell" style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <AddressContent />
    </Suspense>
  );
}