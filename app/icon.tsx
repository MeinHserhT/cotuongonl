import { ImageResponse } from 'next/og';

export const size = {
  width: 64,
  height: 64,
};
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '15px',
          border: '2px solid #F59E0B',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '25px',
            background: 'radial-gradient(circle at 35% 30%, #EF4444 0%, #B91C1C 60%, #7F1D1D 100%)',
            border: '2.5px solid #FBBF24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 6px rgba(0,0,0,0.6)',
            color: '#FEF3C7',
            fontSize: '30px',
            fontWeight: 700,
            fontFamily: 'serif',
            lineHeight: 1,
          }}
        >
          帥
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
