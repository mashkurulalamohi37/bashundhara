import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select" | "tel" | "email";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  help?: string;
}

export function RecordForm({
  fields,
  submitLabel = "Save",
  onCancel,
  onSubmit,
  busy,
  initial = {},
}: {
  fields: FieldDef[];
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit: (values: Record<string, string>) => void;
  busy?: boolean;
  initial?: Record<string, string>;
}) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  const handle = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    for (const f of fields) {
      const val = (values[f.name] ?? "").trim();
      if (f.required && !val) next[f.name] = `${f.label} is required.`;
      else if (f.type === "tel" && val && !/^\+8801\d{9}$/.test(val))
        next[f.name] = "Use Bangladesh format: +8801XXXXXXXXX";
      else if (f.type === "email" && val && !/^\S+@\S+\.\S+$/.test(val))
        next[f.name] = "Enter a valid email address.";
    }
    setErrors(next);
    if (Object.keys(next).length === 0) onSubmit(values);
  };

  return (
    <form onSubmit={handle} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          const id = `field-${f.name}`;
          const err = errors[f.name];
          return (
            <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : undefined}>
              <Label htmlFor={id} className="mb-1.5 block text-xs">
                {f.label}
                {f.required ? <span className="ml-0.5 text-destructive">*</span> : null}
              </Label>
              {f.type === "select" ? (
                <Select value={values[f.name] ?? ""} onValueChange={(v) => set(f.name, v)}>
                  <SelectTrigger id={id} aria-invalid={!!err}>
                    <SelectValue placeholder={f.placeholder ?? `Select ${f.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {(f.options ?? []).map((o) => (
                      <SelectItem key={o} value={o} className="capitalize">
                        {o.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : f.type === "textarea" ? (
                <Textarea
                  id={id}
                  value={values[f.name] ?? ""}
                  placeholder={f.placeholder}
                  aria-invalid={!!err}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              ) : (
                <Input
                  id={id}
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                  value={values[f.name] ?? ""}
                  placeholder={f.placeholder}
                  aria-invalid={!!err}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
              {err ? (
                <p className="mt-1 text-xs text-destructive">{err}</p>
              ) : f.help ? (
                <p className="mt-1 text-xs text-muted-foreground">{f.help}</p>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}