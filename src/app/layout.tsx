import type { Metadata } from 'next';
import { Inter, Playfair_Display, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'HistoryVersa — The World\'s Historical Intelligence Platform',
    template: '%s · HistoryVersa',
  },
  description:
    'AI-powered historical intelligence: interactive timelines, historical atlas, civilization analysis, alternate-history simulations, and cited answers to any question from history.',
  keywords: [
    'history',
    'AI',
    'historical intelligence',
    'timeline',
    'atlas',
    'civilizations',
    'alternate history',
    'simulation',
  ],
  openGraph: {
    title: 'HistoryVersa — The World\'s Historical Intelligence Platform',
    description:
      'Ask anything from history. Receive AI analysis, timelines, maps, figures, and sources.',
    type: 'website',
    siteName: 'HistoryVersa',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${plexMono.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-background font-sans text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
