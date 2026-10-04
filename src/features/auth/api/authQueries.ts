import { queryOptions } from "@tanstack/react-query";
import { getCurrentUserRequest } from "@/features/auth/api/authApi";
import { getAccessToken } from "@/features/auth/stores/authStore";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export function currentUserQueryOptions() {
  return queryOptions({
    queryKey: authKeys.me(),
    queryFn: getCurrentUserRequest,
    enabled: Boolean(getAccessToken()),
    staleTime: 60_000,
    retry: false,
  });
}
