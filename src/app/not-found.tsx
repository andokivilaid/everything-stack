import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-24">
      <p className="display text-7xl text-ink-soft">404</p>
      <h1 className="display mt-4 text-3xl">This page doesn&apos;t exist</h1>
      <p className="mt-3 text-ink-soft">The link may be old, or the address has a typo.</p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/">Go to the homepage</ButtonLink>
        <ButtonLink href="/dashboard" variant="secondary">
          Open dashboard
        </ButtonLink>
      </div>
    </main>
  );
}
