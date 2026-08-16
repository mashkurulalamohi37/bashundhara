import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { meterService } from "@/services";
import type { Column, FilterDef } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { bdt, num, titleize } from "@/lib/format";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/control/meters")({
  head: () => ({
    meta: [
      { title: "Meters & Readings — Bashundhara R/A" },
      { name: "description", content: "Electricity, water, gas and generator meters with consumption and billing state." },
      { property: "og:title", content: "Meters & Readings — Bashundhara R/A" },
      { property: "og:description", content: "Electricity, water, gas and generator meters with consumption and billing state." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "serial", header: "Serial" },
  { key: "type", header: "Type", render: (r) => titleize(String(r.type)) },
  { key: "scope", header: "Scope", render: (r) => titleize(String(r.scope)) },
  { key: "flat", header: "Flat" },
  { key: "previousReading", header: "Previous", render: (r) => <span className="tabular">{num(r.previousReading)}</span>, value: (r) => r.previousReading },
  { key: "currentReading", header: "Current", render: (r) => <span className="tabular">{num(r.currentReading)}</span>, value: (r) => r.currentReading },
  { key: "consumption", header: "Consumption", render: (r) => <span className="tabular">{num(r.consumption)}</span>, value: (r) => r.consumption },
  { key: "amount", header: "Amount", render: (r) => <span className="tabular">{bdt(r.amount)}</span>, value: (r) => r.amount },
  { key: "lastReadOn", header: "Last read" },
  { key: "billingStatus", header: "Billing", render: (r) => <StatusBadge value={r.billingStatus} /> },
];

const filters: FilterDef[] = [
  { key: "type", label: "Type", options: ["electricity", "water", "gas", "generator"] },
  { key: "scope", label: "Scope", options: ["flat", "common", "building"] },
  { key: "billingStatus", label: "Billing", options: ["unbilled", "billed", "paid"] },
];

const createFields: FieldDef[] = [
  { name: "serial", label: "Meter serial", required: true },
  { name: "type", label: "Meter type", type: "select", options: ["electricity", "water", "gas", "generator"], required: true },
  { name: "scope", label: "Scope", type: "select", options: ["flat", "common", "building"], required: true },
  { name: "flat", label: "Flat / location", required: true },
  { name: "currentReading", label: "Current reading", type: "number", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Meters & Readings"
      description="Electricity, water, gas and generator meters with consumption and billing state."
      breadcrumb={["Control", "Meters"]}
      service={meterService as never}
      queryKey="ctl-meters"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Register meter"
    />
  );
}
