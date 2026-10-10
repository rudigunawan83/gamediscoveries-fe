"use client";

import { useLocale, useTranslations } from "next-intl";
import { languageModes } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { useLanguage } from "./LanguageProvider";

/** Native names so each option is recognizable in any UI language. */
export function LanguageSection() {
  const t = useTranslations("Language");
  const locale = useLocale();
  const { mode, setMode } = useLanguage();

  return (
    <fieldset className="space-y-2.5">
      <legend className="pl-1 text-sm font-bold text-[#9c9cb0]">{t("title")}</legend>
      <p className="pl-1 text-sm text-[#6b6b7e]">{t("subtitle")}</p>
      <div className="divide-y divide-[#2a2a37] rounded-[18px] border border-[#2a2a37] bg-[#17171f]">
        {languageModes.map((option) => {
          const selected = option === mode;
          return (
            <label
              key={option}
              className="flex min-h-14 cursor-pointer items-center gap-3 px-4 py-3"
            >
              <input
                type="radio"
                name="language"
                value={option}
                checked={selected}
                onChange={() => void setMode(option)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-[#ffc83d]/60",
                  selected ? "border-[#ffc83d]" : "border-[#6b6b7e]",
                )}
              >
                {selected ? <span className="size-3 rounded-full bg-[#ffc83d]" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-white">
                  {option === "SYSTEM" ? t("system") : t(option)}
                </span>
                {option === "SYSTEM" && selected ? (
                  <span className="block text-sm text-[#9c9cb0]">
                    {t("systemDetected", { language: t(locale) })}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
