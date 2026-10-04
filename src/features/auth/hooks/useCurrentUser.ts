"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { currentUserQueryOptions } from "@/features/auth/api/authQueries";
import { useAuthStore } from "@/features/auth/stores/authStore";

export function useCurrentUser() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const storedUser = useAuthStore((state) => state.user);

  const query = useQuery({
    ...currentUserQueryOptions(),
    enabled: Boolean(accessToken),
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return {
    ...query,
    user: query.data ?? storedUser,
  };
}
