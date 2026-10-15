import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app/app-shell";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<div className="flex-1" aria-busy="true" />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
