"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithAuth, ConvexReactClient, useAction, useConvexAuth } from "convex/react";
import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { api } from "../../../convex/_generated/api";

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = url ? new ConvexReactClient(url) : null;

/**
 * Bridges Clerk → Convex using Clerk's *default* session token (no JWT
 * template), matching the customJwt provider in convex/auth.config.ts.
 */
function useClerkAuthForConvex() {
  const { isLoaded, isSignedIn, getToken, orgId, orgRole } = useAuth();
  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      try {
        return await getToken({ skipCache: forceRefreshToken });
      } catch {
        return null;
      }
    },
    // Re-run when the org context changes so Convex gets a fresh token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getToken, orgId, orgRole],
  );
  return useMemo(
    () => ({ isLoading: !isLoaded, isAuthenticated: isSignedIn ?? false, fetchAccessToken }),
    [isLoaded, isSignedIn, fetchAccessToken],
  );
}

/** Syncs the Convex user record (verified profile from Clerk) once the session is valid. */
function SyncUser() {
  const { isAuthenticated } = useConvexAuth();
  const sync = useAction(api.users.sync);
  useEffect(() => {
    if (isAuthenticated) void sync().catch(() => {});
  }, [isAuthenticated, sync]);
  return null;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <>
        <div role="alert" className="bg-signal px-4 py-2 text-sm text-signal-ink">
          NEXT_PUBLIC_CONVEX_URL is not set. Run <code>npm run setup</code>, then <code>npm run dev</code>.
        </div>
        {children}
      </>
    );
  }
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useClerkAuthForConvex}>
      <SyncUser />
      {children}
    </ConvexProviderWithAuth>
  );
}
