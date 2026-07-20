'use client';

import { useEffect, useState } from 'react';
import { LogIn, LogOut, Mail, Globe, KeyRound, ShieldCheck, User } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export default function SettingsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase || !email.trim()) return;
    setLoading(true);
    setStatus(null);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setStatus(error ? error.message : 'Magic link sent — check your inbox.');
    setLoading(false);
  };

  const oauth = async (provider: 'google' | 'github') => {
    const supabase = getSupabase();
    if (!supabase) return;
    setStatus(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) setStatus(error.message);
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    setStatus('Signed out.');
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="section-label mb-2">Settings</p>
      <h1 className="font-display text-4xl">Account &amp; preferences.</h1>

      {/* Account */}
      <div className="glass-card mt-8 p-7">
        <div className="flex items-center gap-2">
          <User size={16} className="text-gold" />
          <h2 className="font-display text-lg">Account</h2>
        </div>

        {!configured ? (
          <div className="mt-4 rounded-xl border border-line bg-white/[0.03] p-5 text-sm text-secondary">
            <p className="flex items-center gap-2 text-primary">
              <ShieldCheck size={15} className="text-gold" /> Supabase is not configured.
            </p>
            <p className="mt-2 leading-relaxed">
              Add <code className="font-mono text-gold">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code className="font-mono text-gold">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{' '}
              <code className="font-mono">.env.local</code> to enable Google, GitHub, and
              magic-link authentication.
            </p>
          </div>
        ) : user ? (
          <div className="mt-4">
            <p className="text-sm text-secondary">Signed in as</p>
            <p className="mt-1 font-mono text-sm text-gold">{user.email ?? user.id}</p>
            <button onClick={() => void signOut()} className="btn-ghost mt-5 !px-4 !py-2 text-xs">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={() => void oauth('google')} className="btn-ghost flex-1 text-xs">
                <Globe size={14} /> Continue with Google
              </button>
              <button onClick={() => void oauth('github')} className="btn-ghost flex-1 text-xs">
                <KeyRound size={14} /> Continue with GitHub
              </button>
            </div>
            <form onSubmit={sendMagicLink} className="flex gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email for magic link"
                className="glass flex-1 rounded-xl px-4 py-2.5 text-sm placeholder:text-secondary/60 focus:border-gold-border focus:outline-none"
              />
              <button type="submit" disabled={loading} className="btn-gold !px-4 !py-2 text-xs disabled:opacity-50">
                {loading ? <Mail size={14} className="animate-pulse" /> : <LogIn size={14} />}
                Magic link
              </button>
            </form>
          </div>
        )}
        {status && <p className="mt-4 text-xs text-gold">{status}</p>}
      </div>

      {/* Subscription */}
      <div className="glass-card mt-6 p-7">
        <h2 className="font-display text-lg">Subscription</h2>
        <p className="mt-2 text-sm text-secondary">
          You are on the <span className="text-gold">Free</span> plan. Stripe billing
          activates once <code className="font-mono">STRIPE_SECRET_KEY</code> is
          configured.
        </p>
      </div>

      {/* AI */}
      <div className="glass-card mt-6 p-7">
        <h2 className="font-display text-lg">AI Engine</h2>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          The AI Historian uses OpenAI via a server-side key
          (<code className="font-mono">OPENAI_API_KEY</code>). Set{' '}
          <code className="font-mono">OPENAI_MODEL</code> to change the model
          (default: <code className="font-mono text-gold">gpt-4o</code>).
        </p>
      </div>
    </div>
  );
}
