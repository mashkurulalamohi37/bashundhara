import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { DEMO_ACCOUNTS, ROLE_LABELS } from "@/services/authService";
import { humanizeError } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Bashundhara R/A Community Platform" },
      { name: "description", content: "Secure sign in for residents, administrators and security staff of Bashundhara Residential Area." },
      { property: "og:title", content: "Sign in — Bashundhara R/A" },
      { property: "og:description", content: "Secure access to the Bashundhara R/A smart community management platform." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, loginAs, isAuthenticated, user, ready } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("admin@bashundhara-ra.test");
  const [password, setPassword] = useState("demo1234");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready || !isAuthenticated) return;
    void navigate({ to: user?.role === "resident" ? "/resident/dashboard" : "/dashboard", replace: true });
  }, [ready, isAuthenticated, user, navigate]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded bg-sidebar-primary text-sidebar-primary-foreground">
            <Shield className="size-5" />
          </span>
          <span>
            <span className="block font-semibold text-sidebar-accent-foreground">Bashundhara R/A</span>
            <span className="block text-xs uppercase tracking-widest text-sidebar-foreground/50">
              Smart Community Platform
            </span>
          </span>
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-semibold leading-tight text-sidebar-accent-foreground">
            One secure operating system for 18,000+ residents.
          </h2>
          <p className="text-sm text-sidebar-foreground/70">
            Gate security, visitor management, resident services, maintenance operations and community
            finance — unified for Bashundhara Residential Area, Dhaka.
          </p>
          <dl className="grid grid-cols-3 gap-4 border-t border-sidebar-border pt-6 text-sidebar-foreground/70">
            {[
              ["18,420", "Residents"],
              ["6", "Gates"],
              ["248", "CCTV"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="text-xl font-semibold text-sidebar-accent-foreground tabular-nums">{v}</dt>
                <dd className="text-xs uppercase tracking-wide">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="text-xs text-sidebar-foreground/40">
          © {new Date().getFullYear()} Bashundhara R/A Welfare Society · Demo environment
        </p>
      </section>

      <section className="flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-semibold">Sign in to your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use your registered phone number or email address.
          </p>

          <form
            className="mt-6 space-y-4"
            noValidate
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              if (!identifier.trim() || !password) {
                setError("Enter both your phone/email and password.");
                return;
              }
              setBusy(true);
              try {
                const u = await login(identifier, password);
                toast.success(`Welcome back, ${u.name}`);
                void navigate({ to: u.role === "resident" ? "/resident/dashboard" : "/dashboard", replace: true });
              } catch (err) {
                setError(humanizeError(err));
              } finally {
                setBusy(false);
              }
            }}
          >
            <div>
              <Label htmlFor="identifier" className="mb-1.5 block text-xs">Phone or email</Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="+8801XXXXXXXXX"
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="password" className="mb-1.5 block text-xs">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error ? (
              <p role="alert" className="rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-8 rounded-md border border-border bg-muted/40 p-3">
            <p className="text-xs font-medium">Demo accounts — one click sign in</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Password for all accounts: demo1234</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="truncate rounded border border-border bg-card px-2 py-1.5 text-left text-[11px] hover:bg-accent"
                  onClick={async () => {
                    const u = await loginAs(a.role);
                    void navigate({ to: u.role === "resident" ? "/resident/dashboard" : "/dashboard", replace: true });
                  }}
                >
                  {ROLE_LABELS[a.role]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}