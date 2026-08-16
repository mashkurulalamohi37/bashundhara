import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  Bell,
  Smartphone,
  Globe,
  LogOut,
  CheckCircle2,
  Lock,
  Building,
  MapPin,
  Camera,
  History,
  ShieldAlert,
  Laptop,
  Check,
  Edit3,
  Sparkles,
} from "lucide-react";
import { PageHeader, Section } from "@/components/app/primitives";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { ROLE_LABELS, DEMO_ACCOUNTS } from "@/services/authService";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Bashundhara R/A" },
      { name: "description", content: "Personal profile, security settings, active sessions, and preferences." },
    ],
  }),
  component: AdminProfilePage,
});

function AdminProfilePage() {
  const { user, logout, loginAs } = useAuth();
  const navigate = useNavigate();
  const { locale, setLocale } = useI18n();

  // Tab State
  const [activeTab, setActiveTab] = useState<"general" | "security" | "notifications" | "activity">("general");

  // Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "Zahid Hossain");
  const [phone, setPhone] = useState(user?.phone ?? "+8801711000002");
  const [email, setEmail] = useState(user?.email ?? "security.admin@bashundhara-ra.test");

  // Security Toggles
  const [twoFactor, setTwoFactor] = useState(true);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  // Notification Toggles
  const [notifEmergency, setNotifEmergency] = useState(true);
  const [notifGate, setNotifGate] = useState(true);
  const [notifOps, setNotifOps] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  // Personal Recent Activity
  const personalActivity = [
    { id: "ACT-1", action: "Signed in to Security Admin Console", time: "Just now", ip: "103.145.118.22 (Dhaka)", icon: Laptop },
    { id: "ACT-2", action: "Approved Gate 1 Visitor Pass for Flat C-2", time: "2 hours ago", ip: "103.145.118.22", icon: CheckCircle2 },
    { id: "ACT-3", action: "Dispatched Maintenance Team for Streetlight #11", time: "5 hours ago", ip: "103.145.118.22", icon: Shield },
    { id: "ACT-4", action: "Acknowledged Medical SOS alert for Flat C-2", time: "Yesterday at 21:40", ip: "103.145.118.22", icon: ShieldAlert },
    { id: "ACT-5", action: "Updated Block I Access Security Policy", time: "Aug 14, 2026", ip: "103.145.118.22", icon: KeyRound },
  ];

  function handleSaveProfile() {
    setIsEditing(false);
    toast.success("Profile information updated successfully");
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPw.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setPwBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    setPwBusy(false);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    toast.success("Password changed successfully!");
  }

  const roleLabel = user?.role ? ROLE_LABELS[user.role] ?? user.role : "Administrator";

  return (
    <>
      <PageHeader
        title="My Profile"
        description="Manage your identity, security credentials, active sessions, and communication preferences."
        breadcrumb={["System", "Profile"]}
        actions={
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5"
            onClick={() => void logout().then(() => navigate({ to: "/login", replace: true }))}
          >
            <LogOut className="size-3.5" /> Sign Out
          </Button>
        }
      />

      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        {/* Hero Profile Overview Card */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="absolute right-0 top-0 -mr-12 -mt-12 size-48 rounded-full bg-primary/5 blur-2xl" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="grid size-16 sm:size-20 place-items-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 text-2xl font-bold text-white shadow-lg shadow-primary/20">
                  {user?.avatarInitials ?? (user?.name?.slice(0, 2).toUpperCase() || "ZH")}
                </div>
                <button
                  type="button"
                  onClick={() => toast.info("Avatar photo upload (mock)")}
                  className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-card border border-border shadow hover:bg-muted text-muted-foreground hover:text-foreground"
                  title="Change avatar photo"
                >
                  <Camera className="size-3.5" />
                </button>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{user?.name ?? "Zahid Hossain"}</h1>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-semibold gap-1">
                    <Shield className="size-3" /> {roleLabel}
                  </Badge>
                  <Badge variant="outline" className="text-xs text-muted-foreground font-mono">
                    {user?.id ?? "USR-002"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {user?.email ?? "security.admin@bashundhara-ra.test"} · {user?.block ?? "Block I"}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="size-3.5" /> Verified Community Account
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => {
                  if (isEditing) handleSaveProfile();
                  else setIsEditing(true);
                }}
              >
                {isEditing ? <Check className="size-3.5" /> : <Edit3 className="size-3.5" />}
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto custom-scrollbar">
          {[
            { id: "general", label: "Account Info", icon: User },
            { id: "security", label: "Security & Credentials", icon: KeyRound },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "activity", label: "My Activity Log", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all shrink-0",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: General Account Info */}
        {activeTab === "general" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Section title="Personal Information" description="Legal name and contact credentials">
                <div className="p-4 sm:p-5 space-y-4">
                  <div>
                    <Label htmlFor="prof-name">Full Legal Name</Label>
                    <Input
                      id="prof-name"
                      disabled={!isEditing}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prof-phone">Mobile Phone Number</Label>
                      <div className="relative mt-1.5 flex items-center">
                        <Input
                          id="prof-phone"
                          disabled={!isEditing}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="prof-email">Email Address</Label>
                      <Input
                        id="prof-email"
                        disabled={!isEditing}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveProfile}>
                        Save Details
                      </Button>
                    </div>
                  )}
                </div>
              </Section>

              <Section title="Community Location & Assignment" description="Assigned post and residency data">
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div className="rounded-xl border border-border bg-muted/20 p-3">
                      <span className="text-muted-foreground">Block Zone</span>
                      <p className="mt-1 font-bold text-foreground text-sm">{user?.block ?? "Block I"}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-3">
                      <span className="text-muted-foreground">Assigned Facility</span>
                      <p className="mt-1 font-bold text-foreground text-sm">Gate 1 & Command Center</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-3">
                      <span className="text-muted-foreground">Account Authority</span>
                      <p className="mt-1 font-bold text-primary text-sm">{roleLabel}</p>
                    </div>
                  </div>
                </div>
              </Section>
            </div>

            {/* Sidebar quick switch & Language */}
            <div className="space-y-6">
              <Section title="Language Preference" description="Portal UI display language">
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLocale("en");
                        toast.success("Language switched to English");
                      }}
                      className={cn(
                        "rounded-lg border py-2 text-xs font-semibold transition-all",
                        locale === "en" ? "border-primary bg-primary/10 text-primary ring-1 ring-primary" : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLocale("bn");
                        toast.success("ভাষা বাংলায় পরিবর্তন করা হয়েছে");
                      }}
                      className={cn(
                        "rounded-lg border py-2 text-xs font-semibold transition-all",
                        locale === "bn" ? "border-primary bg-primary/10 text-primary ring-1 ring-primary" : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      বাংলা (Bangla)
                    </button>
                  </div>
                </div>
              </Section>

              <Section title="Demo Role Switcher" description="Switch role instantaneously for testing">
                <div className="p-3 space-y-1.5">
                  {DEMO_ACCOUNTS.slice(0, 6).map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={async () => {
                        const u = await loginAs(acc.role);
                        toast.success(`Switched role to ${ROLE_LABELS[acc.role]}`);
                        void navigate({ to: u.role === "resident" ? "/resident/dashboard" : "/profile", replace: true });
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5 text-left text-xs transition-all",
                        user?.role === acc.role
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border hover:bg-muted/60 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span>{ROLE_LABELS[acc.role]}</span>
                      {user?.role === acc.role && <Check className="size-3 text-primary" />}
                    </button>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        )}

        {/* TAB 2: Security & Credentials */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section title="Change Password" description="Update your access password regularly">
              <form onSubmit={handlePasswordChange} className="p-4 sm:p-5 space-y-4">
                <div>
                  <Label htmlFor="cur-pw">Current Password</Label>
                  <Input
                    id="cur-pw"
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="new-pw">New Password</Label>
                  <Input
                    id="new-pw"
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="conf-pw">Confirm New Password</Label>
                  <Input
                    id="conf-pw"
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Confirm new password"
                    className="mt-1.5"
                  />
                </div>
                <Button type="submit" disabled={pwBusy} className="w-full">
                  {pwBusy ? "Updating…" : "Update Password"}
                </Button>
              </form>
            </Section>

            <div className="space-y-6">
              <Section title="Two-Factor Authentication (2FA)" description="Protect account logins with SMS OTP">
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">SMS 2FA Verification</p>
                      <p className="text-[11px] text-muted-foreground">Require 6-digit SMS code on login</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTwoFactor(!twoFactor);
                        toast.success(`2FA has been ${!twoFactor ? "Enabled" : "Disabled"}`);
                      }}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        twoFactor ? "bg-primary" : "bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          twoFactor ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>
                </div>
              </Section>

              <Section title="Active Device Sessions" description="Currently authenticated browsers">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                    <div className="flex items-center gap-3">
                      <Laptop className="size-5 text-primary" />
                      <div>
                        <p className="text-xs font-semibold">Microsoft Edge · Windows 11</p>
                        <p className="text-[11px] text-muted-foreground">Dhaka, Bangladesh · Current active session</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
                      Active Now
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => toast.success("All other sessions signed out")}
                  >
                    Sign Out Other Sessions
                  </Button>
                </div>
              </Section>
            </div>
          </div>
        )}

        {/* TAB 3: Notifications */}
        {activeTab === "notifications" && (
          <Section title="Notification Preferences" description="Choose which real-time alerts you receive">
            <div className="p-4 sm:p-5 space-y-4">
              {[
                { label: "🚨 Emergency & SOS Dispatch Alerts", desc: "Immediate high-priority audio & SMS notifications", state: notifEmergency, setter: setNotifEmergency },
                { label: "🛡️ Gate & Security Pass Notifications", desc: "Visitor arrival, vehicle scan, and delivery pass alerts", state: notifGate, setter: setNotifGate },
                { label: "⚡ Maintenance & Work Order Updates", desc: "Real-time task assignments and SLA escalation alerts", state: notifOps, setter: setNotifOps },
                { label: "📧 Daily Email Summary Digest", desc: "Receive summary of community metrics at 08:00 AM", state: notifEmail, setter: setNotifEmail },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/60 last:border-0">
                  <div>
                    <p className="text-xs font-semibold">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      item.setter(!item.state);
                      toast.success("Notification preferences updated");
                    }}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      item.state ? "bg-primary" : "bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        item.state ? "translate-x-5" : "translate-x-0",
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* TAB 4: Activity Log */}
        {activeTab === "activity" && (
          <Section title="My Activity Timeline" description="Audit log of actions performed under your account">
            <div className="divide-y divide-border/60 p-2">
              {personalActivity.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="flex items-start gap-3 p-3 text-xs">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{act.action}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {act.time} · IP: <span className="font-mono">{act.ip}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}
      </div>
    </>
  );
}
