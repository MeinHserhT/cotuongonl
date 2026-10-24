import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #161F30 0%, #0A0E17 100%)',
          borderRadius: '40px',
          border: '5px solid #F59E0B',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '142px',
            height: '142px',
            borderRadius: '71px',
            background: 'radial-gradient(circle at 35% 30%, #EF4444 0%, #B91C1C 60%, #7F1D1D 100%)',
            border: '6px solid #FBBF24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(0,0,0,0.65)',
          }}
        >
          <div
            style={{
              width: '118px',
              height: '118px',
              borderRadius: '59px',
              border: '2.5px solid rgba(254, 243, 199, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FEF3C7',
              fontSize: '78px',
              fontWeight: 700,
              fontFamily: 'serif',
              lineHeight: 1,
            }}
          >
            帥
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
