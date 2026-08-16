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
  Sparkles,
  FileCheck,
  Building,
  Key,
  Users2,
  Wrench,
  Store,
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

const STEP_LABELS: Record<Step, { title: string; subtitle: string }> = {
  account: { title: "Create Account", subtitle: "Start with your phone and email" },
  otp: { title: "SMS Verification", subtitle: "Verify your mobile phone number" },
  profile: { title: "Personal Profile", subtitle: "Tell us your name and preferences" },
  relationship: { title: "Select Community Role", subtitle: "Choose your relationship to Bashundhara R/A" },
  property: { title: "Locate Property", subtitle: "Select your block, building and flat" },
  claim: { title: "Verification Documents", subtitle: "Upload proof of tenancy or ownership" },
  done: { title: "Registration Complete", subtitle: "Your request has been submitted" },
};

type RelationshipType =
  | "owner" | "tenant" | "family_member" | "domestic_worker"
  | "property_manager" | "caretaker" | "security_staff" | "maintenance_staff"
  | "service_provider" | "community_staff" | "other";

interface RoleOption {
  type: RelationshipType;
  label: string;
  description: string;
  icon: string;
  category: "resident" | "staff" | "service";
}

const RELATIONSHIP_OPTIONS: RoleOption[] = [
  { type: "owner", label: "Property Owner", description: "I own a flat or plot in Bashundhara R/A", icon: "🏠", category: "resident" },
  { type: "tenant", label: "Resident Tenant", description: "I rent an apartment or house", icon: "🔑", category: "resident" },
  { type: "family_member", label: "Family Member", description: "I live with a registered resident", icon: "👨‍👩‍👧", category: "resident" },
  { type: "domestic_worker", label: "Domestic Worker", description: "Household staff or driver", icon: "🧹", category: "resident" },

  { type: "property_manager", label: "Property Manager", description: "Managing properties for owners", icon: "📋", category: "staff" },
  { type: "caretaker", label: "Building Caretaker", description: "On-premise building caretaker", icon: "🛠️", category: "staff" },
  { type: "security_staff", label: "Security Staff", description: "Gate security & patrol officer", icon: "🛡️", category: "staff" },
  { type: "maintenance_staff", label: "Maintenance Staff", description: "Electrical, plumbing & HVAC staff", icon: "⚙️", category: "staff" },

  { type: "service_provider", label: "Service Provider", description: "Local vendor or business owner", icon: "🏪", category: "service" },
  { type: "community_staff", label: "Welfare Society Staff", description: "Administration & community staff", icon: "🏛️", category: "service" },
  { type: "other", label: "Other Community Member", description: "Other community association", icon: "👤", category: "service" },
];

