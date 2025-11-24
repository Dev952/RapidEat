import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Account | RapidEat",
  description: "Sign in or create your RapidEat account.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 text-gray-900">
      {/* Soft global gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/10 to-amber-500/10 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 
                text-white font-black flex items-center justify-center text-2xl shadow-xl shadow-red-500/40">
              R
            </div>
            
            <div>
              <h1 className="text-2xl font-black tracking-tight">RapidEat</h1>
              <p className="text-sm text-gray-600">Fast food, faster delivery</p>
            </div>
          </div>

        </div>
      </header>

      {/* Auth Forms */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}
