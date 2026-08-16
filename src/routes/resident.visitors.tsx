import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  QrCode, Share2, Plus, Phone, Calendar, UserCheck, ShieldCheck, X, Copy, Check
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Section, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { visitorService } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/resident/visitors")({
  head: () => ({
    meta: [
      { title: "Visitors & Gate Passes — Bashundhara R/A" },
      { name: "description", content: "Invite guests, generate instant QR gate passes and view access entry history for your flat." },
    ],
  }),
  component: ResidentVisitorsPage,
});

function ResidentVisitorsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const propertyId = user?.propertyId ?? "PRP-0007";

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("guest");
  const [purpose, setPurpose] = useState("Family visit");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const { data: allVisitors = [], isLoading } = useQuery({
    queryKey: ["resident-visitors", propertyId],
    queryFn: () => visitorService.all(),
  });

  const visitors = useMemo(() => {
    return allVisitors.filter((r: any) => r.propertyId === propertyId || !r.propertyId);
  }, [allVisitors, propertyId]);

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      const newVisitor = {
        name,
        phone,
        category,
        purpose,
        date,
        gate: "Gate 1 (300 Feet)",
        passCode: `PASS-${pin}`,
        otp: pin,
        status: "approved",
        propertyId,
        block: user?.block ?? "Block A",
        createdAt: new Date().toISOString(),
      };
      return await visitorService.create(newVisitor as any);
    },
    onSuccess: (newPass) => {
      toast.success("Visitor Gate Pass Generated!", {
        description: `Pass code PASS-${newPass.otp ?? "883921"} ready to share with ${name}.`,
      });
      void qc.invalidateQueries({ queryKey: ["resident-visitors", propertyId] });
      setShowInviteModal(false);
      setSelectedPass(newPass);
      setName("");
      setPhone("");
    },
  });

  const handleCopyPass = () => {
    if (!selectedPass) return;
    const text = `*Bashundhara R/A Digital Gate Pass*\nVisitor: ${selectedPass.name}\nHost: ${user?.name ?? "Tanvir Hasan"} (Flat 4B, Meghna Tower)\nDate: ${selectedPass.date}\nGate OTP: *${selectedPass.otp ?? "883921"}*\nGate: Gate 1 (Kuril / 300ft)`;
    void navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Pass copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <PageHeader
        title="Visitor Passes & Gate Access"
        description="Pre-approve guests, delivery drivers, and service technicians with instant 6-digit OTPs and QR codes for seamless gate entry."
        breadcrumb={["Resident", "Visitors"]}
        actions={
          <Button size="sm" onClick={() => setShowInviteModal(true)}>
            <Plus className="mr-1.5 size-4" /> Pre-Approve Visitor
          </Button>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Visitors Table */}
        <Section title="Expected & Recent Visitors" description="Live access approval status at Bashundhara security gates">
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <div className="divide-y divide-border min-w-[700px] text-xs">
              <div className="grid grid-cols-6 gap-2 bg-muted/60 p-3 font-semibold text-muted-foreground">
                <span>Visitor Name</span>
                <span>Category & Phone</span>
                <span>Purpose</span>
                <span>Visit Date</span>
                <span>Pass OTP</span>
                <span className="text-right">Actions</span>
              </div>
              {visitors.map((v: any) => (
                <div key={v.id ?? v.passCode} className="grid grid-cols-6 gap-2 p-3 items-center hover:bg-muted/20 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground">{v.name}</span>
                    <span className="block text-[10px] text-muted-foreground">{v.gate ?? "Gate 1"}</span>
                  </div>
                  <div>
                    <Badge variant="outline" className="capitalize text-[10px]">{v.category}</Badge>
                    <span className="block text-[10px] text-muted-foreground mt-0.5">{v.phone}</span>
                  </div>
                  <span className="text-foreground">{v.purpose}</span>
                  <span className="text-muted-foreground">{v.date}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-primary">{v.otp ?? "883921"}</span>
                    <StatusBadge value={v.status ?? "approved"} />
                  </div>
                  <div className="text-right">
                    <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => setSelectedPass(v)}>
                      <QrCode className="size-3" /> View Pass
                    </Button>
                  </div>
                </div>
              ))}
              {visitors.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No visitors invited yet. Click "Pre-Approve Visitor" above.
                </div>
              )}
            </div>
          </div>
        </Section>
      </div>

      {/* Invite Visitor Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              inviteMutation.mutate();
            }}
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-semibold text-base">Pre-Approve Visitor</h3>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowInviteModal(false)}><X className="size-4" /></Button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <Label className="text-xs">Visitor Full Name *</Label>
                <Input required className="mt-1" placeholder="e.g. Mahfuz Ahmed" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Phone Number *</Label>
                <Input required className="mt-1" placeholder="+88017..." value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Category</Label>
                  <select
                    className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="guest">Guest</option>
                    <option value="family">Family</option>
                    <option value="delivery">Delivery</option>
                    <option value="service">Service Tech</option>
                    <option value="driver">Driver</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Visit Date</Label>
                  <Input type="date" className="mt-1" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Purpose of Visit</Label>
                <Input className="mt-1" placeholder="e.g. Dinner invitation / parcel delivery" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowInviteModal(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? "Generating..." : "Issue Digital Pass"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Digital Pass Presentation Modal */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-primary/30 bg-card p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gate Access Pass</span>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setSelectedPass(null)}><X className="size-4" /></Button>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground">{selectedPass.name}</h3>
              <p className="text-xs text-muted-foreground">{selectedPass.phone} · <span className="capitalize">{selectedPass.category}</span></p>
            </div>

            {/* QR Mock Tile */}
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-xl bg-white p-3 shadow-inner border border-border">
              <div className="text-black text-center space-y-1">
                <QrCode className="size-20 mx-auto text-black" />
                <span className="block font-mono text-[9px] font-bold text-neutral-800">SCAN AT GATE 1</span>
              </div>
            </div>

            {/* OTP Code Box */}
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-3 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Security Gate OTP</span>
              <div className="font-mono text-2xl font-black tracking-widest text-primary">
                {selectedPass.otp ?? "883921"}
              </div>
              <p className="text-[10px] text-muted-foreground">Valid for Flat 4B, Meghna Tower on {selectedPass.date}</p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button className="w-full text-xs gap-1.5" variant="outline" onClick={handleCopyPass}>
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                {copied ? "Copied!" : "Copy Pass Info"}
              </Button>
              <Button className="w-full text-xs gap-1.5" onClick={() => {
                handleCopyPass();
                window.open(`https://wa.me/?text=${encodeURIComponent(`Bashundhara Gate Pass for ${selectedPass.name}: OTP is ${selectedPass.otp ?? "883921"}`)}`, "_blank");
              }}>
                <Share2 className="size-3.5" /> Share
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
