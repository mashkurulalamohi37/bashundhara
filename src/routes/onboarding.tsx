import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowLeft,
  User,
  Building2,
  Shield,
  CheckCircle2,
  Loader2,
  Upload,
  Search,
  Home,
  ChevronRight,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { opsStore } from "@/services/opsStore";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create Account — Bashundhara R/A Community Platform" },
      { name: "description", content: "Register for the Bashundhara R/A Smart Community Management Platform." },
    ],
  }),
  component: OnboardingPage,
});

type Step = "account" | "otp" | "profile" | "relationship" | "property" | "claim" | "done";

type RelationshipType =
  | "owner" | "tenant" | "family_member" | "domestic_worker"
  | "property_manager" | "caretaker" | "security_staff" | "maintenance_staff"
  | "service_provider" | "community_staff" | "other";

const RELATIONSHIP_OPTIONS: { type: RelationshipType; label: string; description: string; icon: string }[] = [
  { type: "owner", label: "Property Owner", description: "I own a property in Bashundhara R/A", icon: "🏠" },
  { type: "tenant", label: "Tenant", description: "I rent a flat in Bashundhara R/A", icon: "🔑" },
  { type: "family_member", label: "Family Member", description: "I live with an owner or tenant", icon: "👨‍👩‍👧" },
  { type: "domestic_worker", label: "Domestic Worker", description: "I work in a household in Bashundhara R/A", icon: "🧹" },
  { type: "property_manager", label: "Property Manager", description: "I manage properties on behalf of owners", icon: "📋" },
  { type: "caretaker", label: "Caretaker", description: "I am building caretaker staff", icon: "🛠️" },
  { type: "security_staff", label: "Security Staff", description: "I work in security / gate operations", icon: "🛡️" },
  { type: "maintenance_staff", label: "Maintenance Staff", description: "I handle building maintenance", icon: "⚙️" },
  { type: "service_provider", label: "Service Provider", description: "I provide services to residents", icon: "🏪" },
  { type: "community_staff", label: "Community Staff", description: "I am a Welfare Society / admin staff member", icon: "🏛️" },
  { type: "other", label: "Other", description: "Other relationship to the community", icon: "👤" },
];

const MOCK_BLOCKS = ["Block A", "Block B", "Block C", "Block D", "Block E", "Block F", "Block G", "Block H", "Block J", "Block K", "Block L", "Block M"];
const MOCK_ROADS: Record<string, string[]> = {
  "Block A": ["Road 1", "Road 2", "Road 3", "Road 4", "Road 5"],
  "Block B": ["Road 6", "Road 7", "Road 8"],
  "Block C": ["Road 9", "Road 10", "Road 11"],
  "Block D": ["Road 12", "Road 13"],
  "Block E": ["Road 14", "Road 15", "Road 16"],
};
const MOCK_BUILDINGS: Record<string, string[]> = {
  "Road 5": ["Meghna Tower", "Surma Residency", "Padma Heights A"],
  "Road 8": ["Padma Residence", "Sylhet Tower"],
  "Road 11": ["Jamuna Heights", "Karnaphuli Plaza"],
};
const MOCK_FLATS: Record<string, string[]> = {
  "Meghna Tower": ["A-1", "A-2", "A-3", "A-4", "B-1", "B-2", "C-1"],
  "Padma Residence": ["A-1", "A-2", "B-1", "B-7"],
  "Jamuna Heights": ["A-1", "C-2", "D-1"],
};

