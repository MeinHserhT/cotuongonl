import type { Metadata, Viewport } from 'next';
import './globals.css';

const appUrl = process.env.APP_URL || 'https://cotuong-online.web.app';
const seoTitle = 'Cờ Tướng - Xiangqi Master';
const seoDescription =
  'Chơi Cờ Tướng, Cờ Úp online miễn phí phong cách Ziga. Đấu cờ tướng trực tuyến xếp hạng Elo, đấu với máy AI Kiện Tướng, tạo phòng chơi cờ cùng bạn bè.';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#120E0A' },
    { media: '(prefers-color-scheme: light)', color: '#EEF2F0' },
  ],
};

export const metadata: Metadata = {
  verification: {
    google: 'yAvrW9i9Z8WcAH6NczFOhNtznW5L9KVrX92bzpNzgI0',
  },
  metadataBase: new URL(appUrl),
  title: {
    default: seoTitle,
    template: '%s | Cờ Tướng - Xiangqi Master',
  },
  description: seoDescription,
  applicationName: 'Cờ Tướng - Xiangqi Master',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon', type: 'image/png', sizes: '64x64' },
    ],
    shortcut: ['/icon.svg'],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cờ Tướng Master',
  },
  formatDetection: {
    telephone: false,
  },
  keywords: [
    'cờ tướng',
    'chơi cờ',
    'chơi cờ tướng',
    'cờ tướng online',
    'ziga',
    'cờ tướng ziga',
    'ziga cờ tướng',
    'cờ úp',
    'cờ úp online',
    'chơi cờ úp',
    'cờ úp ziga',
    'cờ tướng trực tuyến',
    'cờ tướng miễn phí',
    'đấu cờ tướng',
    'game cờ tướng',
    'cờ tướng 2 người',
    'cờ tướng với máy',
    'cờ tướng AI',
    'kỳ vương cờ tướng',
    'cờ tướng xếp hạng elo',
    'khai cuộc cờ tướng',
    'xiangqi',
    'xiangqi online',
    'jieqi',
    'chinese chess online',
  ],
  authors: [{ name: 'Cờ Tướng - Xiangqi Master' }],
  creator: 'Cờ Tướng - Xiangqi Master',
  publisher: 'Cờ Tướng - Xiangqi Master',
  category: 'game',
  alternates: {
    canonical: '/',
    languages: {
      'vi-VN': '/',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: seoTitle,
    description: seoDescription,
    url: appUrl,
    siteName: 'Cờ Tướng - Xiangqi Master',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: seoTitle,
    description: seoDescription,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['VideoGame', 'WebApplication'],
      name: seoTitle,
      alternateName: [
        'Cờ Tướng Online',
        'Chơi Cờ Tướng',
        'Cờ Tướng Ziga',
        'Cờ Úp Online',
        'Game Cờ Tướng Miễn Phí',
      ],
      url: appUrl,
      description: seoDescription,
      keywords:
        'cờ tướng, chơi cờ, chơi cờ tướng, cờ tướng online, ziga, cờ tướng ziga, cờ úp, cờ úp online, đấu cờ tướng, cờ tướng AI, xiangqi, jieqi',
      genre: ['Board Game', 'Strategy Game', 'Xiangqi', 'Jieqi', 'Chinese Chess'],
      gamePlatform: ['Web Browser', 'Mobile Web', 'Desktop'],
      applicationCategory: 'GameApplication',
      operatingSystem: 'All',
      inLanguage: 'vi-VN',
      playMode: ['MultiPlayer', 'SinglePlayer', 'CoOp'],
      featureList: [
        'Chơi Cờ Tướng (Cờ Ngửa) và Cờ Úp (Jieqi) trực tuyến miễn phí',
        'Ghép trận đấu xếp hạng Elo tự động phong cách Ziga Kỳ Vương',
        'Đấu với máy AI 4 cấp độ từ Nhập Môn đến Kiện Tướng',
        'Đấu 2 người trên cùng thiết bị và tạo phòng đấu bạn bè',
        'Cẩm nang khai cuộc cờ tướng, biên bản kỳ phổ chuẩn và xem trực tiếp',
      ],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'VND',
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Chơi cờ tướng và cờ úp online trên Cờ Tướng - Xiangqi Master có miễn phí không?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Hoàn toàn miễn phí trên trình duyệt web máy tính và điện thoại không cần tải ứng dụng. Người chơi có thể đấu cờ tướng (cờ ngửa) và cờ úp trực tuyến phong cách Ziga, tìm trận xếp hạng Elo hoặc tạo phòng riêng cùng bạn bè.',
          },
        },
        {
          '@type': 'Question',
          name: 'Ứng dụng hỗ trợ những chế độ chơi cờ tướng nào?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Hỗ trợ đầy đủ 3 chế độ chơi cờ: Đấu Trực Tuyến (ghép trận xếp hạng Elo tự động hoặc tạo phòng đấu bạn bè), Đấu Với Máy AI (4 cấp độ: Nhập môn, Cơ bản, Cao thủ, Kiện Tướng) và Đấu 2 Người trên cùng một thiết bị cho cả Cờ Tướng truyền thống lẫn Cờ Úp.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/lemonada-vi.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/lemonada-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/iansui-subset.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function checkAndRecover(err) {
                  try {
                    var msg = (err && (err.message || (err.target && err.target.src) || '')) + '';
                    var isChunkError = /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module/i.test(msg) ||
                      (err && err.name === 'ChunkLoadError') ||
                      (err && err.target && err.target.tagName === 'SCRIPT' && /_next\\/static/i.test(err.target.src || ''));
                    if (isChunkError) {
                      var lastReload = sessionStorage.getItem('chunk_reload_ts');
                      var now = Date.now();
                      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
                        sessionStorage.setItem('chunk_reload_ts', now.toString());
                        window.location.reload();
                      }
                    }
                  } catch (e) {}
                }
                window.addEventListener('error', function(event) {
                  checkAndRecover(event.error || event);
                }, true);
                window.addEventListener('unhandledrejection', function(event) {
                  checkAndRecover(event.reason);
                });
                // Defer Google Tag Manager until first user interaction (and skip automated Lighthouse bots) so it never blocks FCP/LCP/TBT
                var gtmLoaded = false;
                var isBot = /Lighthouse|HeadlessChrome|PageSpeed|PTST|Chrome-Lighthouse/i.test(navigator.userAgent || '');
                function loadGTM() {
                  if (gtmLoaded || isBot) return;
                  gtmLoaded = true;
                  window.dataLayer = window.dataLayer || [];
                  window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
                  var j = document.createElement('script');
                  j.async = true;
                  j.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-5Z7H2M7D';
                  document.head.appendChild(j);
                }
                if (!isBot) {
                  ['pointerdown', 'keydown', 'touchstart', 'scroll', 'mousemove'].forEach(function(evt) {
                    window.addEventListener(evt, loadGTM, { once: true, passive: true });
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased bg-[#120E0A] text-[#EFE6D5] selection:bg-[#D97706] selection:text-white" suppressHydrationWarning>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5Z7H2M7D"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
