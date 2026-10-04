"use client";
import { useRouter, useSearchParams } from 'next/navigation';


import { useEffect, useState } from 'react'

import { CheckoutHeader } from '../../components/CheckoutHeader'
import { SaleBanner } from '../../components/SaleBanner'

const statesList = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];


function AddressPage() {
  const router = useRouter()
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [initialData] = useState(() => {
    try {
      const saved = sessionStorage.getItem('savedAddress');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [selectedState, setSelectedState] = useState(initialData.state || "Uttar Pradesh");

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const saved = {
      name: data.get('name') as string || 'User',
      tag: data.get('locationTypeTag') as string || 'HOME',
      address: data.get('address') as string || '',
      city: data.get('city') as string || '',
      state: selectedState,
      pincode: data.get('pincode') as string || '',
      locality: data.get('locality') as string || '',
      landmark: data.get('landmark') as string || '',
      altPhone: data.get('altPhone') as string || '',
      phone: data.get('phone') as string || '',
    };
    sessionStorage.setItem('savedAddress', JSON.stringify(saved));
    router.push('/order-summary');
  }

  const searchParams = Object.fromEntries(useSearchParams().entries());
  useEffect(() => {
    if (sessionStorage.getItem('savedAddress') && !searchParams.edit) {
      router.replace('/order-summary');
      return;
    }

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
    <div className="store-shell" style={{ overflow: "auto" }}>

      <style>{`
        /* Inheriting global body styles for fonts and background */
        *{cursor:pointer;-webkit-tap-highlight-color:transparent; box-sizing: border-box;}
        *:not(input):not(textarea):not(button){-webkit-touch-callout: none;-webkit-user-select: none;-moz-user-select: none;user-select: none;}
        
        #fk-cp-checkout { width: 100%; background: #fff; min-height: 100vh; }
        .RcJR_D { font-size: 16px; font-weight: 500; margin-left: 16px; color: #000;}
        
        ._3YEz5Y { padding: 16px 20px; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .full-width { grid-column: span 2; }
        
        ._3xNCye { position: relative; }
        ._3xNCye label {
            transition: all 0.2s ease;
            pointer-events: none;
            color: #878787;
            font-size: 14px;
            position: absolute;
            top: 16px;
            left: 14px;
            margin: 0;
            padding: 0;
            transform-origin: left top;
        }
        ._3xNCye input, ._3xNCye textarea, ._2Ck2Ek {
            width: 100%;
            background: #fff;
            border: 1px solid #d4d5d9;
            border-radius: 4px;
            outline: none !important;
            font-size: 14px;
            padding: 22px 14px 10px 14px !important;
            box-shadow: none !important;
            color: #212121;
        }
        ._3xNCye textarea { resize: none; height: 100px; }
        ._3xNCye.has-value label, ._3xNCye.is-focused label {
            transform: translateY(-8px) scale(0.8);
        }
        ._3xNCye.is-focused label { color: #2874f0; }
        ._3xNCye input:focus, ._3xNCye textarea:focus { border: 1px solid #2874f0; }
        ._3xNCye.is-focused ._2Ck2Ek { border: 1px solid #2874f0; }
        
        .address-type-label { font-size: 12px; color: #878787; margin-bottom: 12px; font-weight: 500; }
        .radio-group { display: flex; gap: 24px; margin-bottom: 32px; }
        .radio-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #212121; cursor: pointer; }
        .radio-label input[type="radio"] { width: 18px; height: 18px; cursor: pointer; accent-color: #2874f0; margin: 0; }
        
        .form-actions { display: flex; gap: 24px; align-items: center; width: 100%; }
        .btn-save { width: 100%; height: 46px; border-radius: 15px; font-size: 14.5px; font-weight: 700; cursor: pointer; border: none; background: #fbcd1e; color: #111; }
        .btn-save:hover { background: #f9f9f9; }
      `}</style>
      
      <div id="fk-cp-checkout">
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <div className="_21I5uf"><span className="_2aCGoL"></span></div>
            <div style={{ width: "100%" }}>
                <CheckoutHeader title="Add delivery address" activeStep={1} />
                <div style={{ width: "100%" }}>
                    <div>
                          <SaleBanner />
                        </div>
                    <div className="_3YEz5Y">
                        <form className="_1HKanm" method="post" id="addressform" onSubmit={handleSave}>
                            <div className="form-grid">
                                <div className="_3xNCye">
                                    <label htmlFor="name">Name</label>
                                    <input id="name" name="name" type="text" defaultValue={initialData.name || ""} />
                                </div>
                                <div className="_3xNCye">
                                    <label htmlFor="phone">10-digit mobile number</label>
                                    <input id="phone" name="phone" type="tel" defaultValue={initialData.phone || ""} />
                                </div>
                                <div className="_3xNCye">
                                    <label htmlFor="pincode">Pincode</label>
                                    <input id="pincode" name="pincode" type="number" defaultValue={initialData.pincode || ""} />
                                </div>
                                <div className="_3xNCye">
                                    <label htmlFor="locality">Locality</label>
                                    <input id="locality" name="locality" type="text" defaultValue={initialData.locality || ""} />
                                </div>
                                <div className="_3xNCye full-width">
                                    <label htmlFor="address">Address (Area and Street)</label>
                                    <textarea id="address" name="address" defaultValue={initialData.address || ""} />
                                </div>
                                <div className="_3xNCye">
                                    <label htmlFor="city">City/District/Town</label>
                                    <input id="city" name="city" type="text" defaultValue={initialData.city || ""} />
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
                                            <div style={{ position: "absolute", top: "100%", left: 0, width: "100%", maxHeight: "200px", overflowY: "auto", background: "white", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", border: "1px solid #e0e0e0" }}>
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
                                <div className="_3xNCye">
                                    <label htmlFor="altPhone">Alternate Phone (Optional)</label>
                                    <input id="altPhone" name="altPhone" type="tel" defaultValue={initialData.altPhone || ""} />
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

export default AddressPage;