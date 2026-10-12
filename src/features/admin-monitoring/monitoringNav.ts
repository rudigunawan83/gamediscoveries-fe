/** Only admin pages that exist today; no placeholder destinations. */
export const adminPortalNav = [
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/community", label: "Content Moderation", icon: "shield" },
  { href: "/admin/gamification", label: "Gamification", icon: "trophy" },
  { href: "/admin/gamification/missions", label: "Missions", icon: "target" },
  { href: "/admin/gamification/achievements", label: "Achievements", icon: "award" },
  { href: "/admin/gamification/leaderboards", label: "Leaderboard", icon: "chart" },
  { href: "/admin/seo", label: "SEO", icon: "search" },
] as const;

export const monitoringNav = [
  { href: "/admin/monitoring", label: "Overview" },
  { href: "/admin/monitoring/traffic", label: "Traffic & Growth" },
  { href: "/admin/monitoring/games", label: "Game Analytics" },
  { href: "/admin/monitoring/retention", label: "User & Retention" },
  { href: "/admin/monitoring/gamification", label: "Gamification Analytics" },
  { href: "/admin/monitoring/seo", label: "SEO Monitoring" },
  { href: "/admin/monitoring/revenue", label: "Revenue & Monetization" },
  { href: "/admin/monitoring/uptime", label: "Website & Uptime" },
  { href: "/admin/monitoring/api", label: "API Performance" },
  { href: "/admin/monitoring/database", label: "Database Monitoring" },
  { href: "/admin/monitoring/infrastructure", label: "Infrastructure" },
  { href: "/admin/monitoring/providers", label: "Provider Integration" },
  { href: "/admin/monitoring/errors", label: "Errors & Logs" },
  { href: "/admin/monitoring/security", label: "Security & Abuse" },
  { href: "/admin/monitoring/alerts", label: "Alerts & Incidents" },
] as const;

export const monitoringSections: Record<string, string> = {
  traffic: "Traffic & Growth",
  games: "Game Analytics",
  retention: "User & Retention",
  gamification: "Gamification Analytics",
  seo: "SEO Monitoring",
  revenue: "Revenue & Monetization",
  uptime: "Website & Uptime",
  api: "API Performance",
  database: "Database Monitoring",
  infrastructure: "Infrastructure",
  providers: "Provider Integration",
  errors: "Errors & Logs",
  security: "Security & Abuse",
  alerts: "Alerts & Incidents",
};
