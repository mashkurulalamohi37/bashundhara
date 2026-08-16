import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, ShieldCheck, Wallet, Wrench } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bashundhara R/A Smart Community Management Platform" },
      { name: "description", content: "Digital operating system for Bashundhara Residential Area, Dhaka — gate security, resident services, maintenance operations and community finance in one platform." },
      { property: "og:title", content: "Bashundhara R/A Smart Community Platform" },
      { property: "og:description", content: "Security, residents, maintenance and finance unified for 18,000+ residents of Bashundhara R/A." },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  { icon: ShieldCheck, title: "Security & Access", body: "Six gates, visitor pre-approval, vehicle stickers, CCTV health and patrol tracking." },
  { icon: Building2, title: "Residents & Property", body: "Verified resident registry, family units, tenancy records and occupancy across every block." },
  { icon: Wrench, title: "Maintenance Operations", body: "Complaints routed by department with SLA timers, work orders and technician assignment." },
  { icon: Wallet, title: "Community Finance", body: "Service charge billing, bKash/Nagad collections, dues ageing and expenditure control." },
];

function Landing() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded bg-primary text-primary-foreground">
              <ShieldCheck className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold">Bashundhara R/A</span>
              <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">Smart Community Platform</span>
            </span>
          </span>
          <Link to="/login" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Sign in
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">Bashundhara Residential Area, Dhaka</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
          One secure platform for a community of 18,000+ residents.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Gate security, visitor management, property and resident records, maintenance operations,
          community finance and welfare governance — unified in a single enterprise-grade system.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/login" className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
            Open command center
          </Link>
          <Link to="/resident/dashboard" className="rounded-md border border-input px-5 py-2.5 text-sm font-medium hover:bg-accent">
            Resident portal
          </Link>
        </div>

        <dl className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-md border border-border bg-card p-5">
              <p.icon className="size-5 text-primary" />
              <dt className="mt-3 text-sm font-semibold">{p.title}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{p.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Bashundhara R/A Welfare Society · Demo environment
        </div>
      </footer>
    </main>
  );
}
