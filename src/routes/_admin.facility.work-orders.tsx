import { useSyncExternalStore, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2, Clock, Plus, Search, UserCheck, Wrench, X, AlertCircle,
  FileText, ShieldCheck, DollarSign, Filter,
} from "lucide-react";
import { PageHeader, Section, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";
import { bdt } from "@/lib/format";
import type { FacilityWorkOrder, MaintenanceType, WorkOrderPriority, WorkOrderStatus } from "@/types/facility";

export const Route = createFileRoute("/_admin/facility/work-orders")({
  head: () => ({
    meta: [
      { title: "Facility Work Orders — Facility Core Service" },
      { name: "description", content: "Work order management system for building & community maintenance, technician assignment, SLA rules, and parts costing." },
    ],
  }),
  component: FacilityWorkOrdersPage,
});

function FacilityWorkOrdersPage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New Work Order State
  const [selectedAssetId, setSelectedAssetId] = useState(store.assets[0]?.id ?? "");
  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<WorkOrderPriority>("normal");
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>("Corrective");
  const [assignedTechnician, setAssignedTechnician] = useState("Imran Bhuiyan");

  const filteredOrders = store.workOrders.filter((w) => {
    if (statusFilter !== "all" && w.status !== statusFilter) return false;
    if (priorityFilter !== "all" && w.priority !== priorityFilter) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    facilityStore.createWorkOrder({
      assetId: selectedAssetId,
      issue,
      description,
      priority,
      maintenanceType,
      assignedTechnician,
    });
    setShowCreateForm(false);
    setIssue("");
    setDescription("");
  };

  const handleUpdateStatus = (woId: string, newStatus: WorkOrderStatus) => {
    facilityStore.updateWorkOrderStatus(woId, newStatus);
  };

  return (
    <>
      <PageHeader
        title="Facility Work Orders & Maintenance Jobs"
        description="Ticket dispatch, technician execution, spare parts tracking, SLA enforcement, and cost booking to Accounts."
        breadcrumb={["Facility", "Work Orders"]}
        actions={
          <Button size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="mr-1.5 size-4" /> Issue Work Order
          </Button>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Create Work Order Modal */}
        {showCreateForm && (
          <form onSubmit={handleCreate} className="rounded-xl border border-primary/30 bg-card p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-semibold text-base">Issue New Facility Work Order</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}><X className="size-4" /></Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label>Select Target Asset *</Label>
                <select
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                >
                  {store.assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.assetCode} — {a.name} ({a.buildingName})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Maintenance Type</Label>
                <select
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={maintenanceType}
                  onChange={(e) => setMaintenanceType(e.target.value as MaintenanceType)}
                >
                  <option value="Corrective">Corrective</option>
                  <option value="Preventive">Preventive</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Breakdown">Breakdown</option>
                  <option value="Inspection">Inspection</option>
                </select>
              </div>
              <div>
                <Label>Priority *</Label>
                <select
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as WorkOrderPriority)}
                >
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical (Immediate SLA)</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label>Issue Summary *</Label>
                <Input required className="mt-1" placeholder="e.g. Generator ATS failing to auto-switch during outage" value={issue} onChange={(e) => setIssue(e.target.value)} />
              </div>
              <div>
                <Label>Assigned Technician / Vendor</Label>
                <Input className="mt-1" value={assignedTechnician} onChange={(e) => setAssignedTechnician(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Detailed Description & Inspection Notes</Label>
              <textarea className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              <Button type="submit" size="sm">Dispatch Work Order</Button>
            </div>
          </form>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-xs">
          <Filter className="size-4 text-muted-foreground" />
          <span className="font-semibold text-muted-foreground">Status Filter:</span>
          <select className="rounded-md border border-border bg-background px-2.5 py-1 text-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Verified">Verified</option>
          </select>
          <span className="font-semibold text-muted-foreground ml-2">Priority:</span>
          <select className="rounded-md border border-border bg-background px-2.5 py-1 text-xs" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
          </select>
        </div>

        {/* Work Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((wo) => (
            <div key={wo.id} className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm hover:border-primary/40 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-primary">{wo.workOrderCode}</span>
                    <Badge variant={wo.priority === "critical" ? "destructive" : "secondary"} className="text-[10px] uppercase">
                      {wo.priority}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {wo.maintenanceType}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-base text-foreground mt-1">{wo.issue}</h3>
                  <p className="text-xs text-muted-foreground">
                    Asset: <strong>{wo.assetName}</strong> ({wo.assetCode}) · Location: {wo.location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge value={wo.status} />
                  {wo.status !== "Completed" && wo.status !== "Verified" && (
                    <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdateStatus(wo.id, "Completed")}>
                      <CheckCircle2 className="mr-1 size-3.5" /> Mark Completed
                    </Button>
                  )}
                </div>
              </div>

              {/* Assignment & Cost Summary */}
              <div className="grid gap-4 text-xs sm:grid-cols-3">
                <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                  <p className="font-semibold text-muted-foreground uppercase text-[10px]">Staff Assignment</p>
                  <p>Technician: <strong>{wo.assignedTechnician}</strong></p>
                  <p>Department: {wo.assignedDepartment}</p>
                  {wo.vendorName && <p className="text-amber-600 dark:text-amber-400">Vendor: {wo.vendorName}</p>}
                </div>
                <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                  <p className="font-semibold text-muted-foreground uppercase text-[10px]">SLA & Schedule</p>
                  <p>Scheduled: {wo.scheduledDate}</p>
                  <p>Due: <strong className="text-foreground">{wo.dueDate}</strong> ({wo.slaMinutes} min SLA)</p>
                  {wo.completedAt && <p className="text-emerald-600 font-medium">Completed: {new Date(wo.completedAt).toLocaleString()}</p>}
                </div>
                <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                  <p className="font-semibold text-muted-foreground uppercase text-[10px]">Cost Booking</p>
                  <p>Est. Cost: {bdt(wo.estimatedCost)}</p>
                  <p>Parts: {bdt(wo.partsCost)} | Labor: {bdt(wo.laborCost)}</p>
                  <p className="font-bold text-primary">Actual Total: {bdt(wo.actualCost || wo.estimatedCost)}</p>
                </div>
              </div>

              {/* Parts Used */}
              {wo.partsUsed.length > 0 && (
                <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2 text-xs">
                  <p className="font-semibold text-muted-foreground uppercase text-[10px]">Spare Parts Used from Facility Inventory</p>
                  <div className="space-y-1">
                    {wo.partsUsed.map((p) => (
                      <div key={p.id} className="flex justify-between items-center text-xs">
                        <span>• {p.partName} ({p.partCode}) x {p.quantity}</span>
                        <span className="font-mono">{bdt(p.totalCost)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
