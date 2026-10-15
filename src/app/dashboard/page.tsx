"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { plans } from "@/config/site";
import { api } from "../../../convex/_generated/api";

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.me);
  const items = useQuery(api.items.list);
  const create = useMutation(api.items.create);
  // Optimistic updates: the list responds instantly, Convex confirms in the background.
  const toggle = useMutation(api.items.toggle).withOptimisticUpdate((store, { id }) => {
    const list = store.getQuery(api.items.list, {});
    if (list)
      store.setQuery(
        api.items.list,
        {},
        list.map((i) => (i._id === id ? { ...i, done: !i.done } : i)),
      );
  });
  const remove = useMutation(api.items.remove).withOptimisticUpdate((store, { id }) => {
    const list = store.getQuery(api.items.list, {});
    if (list)
      store.setQuery(
        api.items.list,
        {},
        list.filter((i) => i._id !== id),
      );
  });
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const active = me?.subscription && ["active", "trialing"].includes(me.subscription.status);
  const plan = plans.find((p) => p.id === (active ? me?.subscription?.plan : "free"));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create({ title });
      setTitle("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message.replace(/^.*Uncaught Error: /, "").split("\n")[0]
          : "Couldn't add the item",
      );
    }
  }

  if (!isLoading && !isAuthenticated) {
    return (
      <p className="text-ink-soft">
        Your session isn&apos;t reaching the database yet. Check that <code>CLERK_JWT_ISSUER_DOMAIN</code> is
        set on Convex (run <code>npm run setup</code>).
      </p>
    );
  }

  return (
    <>
      <PageHeader title={me?.name ? `Hi, ${me.name.split(" ")[0]}` : "Overview"}>
        <p className="text-sm text-ink-soft">
          Plan: <span className="font-semibold text-ink">{plan?.name ?? "Free"}</span>
          {!active && (
            <>
              {" · "}
              <Link href="/pricing" className="underline hover:text-ink">
                Upgrade
              </Link>
            </>
          )}
        </p>
      </PageHeader>

      <section aria-labelledby="items-title" className="max-w-2xl">
        <h2 id="items-title" className="text-lg font-semibold">
          Your items
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          A realtime list stored in Convex. Open this page in two tabs to watch it sync.
        </p>
        <form onSubmit={onSubmit} className="mt-4 flex gap-2">
          <label htmlFor="new-item" className="sr-only">
            New item
          </label>
          <input
            id="new-item"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write the launch post"
            className="min-w-0 flex-1 rounded-[var(--radius)] border border-rule bg-surface px-3 py-2.5 text-sm"
          />
          <Button type="submit" disabled={!title.trim()}>
            Add item
          </Button>
        </form>
        {error && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}{" "}
            {error.includes("Upgrade") && (
              <ButtonLink href="/pricing" variant="ghost" className="px-1 py-0 underline">
                See plans
              </ButtonLink>
            )}
          </p>
        )}

        <ul className="mt-6 divide-y divide-rule border-y border-rule">
          {items === undefined && <li className="py-4 text-sm text-ink-soft">Loading…</li>}
          {items?.length === 0 && (
            <li className="py-4 text-sm text-ink-soft">No items yet. Add your first one above.</li>
          )}
          {items?.map((item) => (
            <li key={item._id} className="flex items-center gap-3 py-3">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => void toggle({ id: item._id })}
                aria-label={`Mark "${item.title}" as ${item.done ? "not done" : "done"}`}
                className="size-4 accent-[var(--ink)]"
              />
              <span className={item.done ? "flex-1 text-ink-soft line-through" : "flex-1"}>{item.title}</span>
              <button
                onClick={() => void remove({ id: item._id })}
                className="text-ink-soft hover:text-danger"
                aria-label={`Delete "${item.title}"`}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