function StepDots({ steps, current }: { steps: Step[]; current: Step }) {
  const idx = steps.indexOf(current);
  return (
    <div className="flex gap-1.5">
      {steps.map((s, i) => (
        <div
          key={s}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i < idx ? "w-5 bg-primary" : i === idx ? "w-7 bg-primary" : "w-2 bg-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("account");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  // Account
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // OTP
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Profile
  const [fullName, setFullName] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [language, setLanguage] = useState<"en" | "bn">("en");

  // Relationship
  const [relationship, setRelationship] = useState<RelationshipType | null>(null);

  // Property search
  const [block, setBlock] = useState("");
  const [road, setRoad] = useState("");
  const [building, setBuilding] = useState("");
  const [flat, setFlat] = useState("");
  const [docs, setDocs] = useState<string[]>([]);

  // Claim result
  const [claimId, setClaimId] = useState("");

  const steps: Step[] = ["account", "otp", "profile", "relationship", "property", "claim", "done"];

  function next() {
    setStep((prev) => {
      const i = steps.indexOf(prev);
      return steps[i + 1] ?? "done";
    });
  }

  async function handleSendOtp() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 800));
    setOtpSent(true);
    setBusy(false);
  }

  async function handleVerifyOtp() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    setBusy(false);
    if (otp.length === 6) next();
  }

  async function handleSubmitClaim() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    // Create a property claim in the ops store
    const claim = opsStore.submitClaim({
      applicant: fullName,
      phone,
      block,
      road,
      building,
      flat,
      relationship: relationship ?? "other",
      documents: docs.length > 0 ? docs : ["NID copy.pdf", "Supporting document.pdf"],
    });
    setClaimId(claim.id);
    setBusy(false);
    next();
  }

  const skipProperty = !["owner", "tenant", "property_manager"].includes(relationship ?? "");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded bg-primary text-sm font-bold text-primary-foreground">BR</span>
          <span className="hidden text-sm font-semibold sm:block">Bashundhara R/A</span>
        </Link>
        <StepDots steps={steps} current={step} />
        <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground">
          Already have an account? Sign in
        </Link>
      </header>

      <main className="mx-auto max-w-lg px-4 py-12">
        {/* Step: Account */}
        {step === "account" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Create your account</h1>
              <p className="mt-1 text-sm text-muted-foreground">Start with your phone number and email address.</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="onb-phone">Mobile Phone number</Label>
                <div className="relative mt-1.5 flex items-center">
                  <span className="inline-flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-xs font-semibold text-muted-foreground">
                    🇧🇩 +880
                  </span>
                  <Input
                    id="onb-phone"
                    className="rounded-l-none pl-3 font-mono"
                    placeholder="1711-234567"
                    value={phone.replace(/^\+?880/, "")}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setPhone(raw ? `+880${raw}` : "");
                    }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Used for SMS verification and gate security passes.</p>
              </div>
              <div>
                <Label htmlFor="onb-email">Email address</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input id="onb-email" type="email" className="pl-9" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="onb-pw">Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input id="onb-pw" type={showPw ? "text" : "password"} className="pl-9 pr-9" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" className="absolute right-3 top-2.5 text-muted-foreground" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </div>
            <Button className="w-full" disabled={!phone || !email || password.length < 6} onClick={next}>
              Continue <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        )}

        {/* Step: OTP */}
        {step === "otp" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Verify your phone</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {otpSent ? `A 6-digit code was sent to ${phone}. (Demo: enter any 6 digits)` : `We will send a code to ${phone}.`}
              </p>
            </div>
            {!otpSent ? (
              <Button className="w-full" onClick={handleSendOtp} disabled={busy}>
                {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Send verification code
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="onb-otp">6-digit code</Label>
                  <Input id="onb-otp" className="mt-1.5 text-center text-xl tracking-[0.5em]" maxLength={6} placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => { setOtpSent(false); setOtp(""); }}>Resend code</Button>
                  <Button className="flex-1" disabled={otp.length !== 6 || busy} onClick={handleVerifyOtp}>
                    {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Verify
                  </Button>
                </div>
                <p className="text-center text-xs text-muted-foreground">Demo environment — OTP is not actually sent via SMS.</p>
              </div>
            )}
            <Button variant="ghost" className="w-full" onClick={() => setStep("account")}>
              <ArrowLeft className="mr-2 size-4" /> Back
            </Button>
          </div>
        )}

        {/* Step: Profile */}
        {step === "profile" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Your personal profile</h1>
              <p className="mt-1 text-sm text-muted-foreground">This information is used for verification and identity.</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="onb-name">Full name</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input id="onb-name" className="pl-9" placeholder="e.g. Tanvir Hasan" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="onb-emergency">Emergency contact number</Label>
                <Input id="onb-emergency" className="mt-1.5" placeholder="+8801XXXXXXXXX" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
              </div>
              <div>
                <Label>Preferred language</Label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {[["en", "English"], ["bn", "বাংলা"]].map(([l, label]) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLanguage(l as "en" | "bn")}
                      className={cn(
                        "rounded-md border py-2.5 text-sm font-medium transition-all",
                        language === l ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Button className="w-full" disabled={!fullName} onClick={next}>
              Continue <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep("otp")}>
              <ArrowLeft className="mr-2 size-4" /> Back
            </Button>
          </div>
        )}

        {/* Step: Relationship */}
        {step === "relationship" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Your relationship to the community</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Selecting a relationship starts the relevant onboarding flow. This does not automatically grant access — verification is required.
              </p>
            </div>
            <div className="space-y-2">
              {RELATIONSHIP_OPTIONS.map((r) => (
                <button
                  key={r.type}
                  type="button"
                  onClick={() => setRelationship(r.type)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all",
                    relationship === r.type
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border hover:border-muted-foreground",
                  )}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                  {relationship === r.type && <CheckCircle2 className="ml-auto shrink-0 size-5 text-primary" />}
                </button>
              ))}
            </div>
            <Button className="w-full" disabled={!relationship} onClick={() => {
              if (skipProperty) {
                // Non-property roles go to a simplified completion
                setStep("done");
              } else {
                next();
              }
            }}>
              Continue <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep("profile")}>
              <ArrowLeft className="mr-2 size-4" /> Back
            </Button>
          </div>
        )}

        {/* Step: Property */}
        {step === "property" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Find your property</h1>
              <p className="mt-1 text-sm text-muted-foreground">Search for your flat in Bashundhara Residential Area.</p>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <Home className="size-3.5" /> Bashundhara R/A
              </div>
              <div>
                <Label>Block</Label>
                <select
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={block}
                  onChange={(e) => { setBlock(e.target.value); setRoad(""); setBuilding(""); setFlat(""); }}
                >
                  <option value="">Select block…</option>
                  {MOCK_BLOCKS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              {block && (
                <div>
                  <Label>Road</Label>
                  <select
                    className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={road}
                    onChange={(e) => { setRoad(e.target.value); setBuilding(""); setFlat(""); }}
                  >
                    <option value="">Select road…</option>
                    {(MOCK_ROADS[block] ?? Object.values(MOCK_ROADS).flat().slice(0, 4)).map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              )}
              {road && (
                <div>
                  <Label>Building / House</Label>
                  <select
                    className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={building}
                    onChange={(e) => { setBuilding(e.target.value); setFlat(""); }}
                  >
                    <option value="">Select building…</option>
                    {(MOCK_BUILDINGS[road] ?? ["Building 1", "Building 2", "Building 3"]).map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}
              {building && (
                <div>
                  <Label>Flat / Unit</Label>
                  <select
                    className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={flat}
                    onChange={(e) => setFlat(e.target.value)}
                  >
                    <option value="">Select flat…</option>
                    {(MOCK_FLATS[building] ?? ["F-1", "F-2", "F-3", "F-4"]).map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              )}
            </div>

            {flat && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <CheckCircle2 className="size-4" />
                  Property found
                </div>
                <p className="mt-1 text-sm">
                  Flat <strong>{flat}</strong>, {building}, {road}, {block}, Bashundhara R/A
                </p>
              </div>
            )}

            <Button className="w-full" disabled={!flat} onClick={next}>
              Request property access <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep("relationship")}>
              <ArrowLeft className="mr-2 size-4" /> Back
            </Button>
          </div>
        )}

        {/* Step: Claim */}
        {step === "claim" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Submit property access request</h1>
              <p className="mt-1 text-sm text-muted-foreground">Upload supporting documents to verify your relationship to the property.</p>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Property claim summary</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <span className="text-muted-foreground">Applicant</span><span className="font-medium">{fullName}</span>
                <span className="text-muted-foreground">Property</span><span className="font-medium">Flat {flat}, {building}</span>
                <span className="text-muted-foreground">Block / Road</span><span className="font-medium">{road}, {block}</span>
                <span className="text-muted-foreground">Relationship</span>
                <span><Badge variant="secondary" className="text-xs capitalize">{relationship?.replace(/_/g, " ")}</Badge></span>
              </div>
            </div>

            <div>
              <Label>Supporting documents</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">Upload NID copy, deed / tenancy agreement, or other relevant documents.</p>
              <div className="mt-2 space-y-2">
                {docs.map((d, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
                    <span className="text-xs text-muted-foreground">{d}</span>
                    <button type="button" className="text-destructive text-xs hover:underline" onClick={() => setDocs(docs.filter((_, j) => j !== i))}>Remove</button>
                  </div>
                ))}
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  onClick={() => setDocs([...docs, `Document_${docs.length + 1}.pdf`])}
                >
                  <Upload className="size-4" /> Add document (mock)
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
              <AlertCircle className="mb-1 inline size-3.5 mr-1" />
              Uploading documents does not automatically prove ownership. The Welfare Society team will review and verify your claim.
            </div>

            <Button className="w-full" onClick={handleSubmitClaim} disabled={busy}>
              {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Submit property access request
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep("property")}>
              <ArrowLeft className="mr-2 size-4" /> Back
            </Button>
          </div>
        )}

        {/* Step: Done */}
        {step === "done" && (
          <div className="space-y-8 text-center">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-primary/10">
              <CheckCircle2 className="size-10 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Account created!</h1>
              {claimId ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Your account has been created and your property access request <strong className="text-foreground">{claimId}</strong> is now
                  <strong className="text-amber-600 dark:text-amber-400"> Pending Verification</strong>. The Welfare Society team will review your claim and notify you within 1–2 working days.
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Welcome to Bashundhara R/A, {fullName}. Your account has been created. Please wait for your access to be verified by the community administration.
                </p>
              )}
            </div>

            {claimId && (
              <div className="rounded-lg border border-border bg-card p-4 text-left">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">What happens next</p>
                <ul className="mt-3 space-y-2.5">
                  {[
                    ["Pending verification", "Your claim is queued for review", "text-amber-600"],
                    ["Identity check", "Admin will verify your NID and documents", "text-muted-foreground"],
                    ["Property cross-check", "Claim checked against welfare society records", "text-muted-foreground"],
                    ["Approval notification", "You will be notified via SMS and email", "text-muted-foreground"],
                  ].map(([t, d, c]) => (
                    <li key={t} className="flex items-start gap-2.5">
                      <ChevronRight className={`mt-0.5 size-3.5 shrink-0 ${c}`} />
                      <div>
                        <p className="text-xs font-medium">{t}</p>
                        <p className="text-xs text-muted-foreground">{d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={() => navigate({ to: "/login" })}>
                Sign in to your account
              </Button>
              <Button className="flex-1" onClick={() => navigate({ to: "/property-claims" })}>
                View my claim <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
