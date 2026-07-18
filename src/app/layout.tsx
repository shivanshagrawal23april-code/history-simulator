import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HistoryVerse AI - Historical Intelligence Platform',
  description: 'World\'s most advanced platform for historical analysis, alternate history simulation, civilization modeling, and geopolitical intelligence.',
  keywords: 'history, AI, simulation, civilization, alternate history, geopolitics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        <div className="flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
