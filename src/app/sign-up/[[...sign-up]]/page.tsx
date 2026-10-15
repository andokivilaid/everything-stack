import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <Suspense fallback={<div className="h-[480px] w-full max-w-sm" aria-busy="true" />}>
        <SignUp fallbackRedirectUrl="/dashboard" signInUrl="/sign-in" />
      </Suspense>
    </main>
  );
}
