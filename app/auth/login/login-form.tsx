"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { initialAuthState } from "@/app/actions/auth-state";

export default function LoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(loginAction, initialAuthState);

  useEffect(() => {
    if (state.status === "success") {
      const timeout = setTimeout(() => router.replace("/"), 900);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [state.status, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white/80 p-8 shadow-2xl shadow-red-500/5 backdrop-blur">
        <div className="mb-6 text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-500 font-semibold">
            Welcome back
          </p>
          <h1 className="text-3xl font-black text-gray-900">Sign in to RapidEat</h1>
          <p className="text-sm text-gray-500">Track orders, save favourites and more.</p>
        </div>

        {state.status === "error" && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </div>
        )}
        {state.status === "success" && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {state.message}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-inner shadow-black/5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              aria-invalid={Boolean(state.fieldErrors?.email)}
              required
              disabled={pending}
            />
            {state.fieldErrors?.email && (
              <p className="mt-1 text-xs text-red-500">{state.fieldErrors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-inner shadow-black/5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              aria-invalid={Boolean(state.fieldErrors?.password)}
              required
              disabled={pending}
            />
            {state.fieldErrors?.password && (
              <p className="mt-1 text-xs text-red-500">{state.fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-2xl bg-red-500 py-3 text-white font-semibold shadow-lg shadow-red-500/40 transition hover:bg-red-600 disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          New to RapidEat?{" "}
          <Link href="/auth/register" className="font-semibold text-red-500 hover:text-red-600">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

