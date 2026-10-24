import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cờ Tướng - Xiangqi Master',
    short_name: 'Cờ Tướng Master',
    description:
      'Chơi Cờ Tướng, Cờ Úp online miễn phí phong cách Ziga. Đấu cờ tướng trực tuyến xếp hạng Elo, đấu với máy AI Kiện Tướng, tạo phòng chơi cờ cùng bạn bè.',
    start_url: '/',
    display: 'standalone',
    background_color: '#120E0A',
    theme_color: '#120E0A',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
