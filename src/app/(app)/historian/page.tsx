import { Suspense } from 'react';
import type { Metadata } from 'next';
import { HistorianChat } from '@/components/HistorianChat';

export const metadata: Metadata = { title: 'AI Historian' };

export default function HistorianPage() {
  return (
    <Suspense>
      <HistorianChat />
    </Suspense>
  );
}
