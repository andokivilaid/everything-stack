import Link from "next/link";
import { AuthNav } from "@/components/marketing/auth-nav";
import { site } from "@/config/site";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-rule">
        <nav
          aria-label="Main"
          className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-5 py-4"
        >
          <Link href="/" className="display text-lg whitespace-nowrap">
            {site.name}
          </Link>
          <div className="hidden items-center gap-6 text-sm text-ink-soft sm:flex">
            <Link href="/#how" className="hover:text-ink">
              How it works
            </Link>
            <Link href="/pricing" className="hover:text-ink">
              Pricing
            </Link>
            <Link href="/#faq" className="hover:text-ink">
              Questions
            </Link>
          </div>
          <AuthNav />
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-rule">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-ink-soft sm:flex-row sm:justify-between">
          <p>{site.name}. Built with the Everything Stack template.</p>
          <p>
            Questions?{" "}
            <a className="underline hover:text-ink" href={`mailto:${site.supportEmail}`}>
              {site.supportEmail}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
