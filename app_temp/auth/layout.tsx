import type { Metadata } from 'next';
import Link from 'next/link';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Account | RapidEat',
  description: 'Sign in or create your RapidEat account.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
      <div className="absolute inset-0 pointer-events-none opacity-30 blur-3xl mix-blend-multiply bg-[radial-gradient(circle_at_top,_rgba(255,99,72,0.2),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(45,212,191,0.25),_transparent_40%)]" />
      <header className="relative z-10 py-6">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500 text-white font-black grid place-items-center text-xl shadow-red-500/30 shadow-lg">
              Z
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-gray-900">RapidEat</p>
              <p className="text-xs text-gray-500">Zomato / Swiggy inspired</p>
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
          >
            Back to restaurants
          </Link>
        </div>
      </header>
      <main className="relative z-10">{children}</main>
    </div>
  );
}

