"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import { LanguageProvider } from "@/features/language/LanguageProvider";
import type { LanguageMode } from "@/i18n/config";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";

export function AppProviders({
  languageMode,
  children,
}: {
  languageMode: LanguageMode;
  children: ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <LanguageProvider mode={languageMode}>
          <PwaProvider>
            <TooltipProvider>
              {children}
              <Toaster richColors position="top-right" />
            </TooltipProvider>
          </PwaProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
