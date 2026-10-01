"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast } from "sonner";

import { currentUserQueryKey } from "@/hooks/use-current-user";
import { createClient } from "@/lib/supabase/client";

let browserQueryClient: QueryClient | undefined;

function createNewQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.state.data !== undefined) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch updated data";
          toast.error(`Sync error: ${message}`);
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (!mutation.options.onError) {
          const message =
            error instanceof Error
              ? error.message
              : "An unexpected error occurred";
          toast.error(message);
        }
      },
    }),
  });
}

function getQueryClient() {
  if (typeof window === "undefined") return createNewQueryClient();
  browserQueryClient ??= createNewQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  useEffect(() => {
    const supabase = createClient();

    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: currentUserQueryKey() });
    });

    function handleOnline() {
      toast.success("Internet connection restored.", { id: "network-status" });
    }

    function handleOffline() {
      toast.warning("You are offline. Changes will sync when reconnected.", {
        id: "network-status",
        duration: 5000,
      });
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      subscription.subscription.unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
