import React from 'react';

interface CheckoutHeaderProps {
  title: string;
  activeStep: 1 | 2 | 3;
}

const ACTIVE_SIZE = 30;
const DONE_SIZE = 24;
const INACTIVE_SIZE = 24;

function StepCircle({ step, activeStep }: { step: number; activeStep: number }) {
  const isActive = activeStep === step;
  const isDone = activeStep > step;
  const size = isActive ? ACTIVE_SIZE : isDone ? DONE_SIZE : INACTIVE_SIZE;

  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...(isActive
      ? { background: '#2874f0', border: 'none' }
      : isDone
      ? { background: '#fff', border: '1.5px solid #2874f0' }
      : { background: '#fff', border: '1.5px solid #c2c2c2' }),
  };

  return (
    <div style={style}>
      {isDone ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2874f0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <span style={{ fontSize: isActive ? 14 : 13, fontWeight: 600, color: isActive ? '#fff' : '#c2c2c2', lineHeight: 1 }}>
          {step}
        </span>
      )}
    </div>
  );
}

export function CheckoutHeader({ title, activeStep }: CheckoutHeaderProps) {
  const s1 = activeStep === 1 ? ACTIVE_SIZE : activeStep > 1 ? DONE_SIZE : INACTIVE_SIZE;
  const s2 = activeStep === 2 ? ACTIVE_SIZE : activeStep > 2 ? DONE_SIZE : INACTIVE_SIZE;
  const s3 = activeStep === 3 ? ACTIVE_SIZE : INACTIVE_SIZE;

  const line1Color = activeStep > 1 ? '#2874f0' : '#e0e0e0';
  const line2Color = activeStep > 2 ? '#2874f0' : '#e0e0e0';

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px' }}>
        <a href="/product" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, textDecoration: 'none', marginRight: 12, flexShrink: 0 }}>
          <svg width="22" height="22" fill="none" viewBox="0 0 32 32">
            <path d="M27 16H5M14 7l-9 9 9 9" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <div style={{ fontSize: 17, fontWeight: 500, color: '#212121' }}>{title}</div>
      </div>

      {/* Progress Tracker */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 14px 0', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', maxWidth: 320 }}>

        {/* Step 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <StepCircle step={1} activeStep={activeStep} />
          <div style={{ marginTop: 6, fontSize: 13, fontWeight: activeStep === 1 ? 600 : 400, color: activeStep === 1 ? '#212121' : '#878787', whiteSpace: 'nowrap' }}>
            Address
          </div>
        </div>

        {/* Line 1 */}
        <div style={{ flex: 1, height: 2, background: line1Color, alignSelf: 'flex-start', marginTop: s1 / 2 + 2, marginLeft: 4, marginRight: 4 }} />

        {/* Step 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <StepCircle step={2} activeStep={activeStep} />
          <div style={{ marginTop: 6, fontSize: 13, fontWeight: activeStep === 2 ? 600 : 400, color: activeStep === 2 ? '#212121' : '#878787', whiteSpace: 'nowrap' }}>
            Order Summary
          </div>
        </div>

        {/* Line 2 */}
        <div style={{ flex: 1, height: 2, background: line2Color, alignSelf: 'flex-start', marginTop: s2 / 2 + 2, marginLeft: 4, marginRight: 4 }} />

        {/* Step 3 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <StepCircle step={3} activeStep={activeStep} />
          <div style={{ marginTop: 6, fontSize: 13, fontWeight: activeStep === 3 ? 600 : 400, color: activeStep === 3 ? '#212121' : '#878787', whiteSpace: 'nowrap' }}>
            Payment
          </div>
        </div>

      </div>
      </div>
    </div>
  );
}
