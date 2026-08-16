import { useSyncExternalStore } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity, AlertTriangle, Building2, CheckCircle2, Clock, Gauge, Radio, ShieldCheck, Siren, Timer, Wrench, Zap,
} from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge } from "@/components/app/primitives";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";

export const Route = createFileRoute("/_admin/facility/control-room")({
  head: () => ({
    meta: [
      { title: "Live Facility Control Room — Facility Core Service" },
      { name: "description", content: "Live operational center for critical facility alerts, asset downtime, technician telemetry, and active work orders." },
    ],
  }),
  component: LiveControlRoomPage,
});

function LiveControlRoomPage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);
  const summary = facilityStore.getSummary();

  return (
    <>
      <PageHeader
        title="Live Operational Facility Control Room"
        description="24/7 Command View — Real-time telemetry, active alarms, technician locations, breakdown dispatch and utility spikes."
        breadcrumb={["Facility", "Control Room"]}
        actions={
          <span className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-300">
            <span className="size-2 rounded-full bg-red-500 animate-ping" /> LIVE TELEMETRY FEED
          </span>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border lg:grid-cols-4">
          <KpiCard label="Critical Alerts" value={String(summary.criticalIssuesCount)} icon={Siren} tone={summary.criticalIssuesCount > 0 ? "warning" : "success"} />
          <KpiCard label="Under Maintenance" value={String(summary.underMaintenanceAssets)} icon={Wrench} tone="warning" />
          <KpiCard label="Pending PM Routines" value={String(summary.overdueMaintenanceCount)} icon={Timer} tone="info" />
          <KpiCard label="Active Work Orders" value={String(summary.openWorkOrders)} icon={Activity} tone="primary" />
        </div>

        {/* Live Asset IoT Telemetry Simulation */}
        <Section title="Live Asset Telemetry & Anomaly Sensors (Mock)" description="Vibration, temperature, voltage & pressure sensors">
          <div className="grid gap-4 sm:grid-cols-3">
            {Object.values(store.assetMetrics).map((metric) => {
              const asset = store.assets.find((a) => a.id === metric.assetId);
              return (
                <div key={metric.assetId} className={`rounded-xl border p-4 space-y-3 ${metric.isAnomaly ? "border-red-300 bg-red-50/50 dark:bg-red-950/20" : "border-border bg-card"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">{asset?.assetCode}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${metric.healthScore > 90 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      Health: {metric.healthScore}%
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm">{asset?.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                    <div>Temp: <strong className="text-foreground">{metric.temperatureC}°C</strong></div>
                    <div>Vibration: <strong className={metric.vibrationMmS > 4 ? "text-red-600 font-bold" : "text-foreground"}>{metric.vibrationMmS} mm/s</strong></div>
                    <div>Voltage: <strong className="text-foreground">{metric.voltageV} V</strong></div>
                    <div>Runtime: <strong className="text-foreground">{metric.runtimeHours} hrs</strong></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </>
  );
}
