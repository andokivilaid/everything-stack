"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { ButtonLink } from "@/components/ui/button";

/** Client-side auth state keeps marketing pages fully static. */
export function AuthNav() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <div className="h-10 w-40" aria-hidden />;
  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <ButtonLink href="/dashboard" variant="secondary" className="whitespace-nowrap">
          Dashboard
        </ButtonLink>
        <UserButton />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <ButtonLink href="/sign-in" variant="ghost" className="hidden sm:inline-flex">
        Sign in
      </ButtonLink>
      <ButtonLink href="/sign-up">Start free</ButtonLink>
    </div>
  );
}
