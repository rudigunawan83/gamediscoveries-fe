import { notFound } from "next/navigation";
import { monitoringSections } from "@/features/admin-monitoring/monitoringNav";

export default async function MonitoringSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title = monitoringSections[section];
  if (!title) notFound();

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-black">{title}</h1>
      <p className="max-w-xl text-sm text-[#c7c8d6]">
        This module is not instrumented yet. It will show real metrics only after a data source
        exists. Nothing here is filled with sample numbers.
      </p>
    </div>
  );
}
