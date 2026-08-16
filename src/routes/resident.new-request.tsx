/**
 * New Service/Request page with real-time opsStore routing.
 * Shows live routing decision, SLA, and department assignment before submission.
 */
import { useState, useMemo } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Clock,
  Loader2, Package, Sparkles, Shield, Timer, Truck, User, Wrench, Zap,
  AlertTriangle, Building2, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { opsStore, ROUTING_RULES } from "@/services/opsStore";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { RequestType, RequestPriority } from "@/types/ops";

export const Route = createFileRoute("/resident/new-request")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "New Request — Bashundhara R/A" },
      { name: "description", content: "Submit a service request, maintenance complaint, visitor entry, or emergency alert." },
    ],
  }),
  component: NewRequestPage,
});

type RequestCategory = {
  type: RequestType;
  label: string;
  icon: typeof Sparkles;
  categories: string[];
  description: string;
};

const REQUEST_TYPES: RequestCategory[] = [
  {
    type: "service",
    label: "Home Service",
    icon: Sparkles,
    description: "Laundry, AC service, cleaning, plumbing, appliance repair",
    categories: ["Laundry / dry cleaning", "In-home service", "Cleaning", "Pest control", "AC / electrical", "Plumbing", "Carpentry"],
  },
  {
    type: "maintenance",
    label: "Maintenance",
    icon: Wrench,
    description: "Building maintenance, repairs, infrastructure issues",
    categories: ["Plumbing / electrical", "Civil / structural", "Common area", "Lift / elevator", "Generator", "Water tank"],
  },
  {
    type: "visitor",
    label: "Visitor Pass",
    icon: User,
    description: "Invite a guest, family member, or temporary visitor",
    categories: ["Guest", "Family", "Service professional", "Event guest", "Contractor"],
  },
  {
    type: "delivery",
    label: "Delivery",
    icon: Package,
    description: "Courier, food, grocery, or parcel delivery",
    categories: ["Food / grocery delivery", "Courier delivery", "Parcel pickup", "E-commerce"],
  },
  {
    type: "caretaker",
    label: "Caretaker Help",
    icon: Truck,
    description: "Request caretaker assistance for household tasks",
    categories: ["Resident assistance", "Heavy lifting", "Flat errands", "Moving assistance"],
  },
  {
    type: "domestic_worker",
    label: "Domestic Worker",
    icon: User,
    description: "Register or manage your domestic worker's access",
    categories: ["Domestic worker entry", "New domestic worker", "Access update"],
  },
  {
    type: "utility",
    label: "Utility Issue",
    icon: Zap,
    description: "Report utility or community infrastructure issues",
    categories: ["Community infrastructure", "Streetlight", "Water supply", "Common services"],
  },
  {
    type: "emergency",
    label: "Emergency",
    icon: AlertTriangle,
    description: "Medical emergency, fire, security incident",
    categories: ["Emergency response", "Medical", "Fire", "Security incident"],
  },
];

function NewRequestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<"type" | "details" | "review" | "done">("type");
  const [reqType, setReqType] = useState<RequestCategory | null>(null);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<RequestPriority>("normal");
  const [providerName, setProviderName] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<{ id: string; assigneeName: string | null; department: string; slaMinutes: number } | null>(null);

  // Derive routing rule for preview
  const routingRule = useMemo(() => {
    if (!reqType) return null;
    return ROUTING_RULES.find((r) => r.requestType === reqType.type && (category ? r.category === category : true))
      ?? ROUTING_RULES.find((r) => r.requestType === reqType.type)
      ?? null;
  }, [reqType, category]);

  async function handleSubmit() {
    if (!reqType || !title) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    try {
      const req = opsStore.createRequest({
        type: reqType.type,
        category: category || reqType.categories[0],
        title,
        description,
        priority,
        requesterName: user?.name ?? "Resident",
        flatId: "A-3",
        buildingId: "BLD-004",
        block: user?.block ?? "Block A",
        providerName: providerName || null,
        amount: amount ? Number(amount) : 0,
      });
      setCreatedRequest({
        id: req.id,
        assigneeName: req.assigneeName,
        department: req.department,
        slaMinutes: req.slaMinutes,
      });
      toast.success(`Request ${req.id} submitted`, { description: `Routed to ${req.department}` });
      setStep("done");
    } catch {
      toast.error("Failed to submit request. Please try again.");
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/resident/services">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">New Request</h1>
          <p className="text-sm text-muted-foreground">
            {step === "type" ? "What do you need?" :
             step === "details" ? `${reqType?.label} — fill in details` :
             step === "review" ? "Review and submit" :
             "Request submitted!"}
          </p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-1">
        {(["type", "details", "review", "done"] as const).map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={cn(
              "size-7 rounded-full text-xs flex items-center justify-center font-medium",
              s === step ? "bg-primary text-primary-foreground" :
              ["done"].indexOf(step) > ["done"].indexOf(s) || (step === "done" && s !== "done") || (step === "review" && (s === "type" || s === "details")) || (step === "details" && s === "type") ? "bg-primary/20 text-primary" :
              "bg-muted text-muted-foreground",
            )}>
              {i + 1}
            </div>
            {i < 3 && <div className="mx-1 h-px w-8 bg-border" />}
          </div>
        ))}
        <span className="ml-2 text-xs text-muted-foreground capitalize">{step}</span>
      </div>

      {/* Step: Type */}
      {step === "type" && (
        <div className="space-y-3">
          {REQUEST_TYPES.map((rt) => {
            const Icon = rt.icon;
            return (
              <button
                key={rt.type}
                type="button"
                onClick={() => { setReqType(rt); setCategory(""); setStep("details"); }}
                className={cn(
                  "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all hover:border-primary hover:bg-primary/5",
                  rt.type === "emergency" ? "border-red-200 bg-red-50/50 hover:border-red-400 dark:bg-red-950/20" : "border-border bg-card",
                )}
              >
                <div className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-lg",
                  rt.type === "emergency" ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary",
                )}>
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium">{rt.label}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{rt.description}</p>
                </div>
                <ChevronRight className="ml-auto size-4 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {/* Step: Details */}
      {step === "details" && reqType && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <reqType.icon className="size-4 text-primary" />
            <span className="text-sm font-medium">{reqType.label}</span>
            <Button variant="ghost" size="sm" className="ml-auto text-xs" onClick={() => setStep("type")}>Change</Button>
          </div>

          <div>
            <Label>Category</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {reqType.categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-all",
                    category === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="req-title">Request title *</Label>
            <Input
              id="req-title"
              className="mt-1.5"
              placeholder={`e.g. ${reqType.type === "service" ? "Laundry pickup — 10 items" : reqType.type === "maintenance" ? "Kitchen sink leaking" : reqType.type === "visitor" ? "Guest visit — Tanvir Hasan" : "Describe your request"}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="req-desc">Description</Label>
            <textarea
              id="req-desc"
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              rows={3}
              placeholder="Additional details, timing, special instructions…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label>Priority</Label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {(["low", "normal", "high", "urgent"] as RequestPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    "rounded-md border py-2 text-xs font-medium capitalize transition-all",
                    priority === p
                      ? p === "urgent" ? "border-red-400 bg-red-50 text-red-700"
                        : p === "high" ? "border-orange-400 bg-orange-50 text-orange-700"
                        : "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {(reqType.type === "service" || reqType.type === "delivery") && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="req-provider">Provider name (if known)</Label>
                <Input id="req-provider" className="mt-1.5" placeholder="e.g. Clean & Fresh Laundry" value={providerName} onChange={(e) => setProviderName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="req-amount">Expected amount (BDT)</Label>
                <Input id="req-amount" type="number" className="mt-1.5" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
            </div>
          )}

          {/* Live routing preview */}
          {routingRule && title && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                ⚡ Routing preview (live)
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium">{routingRule.department}</span>
                <span className="text-muted-foreground">Assigned role</span>
                <span className="font-medium">{routingRule.assignedRole}</span>
                <span className="text-muted-foreground">SLA</span>
                <span className="font-medium flex items-center gap-1"><Clock className="size-3" />{routingRule.slaMinutes} minutes</span>
                <span className="text-muted-foreground">Handling mode</span>
                <span className="capitalize">{routingRule.handlingMode.replace(/_/g, " ")}</span>
                {routingRule.needsAccessPass && (
                  <>
                    <span className="text-muted-foreground">Access pass</span>
                    <span className="text-amber-600 font-medium flex items-center gap-1"><Shield className="size-3" />Will be issued</span>
                  </>
                )}
              </div>
            </div>
          )}

          <Button className="w-full" disabled={!title || !category} onClick={() => setStep("review")}>
            Review request <ArrowRight className="ml-2 size-4" />
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setStep("type")}>
            <ArrowLeft className="mr-2 size-4" /> Back
          </Button>
        </div>
      )}

      {/* Step: Review */}
      {step === "review" && reqType && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Request summary</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <span className="text-muted-foreground">Type</span><span className="font-medium">{reqType.label}</span>
              <span className="text-muted-foreground">Category</span><span>{category}</span>
              <span className="text-muted-foreground">Title</span><span className="font-medium">{title}</span>
              <span className="text-muted-foreground">Priority</span>
              <span><Badge variant="secondary" className="capitalize text-xs">{priority}</Badge></span>
              <span className="text-muted-foreground">Requester</span><span>{user?.name}</span>
              <span className="text-muted-foreground">Property</span><span>{user?.block ?? "Block A"} · Flat A-3</span>
              {providerName && <><span className="text-muted-foreground">Provider</span><span>{providerName}</span></>}
              {amount && <><span className="text-muted-foreground">Amount</span><span>BDT {Number(amount).toLocaleString("en-BD")}</span></>}
            </div>
            {description && (
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            )}
          </div>

          {routingRule && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Will be routed to</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <span className="text-muted-foreground">Department</span><span className="font-medium">{routingRule.department}</span>
                <span className="text-muted-foreground">Assigned to</span><span className="font-medium">{routingRule.assignedRole}</span>
                <span className="text-muted-foreground">SLA target</span>
                <span className="font-medium flex items-center gap-1"><Timer className="size-3" />{routingRule.slaMinutes} min</span>
                {routingRule.needsAccessPass && (
                  <>
                    <span className="text-muted-foreground">Temporary pass</span>
                    <span className="text-amber-600 font-medium">Auto-issued at gate</span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep("details")} disabled={busy}>
              <ArrowLeft className="mr-2 size-4" /> Edit
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={busy}>
              {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Submit request
            </Button>
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && createdRequest && (
        <div className="space-y-6 text-center">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-primary/10">
            <CheckCircle2 className="size-10 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Request submitted!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-mono font-medium text-foreground">{createdRequest.id}</span> has been routed to <strong>{createdRequest.department}</strong>.
              {createdRequest.assigneeName && <> Assigned to <strong>{createdRequest.assigneeName}</strong>.</>}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              SLA target: {createdRequest.slaMinutes} minutes · You will be notified on status updates.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate({ to: "/resident/services" })}>
              My services
            </Button>
            <Button className="flex-1" onClick={() => {
              setStep("type");
              setReqType(null);
              setTitle("");
              setDescription("");
              setCategory("");
              setPriority("normal");
              setProviderName("");
              setAmount("");
              setCreatedRequest(null);
            }}>
              New request
            </Button>
          </div>
          <Button variant="ghost" className="w-full text-xs text-primary" asChild>
            <Link to="/control/ops-board">View on Ops Board →</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
