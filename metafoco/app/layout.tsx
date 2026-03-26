import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'METAFOCO — Foco. Disciplina. Resultado.',
  description: 'Assistente inteligente de dieta, jejum intermitente, scanner de calorias e acompanhamento corporal.',
  manifest: '/manifest.json',
  applicationName: 'METAFOCO',
  keywords: ['dieta', 'jejum intermitente', 'nutrição', 'fitness', 'calorias'],
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/icons/icon-192x192.png', sizes: '192x192' },
    shortcut: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'METAFOCO',
  },
  openGraph: {
    title: 'METAFOCO — Foco. Disciplina. Resultado.',
    description: 'Assistente inteligente de dieta e jejum intermitente com scanner de calorias por IA.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="METAFOCO" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#000000" />
      </head>
      <body className="bg-black text-white min-h-screen antialiased no-tap-highlight">
        {children}
      </body>
    </html>
  );
}
