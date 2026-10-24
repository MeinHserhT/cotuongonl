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
          background: '#5C3A21',
          borderRadius: '90px',
          border: '8px solid #C89D66',
          color: '#FDF6E9',
          fontSize: '104px',
          fontWeight: 700,
          fontFamily: 'serif',
          lineHeight: 1,
        }}
      >
        將
      </div>
    ),
    {
      ...size,
    }
  );
}
