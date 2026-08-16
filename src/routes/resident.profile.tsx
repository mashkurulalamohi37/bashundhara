import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/app/primitives";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/resident/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Bashundhara R/A" },
      { name: "description", content: "Your resident profile, flat linkage, contact details, language preference and session controls." },
      { property: "og:title", content: "My Profile — Bashundhara R/A" },
      { property: "og:description", content: "Resident account and preferences for the Bashundhara R/A portal." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { locale, setLocale } = useI18n();

  return (
    <>
      <PageHeader title="My Profile" description="Account details and preferences." breadcrumb={["Resident", "Profile"]} />
      <div className="space-y-4 p-4 sm:p-6">
        <Section title="Account" description="Linked to your flat record">
          <dl className="divide-y divide-border text-sm">
            {[
              ["Name", user?.name ?? "—"],
              ["Role", user?.role ?? "—"],
              ["Email", user?.email ?? "—"],
              ["Phone", user?.phone ?? "—"],
              ["Block", user?.block ?? "—"],
              ["Property", user?.propertyId ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Preferences" description="Language used across the portal">
          <div className="flex items-center gap-2 p-4">
            <Button size="sm" variant={locale === "en" ? "default" : "outline"} onClick={() => setLocale("en")}>English</Button>
            <Button size="sm" variant={locale === "bn" ? "default" : "outline"} onClick={() => setLocale("bn")}>বাংলা</Button>
          </div>
        </Section>

        <Section title="Session" description="Sign out from this device">
          <div className="p-4">
            <Button variant="destructive" size="sm" onClick={() => void logout().then(() => navigate({ to: "/login", replace: true }))}>
              Sign out
            </Button>
          </div>
        </Section>
      </div>
    </>
  );
}
