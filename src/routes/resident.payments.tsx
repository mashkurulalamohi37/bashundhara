import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CreditCard, CheckCircle2, Download, Receipt, ArrowUpRight, ShieldCheck, X, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Section, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { invoiceService } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { bdt } from "@/lib/format";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/resident/payments")({
  head: () => ({
    meta: [
      { title: "Bills & Payments — Bashundhara R/A" },
      { name: "description", content: "Service charge, utility and maintenance bills for your flat with instant bKash, Nagad, and Card payments." },
    ],
  }),
  component: ResidentPaymentsPage,
});

function ResidentPaymentsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const propertyId = user?.propertyId ?? "PRP-0007";

  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "card">("bkash");
  const [phoneNumber, setPhoneNumber] = useState("01711000008");
  const [pin, setPin] = useState("");
  const [paidReceipt, setPaidReceipt] = useState<any | null>(null);

  const { data: allInvoices = [], isLoading } = useQuery({
    queryKey: ["resident-payments", propertyId],
    queryFn: () => invoiceService.all(),
  });

  const invoices = useMemo(() => {
    return allInvoices.filter((r: any) => r.propertyId === propertyId || !r.propertyId);
  }, [allInvoices, propertyId]);

  // Total Outstanding dues calculation
  const totalDues = useMemo(() => {
    return invoices
      .filter((i: any) => i.status !== "paid")
      .reduce((sum: number, i: any) => sum + (Number(i.amount) - Number(i.paid ?? 0)), 0);
  }, [invoices]);

  const payMutation = useMutation({
    mutationFn: async (invoice: any) => {
      const updated = {
        ...invoice,
        paid: Number(invoice.amount),
        status: "paid",
        paidDate: new Date().toISOString().slice(0, 10),
        transactionId: `TRX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        paymentMethod,
      };
      return await invoiceService.update(invoice.id, updated);
    },
    onSuccess: (updated) => {
      toast.success("Payment Completed Successfully!", {
        description: `BDT ${updated.amount} received via ${paymentMethod.toUpperCase()}. Transaction ID: ${updated.transactionId}`,
      });
      void qc.invalidateQueries({ queryKey: ["resident-payments", propertyId] });
      setSelectedInvoice(null);
      setPaidReceipt(updated);
      setPin("");
    },
  });

  return (
    <>
      <PageHeader
        title="Bills & Payments"
        description="Every monthly service charge, utility allocation, and maintenance billing raised against Flat 4B, Meghna Tower."
        breadcrumb={["Resident", "Payments"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Balance Overview Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-primary/20 bg-card p-5 space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Current Outstanding Dues</span>
            <div className="font-mono text-2xl font-bold text-primary">{bdt(totalDues)}</div>
            <p className="text-[11px] text-muted-foreground">Due by 10th of every calendar month</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Flat & Resident</span>
            <div className="font-semibold text-base text-foreground">{user?.name ?? "Tanvir Hasan"}</div>
            <p className="text-[11px] text-muted-foreground">Flat 4B · Meghna Tower · {user?.block ?? "Block A"}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Payment Channels</span>
            <div className="flex items-center gap-2 pt-0.5">
              <Badge className="bg-pink-600 text-white hover:bg-pink-700 text-[10px]">bKash</Badge>
              <Badge className="bg-orange-600 text-white hover:bg-orange-700 text-[10px]">Nagad</Badge>
              <Badge variant="outline" className="text-[10px]">Visa / Master</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">Zero convenience fee on community bills</p>
          </div>
        </div>

        {/* Invoices & Dues Table */}
        <Section title="Bills & Payment History" description="Official monthly invoices and settlement records">
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <div className="divide-y divide-border min-w-[700px] text-xs">
              <div className="grid grid-cols-6 gap-2 bg-muted/60 p-3 font-semibold text-muted-foreground">
                <span>Invoice No.</span>
                <span>Bill Description</span>
                <span>Due Date</span>
                <span>Total Amount</span>
                <span>Payment Status</span>
                <span className="text-right">Action</span>
              </div>
              {invoices.map((inv: any) => (
                <div key={inv.id} className="grid grid-cols-6 gap-2 p-3 items-center hover:bg-muted/20 transition-colors">
                  <span className="font-mono font-semibold text-foreground">{inv.id}</span>
                  <div className="space-y-0.5">
                    <span className="font-medium capitalize text-foreground">{String(inv.head).replace(/_/g, " ")}</span>
                    <span className="block text-[10px] text-muted-foreground">{inv.issueDate ?? "2026-08-01"}</span>
                  </div>
                  <span className="text-muted-foreground">{inv.dueDate}</span>
                  <span className="font-mono font-bold text-foreground">{bdt(Number(inv.amount))}</span>
                  <div>
                    <StatusBadge value={inv.status} />
                  </div>
                  <div className="text-right">
                    {inv.status === "paid" ? (
                      <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1 text-emerald-600" onClick={() => setPaidReceipt(inv)}>
                        <Receipt className="size-3" /> Receipt
                      </Button>
                    ) : (
                      <Button size="sm" className="h-7 text-[10px] gap-1" onClick={() => setSelectedInvoice(inv)}>
                        <CreditCard className="size-3" /> Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* Payment Gateway Checkout Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">Secure Payment Checkout</h3>
              </div>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setSelectedInvoice(null)}><X className="size-4" /></Button>
            </div>

            <div className="rounded-xl bg-muted/40 p-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Bill:</span>
                <span className="font-medium text-foreground capitalize">{String(selectedInvoice.head).replace(/_/g, " ")} ({selectedInvoice.id})</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Due Amount:</span>
                <span className="font-mono font-bold text-primary text-sm">{bdt(Number(selectedInvoice.amount))}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Select Payment Gateway</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bkash")}
                  className={`rounded-xl border p-3 text-center transition-all ${paymentMethod === "bkash" ? "border-pink-600 bg-pink-500/10 font-bold text-pink-600" : "border-border hover:bg-muted/30"}`}
                >
                  <span className="block text-xs">bKash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("nagad")}
                  className={`rounded-xl border p-3 text-center transition-all ${paymentMethod === "nagad" ? "border-orange-600 bg-orange-500/10 font-bold text-orange-600" : "border-border hover:bg-muted/30"}`}
                >
                  <span className="block text-xs">Nagad</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`rounded-xl border p-3 text-center transition-all ${paymentMethod === "card" ? "border-primary bg-primary/10 font-bold text-primary" : "border-border hover:bg-muted/30"}`}
                >
                  <span className="block text-xs">Visa / Card</span>
                </button>
              </div>
            </div>

            {/* Wallet / Card Inputs */}
            <div className="space-y-3 text-xs">
              <div>
                <Label className="text-xs">{paymentMethod === "card" ? "Card Number" : `${paymentMethod.toUpperCase()} Account Number`}</Label>
                <Input className="mt-1 font-mono" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">{paymentMethod === "card" ? "CVV / Security Code" : `${paymentMethod.toUpperCase()} PIN`}</Label>
                <Input type="password" required className="mt-1 font-mono tracking-widest" placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedInvoice(null)}>Cancel</Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={payMutation.isPending || !pin}
                onClick={() => payMutation.mutate(selectedInvoice)}
              >
                {payMutation.isPending ? "Processing..." : `Confirm & Pay ${bdt(Number(selectedInvoice.amount))}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Receipt Modal */}
      {paidReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-emerald-500/30 bg-card p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Official Payment Receipt</span>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setPaidReceipt(null)}><X className="size-4" /></Button>
            </div>

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground">Payment Verified</h3>
              <div className="font-mono text-2xl font-black text-emerald-600">{bdt(Number(paidReceipt.amount))}</div>
              <p className="text-xs text-muted-foreground capitalize">{String(paidReceipt.head).replace(/_/g, " ")}</p>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-3 text-left space-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receipt No:</span>
                <span className="text-foreground">{paidReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Txn ID:</span>
                <span className="text-foreground">{paidReceipt.transactionId ?? "TRX-829A1X"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="text-foreground">{paidReceipt.paidDate ?? "2026-08-17"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Flat:</span>
                <span className="text-foreground">Flat 4B · Meghna Tower</span>
              </div>
            </div>

            <Button className="w-full text-xs gap-1.5" onClick={() => {
              toast.success("Downloading Official Receipt PDF...");
              setPaidReceipt(null);
            }}>
              <Download className="size-3.5" /> Download PDF Receipt
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
