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
          background: 'transparent',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '30px',
            background: '#5C3A21',
            border: '3px solid #C89D66',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FDF6E9',
            fontSize: '36px',
            fontWeight: 700,
            fontFamily: 'serif',
            lineHeight: 1,
          }}
        >
          將
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
