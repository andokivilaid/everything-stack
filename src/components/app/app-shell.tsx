"use client";

import { UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { BarChart3, CreditCard, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const me = useQuery(api.users.me);

  const nav = [
    { href: "/dashboard", label: "Overview", icon: LayoutGrid },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
    ...(me?.role === "admin" ? [{ href: "/admin", label: "Admin", icon: BarChart3 }] : []),
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <aside className="border-b border-rule bg-surface md:w-60 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex items-center justify-between px-5 py-4 md:block">
          <Link href="/" className="display text-lg">
            {site.name}
          </Link>
          <div className="md:hidden">
            <UserButton />
          </div>
        </div>
        <nav aria-label="App" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-[6px] px-3 py-2 text-sm whitespace-nowrap",
                  active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper hover:text-ink",
                )}
              >
                <Icon aria-hidden className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden px-5 py-6 md:flex md:items-center md:gap-3">
          <UserButton />
          <span className="truncate text-sm text-ink-soft">{me?.email ?? me?.name ?? ""}</span>
        </div>
      </aside>
      <main className="flex-1 px-5 py-8 md:px-10">{children}</main>
    </div>
  );
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-6">
      <h1 className="display text-3xl sm:text-4xl">{title}</h1>
      {children}
    </div>
  );
}
