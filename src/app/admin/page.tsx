"use client";

import { useMutation, useQuery } from "convex/react";
import { PageHeader } from "@/components/app/app-shell";
import { formatPrice } from "@/config/site";
import { api } from "../../../convex/_generated/api";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-t-2 border-ink pt-3">
      <p className="display text-3xl">{value}</p>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
    </div>
  );
}

export default function AdminPage() {
  const me = useQuery(api.users.me);
  const isAdmin = me?.role === "admin";
  const overview = useQuery(api.analytics.overview, isAdmin ? { days: 14 } : "skip");
  const users = useQuery(api.users.list, isAdmin ? { limit: 50 } : "skip");
  const setRole = useMutation(api.users.setRole);

  if (me === undefined) return <p className="text-ink-soft">Loading…</p>;
  if (!isAdmin) {
    return (
      <>
        <PageHeader title="Admin" />
        <p className="text-ink-soft">
          This area is for admins. The first account created becomes an admin; add more with the{" "}
          <code>ADMIN_EMAILS</code> environment variable on Convex.
        </p>
      </>
    );
  }

  const max = Math.max(1, ...(overview?.series.map((d) => d.pageviews) ?? [1]));

  return (
    <>
      <PageHeader title="Admin" />

      <section aria-label="Key numbers" className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        <Stat label="Users" value={overview?.totals.users ?? "–"} />
        <Stat label="Paying customers" value={overview?.totals.activeSubscriptions ?? "–"} />
        <Stat label="Monthly revenue" value={overview ? formatPrice(overview.totals.mrrCents, "usd") : "–"} />
        <Stat label="Pageviews, 14 days" value={overview?.totals.pageviews ?? "–"} />
      </section>

      <section aria-labelledby="traffic-title" className="mt-12">
        <h2 id="traffic-title" className="text-lg font-semibold">
          Traffic, last 14 days
        </h2>
        <div
          className="mt-4 flex h-48 items-end gap-1.5 border-b border-rule"
          role="img"
          aria-label="Daily pageviews bar chart"
        >
          {overview?.series.map((d) => (
            <div key={d.day} className="group relative flex flex-1 flex-col items-center justify-end">
              <div
                className="w-full rounded-t-[3px] bg-[var(--stratum-3)]"
                style={{ height: `${(d.pageviews / max) * 100}%`, minHeight: d.pageviews ? 4 : 0 }}
              />
              <span className="pointer-events-none absolute -top-7 hidden rounded bg-ink px-2 py-0.5 text-xs whitespace-nowrap text-paper group-hover:block">
                {d.day.slice(5)}: {d.pageviews} views, {d.signups} signups
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-ink-soft">
          <span>{overview?.series[0]?.day}</span>
          <span>{overview?.series.at(-1)?.day}</span>
        </div>
      </section>

      <div className="mt-12 grid gap-12 lg:grid-cols-[2fr_1fr]">
        <section aria-labelledby="users-title">
          <h2 id="users-title" className="text-lg font-semibold">
            Users
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink text-ink-soft">
                <tr>
                  <th className="py-2 pr-4 font-normal">User</th>
                  <th className="py-2 pr-4 font-normal">Plan</th>
                  <th className="py-2 pr-4 font-normal">Joined</th>
                  <th className="py-2 font-normal">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {users?.map((u) => (
                  <tr key={u._id}>
                    <td className="py-2.5 pr-4">{u.email ?? u.name ?? u.externalId}</td>
                    <td className="py-2.5 pr-4">
                      {u.subscription && u.subscription.status === "active" ? u.subscription.plan : "free"}
                    </td>
                    <td className="py-2.5 pr-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-2.5">
                      <label className="sr-only" htmlFor={`role-${u._id}`}>
                        Role for {u.email}
                      </label>
                      <select
                        id={`role-${u._id}`}
                        value={u.role}
                        disabled={u._id === me._id}
                        onChange={(e) =>
                          void setRole({ userId: u._id, role: e.target.value as "admin" | "member" })
                        }
                        className="rounded border border-rule bg-surface px-2 py-1"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="pages-title">
          <h2 id="pages-title" className="text-lg font-semibold">
            Top pages
          </h2>
          <ol className="mt-4 divide-y divide-rule border-y border-rule text-sm">
            {overview?.topPages.length === 0 && <li className="py-3 text-ink-soft">No pageviews yet.</li>}
            {overview?.topPages.map((p) => (
              <li key={p.path} className="flex justify-between gap-4 py-2.5">
                <span className="truncate">{p.path}</span>
                <span className="text-ink-soft">{p.views}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
