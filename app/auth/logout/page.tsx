import Link from 'next/link';
import { logoutAction } from '@/app/actions/auth';

export default function LogoutPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white/90 p-8 text-center shadow-2xl shadow-gray-900/5">
        <p className="text-xs uppercase tracking-[0.4em] text-amber-500 font-semibold">
          Signing out
        </p>
        <h1 className="mt-3 text-3xl font-black text-gray-900">Leaving so soon?</h1>
        <p className="mt-2 text-sm text-gray-500">
          You can sign back in anytime to pick up where you left off.
        </p>

        <form action={logoutAction} className="mt-8 space-y-3">
          <button
            type="submit"
            className="w-full rounded-2xl bg-gray-900 py-3 text-white font-semibold shadow-lg shadow-gray-900/30 transition hover:bg-black"
          >
            Confirm logout
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 inline-block text-sm font-semibold text-red-500 hover:text-red-600"
        >
          or go back to browsing
        </Link>
      </div>
    </div>
  );
}

