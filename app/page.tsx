import { redirect } from "next/navigation";
import HomeClient from "@/components/home/home-client";
import { getCurrentUser } from "@/lib/auth";
import type { UserRole } from "@/types/user";

const allowedRoles: UserRole[] = ["user", "admin"];

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login?reason=unauthenticated");
  }

  if (!allowedRoles.includes(currentUser.role)) {
    redirect("/auth/login?reason=unauthorised");
  }

  return <HomeClient currentUser={currentUser} />;
}

