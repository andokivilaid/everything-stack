import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <Suspense fallback={<div className="h-[480px] w-full max-w-sm" aria-busy="true" />}>
        <SignIn fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" />
      </Suspense>
    </main>
  );
}
