"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getMyXpTransactions, xpRuleLabel } from "@/lib/api/progress";
import { Button } from "@/components/ui/button";

export default function ProgressXpPage() {
  const { accessToken } = useAuth();
  const query = useQuery({
    queryKey: ["me", "xp", "transactions", "all"],
    queryFn: async () =>
      (await getMyXpTransactions({ page: 1, pageSize: 50 })).data!,
    enabled: Boolean(accessToken),
  });

  if (!accessToken) {
    return (
      <main className="container mx-auto px-4 py-8">
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="text-primary">
            Sign in
          </Link>{" "}
          to view XP history.
        </p>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-white">XP History</h1>
        <Button asChild variant="ghost" size="sm">
          <Link href="/progress">Back</Link>
        </Button>
      </div>
      <ul className="space-y-2">
        {(query.data?.items ?? []).map((tx) => (
          <li
            key={tx.transactionId}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <div>
              <p className="text-sm text-white">
                {xpRuleLabel(tx.ruleCode, tx.description)}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(tx.createdAt).toLocaleString()}
              </p>
            </div>
            <p
              className={`font-semibold ${tx.xpAmount >= 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              {tx.xpAmount >= 0 ? "+" : ""}
              {tx.xpAmount} XP
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
