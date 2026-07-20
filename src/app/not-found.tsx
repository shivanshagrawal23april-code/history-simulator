import Link from 'next/link';
import { Scroll, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gold-radial px-6 text-center">
      <Scroll size={32} className="text-gold" />
      <p className="section-label mt-6">404</p>
      <h1 className="mt-2 font-display text-4xl">Lost to history.</h1>
      <p className="mt-3 max-w-md text-secondary">
        This page has crumbled like the Library of Alexandria. Let&apos;s take you back
        to safer ground.
      </p>
      <Link href="/" className="btn-gold mt-8">
        <ArrowLeft size={15} /> Return home
      </Link>
    </div>
  );
}
