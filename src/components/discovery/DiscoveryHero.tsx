import Image from "next/image";
import { useTranslations } from "next-intl";
import { DiscoveryPills } from "@/components/discovery/DiscoveryPills";
import { HeroSearchInput } from "@/components/search/HeroSearchInput";

export function DiscoveryHero() {
  const t = useTranslations("Discovery");
  return (
    <section
      aria-labelledby="discovery-hero-heading"
      className="relative left-1/2 isolate w-screen max-w-[100vw] -translate-x-1/2 -mt-6 min-h-[32rem] overflow-hidden md:min-h-[38rem] lg:min-h-[42rem]"
    >
      <Image
        src="/images/hero-background.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[72%_center] sm:object-[68%_center] lg:object-right"
      />

      {/* Readability veil over the dark cavern side; keep character visible on the right. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,9,15,0.92)_0%,rgba(7,9,15,0.78)_34%,rgba(7,9,15,0.35)_58%,rgba(7,9,15,0.12)_78%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_18%_40%,rgba(224,122,32,0.32),transparent_62%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0a0c12] to-transparent"
      />

      <div className="relative z-10 mx-auto flex min-h-[32rem] w-full max-w-7xl items-center px-4 py-10 md:min-h-[38rem] md:px-6 md:py-14 lg:min-h-[42rem]">
        <div className="hero-enter flex w-full max-w-xl flex-col gap-7 lg:max-w-2xl">
          <div className="space-y-4">
            <p className="font-display text-sm font-semibold tracking-[0.22em] text-primary uppercase">
              GameDiscoveries
            </p>
            <h1
              id="discovery-hero-heading"
              className="font-display text-[2.45rem] leading-[1.05] font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.1rem]"
            >
              {t.rich("heroTitle", {
                highlight: (chunks) => <span className="text-brand-gradient">{chunks}</span>,
                br: () => <br className="hidden sm:block" />,
              })}
            </h1>
            <p className="max-w-md text-base leading-relaxed text-[#ffe8c2] md:text-lg">
              {t("heroSubtitle")}
            </p>
          </div>

          <div className="hero-enter-delay space-y-5">
            <HeroSearchInput />
            <DiscoveryPills />
          </div>
        </div>
      </div>
    </section>
  );
}