const MOCK_BLOCKS = ["Block A", "Block B", "Block C", "Block D", "Block E", "Block F", "Block G", "Block H", "Block I", "Block J", "Block K", "Block L", "Block M"];
const MOCK_ROADS: Record<string, string[]> = {
  "Block A": ["Road 1", "Road 2", "Road 3", "Road 4", "Road 5"],
  "Block B": ["Road 6", "Road 7", "Road 8"],
  "Block C": ["Road 9", "Road 10", "Road 11"],
  "Block D": ["Road 12", "Road 13"],
  "Block E": ["Road 14", "Road 15", "Road 16"],
  "Block I": ["Road 1", "Road 2", "Road 3"],
  "Block J": ["Road 4", "Road 5", "Road 6"],
};
const MOCK_BUILDINGS: Record<string, string[]> = {
  "Road 5": ["Meghna Tower", "Surma Residency", "Padma Heights A"],
  "Road 8": ["Padma Residence", "Sylhet Tower"],
  "Road 11": ["Jamuna Heights", "Karnaphuli Plaza"],
};
const MOCK_FLATS: Record<string, string[]> = {
  "Meghna Tower": ["Flat 3B", "Flat 4A", "Flat 5C", "Flat 6A"],
  "Surma Residency": ["Flat 1A", "Flat 2B", "Flat 3A"],
  "Padma Residence": ["Flat A-1", "Flat B-2", "Flat C-3"],
  "Jamuna Heights": ["Flat 2A", "Flat 4B", "Flat 7C"],
};

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("account");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [roleCategory, setRoleCategory] = useState<"all" | "resident" | "staff" | "service">("all");

  // Form State
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [fullName, setFullName] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [language, setLanguage] = useState<"en" | "bn">("en");

  const [relationship, setRelationship] = useState<RelationshipType | null>(null);

  const [block, setBlock] = useState("Block A");
  const [road, setRoad] = useState("Road 5");
  const [building, setBuilding] = useState("Meghna Tower");
  const [flat, setFlat] = useState("Flat 3B");
  const [docs, setDocs] = useState<string[]>(["NID_Card_Front_Back.pdf", "Tenancy_Agreement_2026.pdf"]);

  const [claimId, setClaimId] = useState("");

  const steps: Step[] = ["account", "otp", "profile", "relationship", "property", "claim", "done"];
  const currentStepIndex = steps.indexOf(step);
  const progressPercent = Math.round(((currentStepIndex) / (steps.length - 1)) * 100);

  function next() {
    setStep((prev) => {
      const i = steps.indexOf(prev);
      return steps[i + 1] ?? "done";
    });
  }

  function prevStep() {
    setStep((prev) => {
      const i = steps.indexOf(prev);
      return i > 0 ? steps[i - 1] : "account";
    });
  }

  function handleQuickFillDemo() {
    setPhone("+8801711234567");
    setEmail("resident@bashundhara-ra.test");
    setPassword("demo1234");
    setFullName("Zahid Hasan");
    setEmergencyContact("+8801711999999");
    setRelationship("tenant");
  }

  async function handleSendOtp() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    setOtpSent(true);
    setBusy(false);
  }

  async function handleVerifyOtp() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 500));
    setBusy(false);
    if (otp.length === 6) next();
  }

  async function handleSubmitClaim() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    const claim = opsStore.submitClaim({
      applicant: fullName,
      phone,
      block,
      road,
      building,
      flat,
      relationship: relationship ?? "resident",
      documents: docs,
    });
    setClaimId(claim.id);
    setBusy(false);
    setStep("done");
  }

  const skipProperty = !["owner", "tenant", "property_manager"].includes(relationship ?? "");

  const filteredRoles = RELATIONSHIP_OPTIONS.filter((r) =>
    roleCategory === "all" ? true : r.category === roleCategory
  );

  return (
    <div className="min-h-screen bg-muted/20 text-foreground flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-md px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-md shadow-primary/20">
              BR
            </span>
            <div>
              <span className="block text-sm font-bold leading-none">Bashundhara R/A</span>
              <span className="block text-[10px] text-muted-foreground">Community Portal</span>
            </div>
          </Link>

          {/* Step Indicator Header */}
          {step !== "done" && (
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-xs font-semibold text-primary">
                Step {currentStepIndex + 1} of {steps.length - 1}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs font-medium text-muted-foreground">
                {STEP_LABELS[step].title}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {step === "account" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex text-xs h-8 gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                onClick={handleQuickFillDemo}
              >
                <Sparkles className="size-3.5" /> Demo Auto-Fill
              </Button>
            )}
            <Link to="/login" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
              Sign in →
            </Link>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        {step !== "done" && (
          <div className="mx-auto mt-2.5 max-w-4xl">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${Math.max(progressPercent, 12)}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Form Container */}
      <main className="mx-auto my-6 sm:my-10 w-full max-w-xl px-4 flex-1">
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-lg shadow-black/[0.03]">

          {/* Step 1: Account Info */}
          {step === "account" && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Get Started</span>
                <h1 className="mt-1 text-2xl font-bold">Create your account</h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Enter your mobile number and email address to get access.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="onb-phone">Mobile Phone Number <span className="text-destructive">*</span></Label>
                  <div className="relative mt-1.5 flex w-full items-center">
                    <span className="inline-flex h-10 shrink-0 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-xs font-semibold text-muted-foreground select-none">
                      🇧🇩 +880
                    </span>
                    <Input
                      id="onb-phone"
                      className="flex-1 min-w-0 rounded-l-none pl-3 font-mono"
                      placeholder="1711-234567"
                      value={phone.replace(/^\+?880/, "")}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setPhone(raw ? `+880${raw}` : "");
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">Used for SMS security passes and community notices.</p>
                </div>

                <div>
                  <Label htmlFor="onb-email">Email Address <span className="text-destructive">*</span></Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="onb-email"
                      type="email"
                      className="pl-9"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="onb-pw">Password <span className="text-destructive">*</span></Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="onb-pw"
                      type={showPw ? "text" : "password"}
                      className="pl-9 pr-9"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPw(!showPw)}
                    >
                      {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  className="w-full h-10 text-sm font-semibold"
                  disabled={!phone || !email || password.length < 6}
                  onClick={next}
                >
                  Continue to SMS Verification <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleQuickFillDemo}
                  className="text-xs text-primary underline-offset-4 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <Sparkles className="size-3" /> Quick fill with demo credentials
                </button>
              </div>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Verification</span>
                <h1 className="mt-1 text-2xl font-bold">Verify your phone</h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  {otpSent
                    ? `A 6-digit OTP has been sent to ${phone}.`
                    : `We will send a one-time verification code to ${phone}.`}
                </p>
              </div>

              {!otpSent ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/40 p-4 text-center">
                    <p className="text-xs text-muted-foreground">Ready to send OTP code to:</p>
                    <p className="mt-1 font-mono text-base font-bold text-foreground">{phone || "+8801711234567"}</p>
                  </div>
                  <Button className="w-full h-10" onClick={handleSendOtp} disabled={busy}>
                    {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Send 6-Digit SMS Code
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="onb-otp" className="text-xs">Enter 6-Digit OTP</Label>
                    <Input
                      id="onb-otp"
                      className="mt-1.5 text-center font-mono text-2xl tracking-[0.4em] font-semibold h-12"
                      maxLength={6}
                      placeholder="••••••"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <button
                      type="button"
                      onClick={() => setOtp("123456")}
                      className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <Sparkles className="size-3" /> Auto-fill test code (123456)
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-muted-foreground hover:underline"
                    >
                      Resend code
                    </button>
                  </div>

                  <Button
                    className="w-full h-10"
                    disabled={otp.length !== 6 || busy}
                    onClick={handleVerifyOtp}
                  >
                    {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Verify & Continue <ArrowRight className="ml-2 size-4" />
                  </Button>
                </div>
              )}

              <Button variant="ghost" className="w-full text-xs" onClick={prevStep}>
                <ArrowLeft className="mr-1.5 size-3.5" /> Back to Account Details
              </Button>
            </div>
          )}

          {/* Step 3: Profile Info */}
          {step === "profile" && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Profile</span>
                <h1 className="mt-1 text-2xl font-bold">Personal Profile</h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Provide your full legal name as it appears on your NID or passport.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="onb-name">Full Legal Name <span className="text-destructive">*</span></Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="onb-name"
                      className="pl-9"
                      placeholder="e.g. Zahid Hasan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="onb-emg">Emergency Contact Number</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="onb-emg"
                      className="pl-9 font-mono"
                      placeholder="+8801XXXXXXXXX"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">Notified only during high-priority security or fire emergencies.</p>
                </div>

                <div>
                  <Label>Preferred Language</Label>
                  <div className="mt-1.5 grid grid-cols-2 gap-3">
                    {[
                      { code: "en", label: "English" },
                      { code: "bn", label: "বাংলা (Bangla)" },
                    ].map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setLanguage(l.code as "en" | "bn")}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition-all",
                          language === l.code
                            ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                        )}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button className="w-full h-10" disabled={!fullName.trim()} onClick={next}>
                  Continue to Role Selection <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button variant="ghost" className="w-full text-xs" onClick={prevStep}>
                  <ArrowLeft className="mr-1.5 size-3.5" /> Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Relationship & Role */}
          {step === "relationship" && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Community Role</span>
                <h1 className="mt-1 text-2xl font-bold">Your relationship to Bashundhara</h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Select your primary role to configure the correct platform privileges and onboarding steps.
                </p>
              </div>

              {/* Role Category Filter Tabs */}
              <div className="flex gap-1.5 border-b border-border pb-2">
                {[
                  { id: "all", label: "All Roles" },
                  { id: "resident", label: "Residents" },
                  { id: "staff", label: "Staff & Management" },
                  { id: "service", label: "Commercial" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRoleCategory(tab.id as any)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      roleCategory === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Scrollable Role Cards */}
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredRoles.map((r) => (
                  <button
                    key={r.type}
                    type="button"
                    onClick={() => setRelationship(r.type)}
                    className={cn(
                      "flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all",
                      relationship === r.type
                        ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-muted/40",
                    )}
                  >
                    <span className="grid size-10 place-items-center rounded-lg bg-card text-2xl shadow-sm">
                      {r.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{r.description}</p>
                    </div>
                    {relationship === r.type && (
                      <CheckCircle2 className="size-5 shrink-0 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  className="w-full h-10 font-semibold"
                  disabled={!relationship}
                  onClick={() => {
                    if (skipProperty) {
                      setStep("done");
                    } else {
                      next();
                    }
                  }}
                >
                  {skipProperty ? "Complete Registration" : "Continue to Property Selection"} <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button variant="ghost" className="w-full text-xs" onClick={prevStep}>
                  <ArrowLeft className="mr-1.5 size-3.5" /> Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Locate Property */}
          {step === "property" && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Property Location</span>
                <h1 className="mt-1 text-2xl font-bold">Select your flat</h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Pick your Block, Road, and Building in Bashundhara Residential Area.
                </p>
              </div>

              {/* Visual Block Selector */}
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">1. Select Block</Label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {MOCK_BLOCKS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setBlock(b);
                        const roads = MOCK_ROADS[b] ?? ["Road 1", "Road 2"];
                        setRoad(roads[0]);
                        const bldgs = MOCK_BUILDINGS[roads[0]] ?? ["Meghna Tower", "Building 2"];
                        setBuilding(bldgs[0]);
                        const flats = MOCK_FLATS[bldgs[0]] ?? ["Flat 1A", "Flat 2B"];
                        setFlat(flats[0]);
                      }}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                        block === b
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Road</Label>
                  <select
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium"
                    value={road}
                    onChange={(e) => {
                      setRoad(e.target.value);
                      const bldgs = MOCK_BUILDINGS[e.target.value] ?? ["Meghna Tower", "Building 2"];
                      setBuilding(bldgs[0]);
                      const flats = MOCK_FLATS[bldgs[0]] ?? ["Flat 1A", "Flat 2B"];
                      setFlat(flats[0]);
                    }}
                  >
                    {(MOCK_ROADS[block] ?? ["Road 1", "Road 2", "Road 5"]).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Building</Label>
                  <select
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium"
                    value={building}
                    onChange={(e) => {
                      setBuilding(e.target.value);
                      const flats = MOCK_FLATS[e.target.value] ?? ["Flat 1A", "Flat 2B"];
                      setFlat(flats[0]);
                    }}
                  >
                    {(MOCK_BUILDINGS[road] ?? ["Meghna Tower", "Surma Residency"]).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label>Flat / Apartment Unit</Label>
                <select
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium"
                  value={flat}
                  onChange={(e) => setFlat(e.target.value)}
                >
                  {(MOCK_FLATS[building] ?? ["Flat 3B", "Flat 4A", "Flat 5C"]).map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Property Summary Badge */}
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Home className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-primary">Selected Property</p>
                  <p className="text-sm font-bold text-foreground">
                    {flat}, {building}, {road}, {block}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button className="w-full h-10 font-semibold" disabled={!flat} onClick={next}>
                  Continue to Document Upload <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button variant="ghost" className="w-full text-xs" onClick={prevStep}>
                  <ArrowLeft className="mr-1.5 size-3.5" /> Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Claim & Documents */}
          {step === "claim" && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Verification</span>
                <h1 className="mt-1 text-2xl font-bold">Upload Verification Documents</h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Provide copies of your NID and tenancy agreement/deed for Welfare Society verification.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Claim Summary</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Applicant:</span>{" "}
                    <span className="font-semibold text-foreground">{fullName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Role:</span>{" "}
                    <span className="font-semibold capitalize text-primary">{relationship?.replace(/_/g, " ")}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Property:</span>{" "}
                    <span className="font-semibold text-foreground">{flat}, {building}, {road}, {block}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Uploaded Documents ({docs.length})</Label>
                <div className="mt-2 space-y-2">
                  {docs.map((docName, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-card px-3.5 py-2.5">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <FileCheck className="size-4 text-primary" />
                        <span>{docName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDocs(docs.filter((_, i) => i !== idx))}
                        className="text-xs text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setDocs([...docs, `Document_${docs.length + 1}_Verified.pdf`])}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-3 text-xs font-semibold text-muted-foreground transition-all hover:border-primary hover:text-primary hover:bg-primary/5"
                  >
                    <Upload className="size-4" /> Add Another Document
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>
                  The Welfare Society will verify your NID and tenancy records within 1–2 business days before granting full resident portal access.
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <Button className="w-full h-10 font-semibold" disabled={busy} onClick={handleSubmitClaim}>
                  {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Submit Property Access Request <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button variant="ghost" className="w-full text-xs" onClick={prevStep}>
                  <ArrowLeft className="mr-1.5 size-3.5" /> Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 7: Done / Confirmation */}
          {step === "done" && (
            <div className="space-y-6 text-center py-4">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                <CheckCircle2 className="size-8 text-primary" />
              </div>

              <div>
                <h1 className="text-2xl font-bold">Registration Submitted!</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Welcome to Bashundhara Residential Area, <strong className="text-foreground">{fullName || "Resident"}</strong>.
                  {claimId ? (
                    <span>
                      {" "}Your property claim ticket is <strong className="text-primary font-mono">{claimId}</strong>.
                    </span>
                  ) : null}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 text-left space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">What Happens Next</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">1</span>
                    <div>
                      <p className="font-semibold">Automated Pre-Verification</p>
                      <p className="text-muted-foreground">Your phone and initial records have been verified.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-700 dark:text-amber-400">2</span>
                    <div>
                      <p className="font-semibold">Society Document Review</p>
                      <p className="text-muted-foreground">Admin staff will review your deed or tenancy agreement.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">3</span>
                    <div>
                      <p className="font-semibold">SMS Activation Notice</p>
                      <p className="text-muted-foreground">You will receive an SMS when your resident portal is fully active.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button variant="outline" className="flex-1 h-10 font-semibold" onClick={() => navigate({ to: "/login" })}>
                  Sign In to Account
                </Button>
                <Button className="flex-1 h-10 font-semibold" onClick={() => navigate({ to: "/property-claims" })}>
                  View Claims Dashboard <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/60 px-4 py-3 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Bashundhara R/A Welfare Society · Smart Community Platform
      </footer>
    </div>
  );
}
