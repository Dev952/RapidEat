"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { initialAuthState } from "@/app/actions/auth-state";

export default function RegisterForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerAction, initialAuthState);

  useEffect(() => {
    if (state.status === "success") {
      const timeout = setTimeout(() => router.replace("/"), 900);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [state.status, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-3xl border border-gray-100 bg-white/85 p-10 shadow-2xl shadow-amber-200/40 backdrop-blur">
        <div className="grid gap-8 md:grid-cols-[1fr,1.1fr]">
          <div className="hidden md:flex flex-col justify-between rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 p-6 text-white shadow-lg shadow-red-500/40">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">RapidEat Plus</p>
              <h1 className="mt-4 text-3xl font-black leading-tight">
                Create your profile & unlock personalised recommendations
              </h1>
            </div>
            <ul className="space-y-3 text-sm text-white/90">
              <li>• Save favourite restaurants & dishes</li>
              <li>• Track live orders and delivery ETA</li>
              <li>• Access exclusive offers curated daily</li>
            </ul>
          </div>

          <div>
            <div className="mb-6 space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-amber-500 font-semibold">
                Join the club
              </p>
              <h2 className="text-3xl font-black text-gray-900">Create your account</h2>
              <p className="text-sm text-gray-500">
                It only takes a minute. We’ll remember your preferences for future orders.
              </p>
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
                <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Dev Trivedi"
                  className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-inner shadow-black/5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  aria-invalid={Boolean(state.fieldErrors?.name)}
                  required
                  disabled={pending}
                />
                {state.fieldErrors?.name && (
                  <p className="mt-1 text-xs text-red-500">{state.fieldErrors.name}</p>
                )}
              </div>
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
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-inner shadow-black/5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    aria-invalid={Boolean(state.fieldErrors?.password)}
                    required
                    disabled={pending}
                  />
                  {state.fieldErrors?.password && (
                    <p className="mt-1 text-xs text-red-500">{state.fieldErrors.password}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 shadow-inner shadow-black/5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
                    required
                    disabled={pending}
                  />
                  {state.fieldErrors?.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{state.fieldErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-2xl bg-gray-900 py-3 text-white font-semibold shadow-lg shadow-gray-900/30 transition hover:bg-black disabled:opacity-60"
              >
                {pending ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-semibold text-red-500 hover:text-red-600">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

