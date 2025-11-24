import { redirect } from "next/navigation";
import { Suspense } from "react";
import HomeClient from "@/components/home/home-client";
import { getCurrentUser } from "@/lib/auth";
import type { UserRole } from "@/types/user";

// Force dynamic rendering - THIS IS CRITICAL
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const allowedRoles: UserRole[] = ["user", "admin"];

// Separate the auth logic into its own async component
async function AuthenticatedHome() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login?reason=unauthenticated");
  }

  if (!allowedRoles.includes(currentUser.role)) {
    redirect("/auth/login?reason=unauthorised");
  }

  return <HomeClient currentUser={currentUser} />;
}

// Loading component
function HomeLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-semibold">Loading...</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <AuthenticatedHome />
    </Suspense>
  );
}