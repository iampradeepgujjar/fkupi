import { useState, useEffect } from 'react';

interface SaleBannerProps {
  durationMinutes?: number; // how many minutes to count down from (default 10)
}

export function SaleBanner({ durationMinutes = 10 }: SaleBannerProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const expired = secondsLeft === 0;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '8px 20px',
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: '0.03em',
      color: expired ? '#878787' : '#212121',
    }}>
      {/* Pulsing dot */}
      {!expired && (
        <span style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#22c55e',
          flexShrink: 0,
          animation: 'sale-pulse 1.2s ease-in-out infinite',
        }} />
      )}

      <span>{expired ? 'SALE ENDED' : 'SALE LIVE'}</span>

      {!expired && (
        <>
          <span style={{ opacity: 0.7 }}>•</span>
          <span>Ends in</span>
          {/* Timer */}
          <span style={{
            background: 'rgba(0,0,0,0.25)',
            borderRadius: 4,
            padding: '2px 7px',
            fontVariantNumeric: 'tabular-nums',
            fontSize: 13,
            letterSpacing: '0.05em',
          }}>
            {mins}:{secs}
          </span>
        </>
      )}

      <style>{`
        @keyframes sale-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}
