import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { companiesQuery } from "@/lib/queries";
import { useAuth } from "@/hooks/useAuth";

type Kind = "company" | "contact" | "opportunity" | "task";

const KINDS: { key: Kind; label: string }[] = [
  { key: "company", label: "Company" },
  { key: "contact", label: "Contact" },
  { key: "opportunity", label: "Opportunity" },
  { key: "task", label: "Task" },
];

export function QuickCreate({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [kind, setKind] = useState<Kind>("company");
  const [form, setForm] = useState<Record<string, string>>({});
  const qc = useQueryClient();
  const { profile } = useAuth();
  const companies = useQuery({ ...companiesQuery(), enabled: open });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const create = useMutation({
    mutationFn: async () => {
      const owner = profile?.full_name ?? "Unassigned";
      if (kind === "company") {
        const { error } = await supabase.from("companies").insert({
          name: form["name"] ?? "",
          industry: form["industry"] || null,
          country: form["country"] || null,
          account_manager: owner,
          health_score: 70,
          health_label: "Healthy",
          revenue_12m: 0,
          contract_status: "Draft",
        });
        if (error) throw new Error(error.message);
      } else if (kind === "contact") {
        const { error } = await supabase.from("contacts").insert({
          company_id: form["company_id"] || null,
          full_name: form["full_name"] ?? "",
          job_title: form["job_title"] || null,
          email: form["email"] || null,
          is_primary: false,
        });
        if (error) throw new Error(error.message);
      } else if (kind === "opportunity") {
        const { error } = await supabase.from("opportunities").insert({
          company_id: form["company_id"] || null,
          name: form["name"] ?? "",
          stage: form["stage"] || "Qualification",
          value: Number(form["value"] ?? 0),
          probability: 30,
          owner,
        });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("tasks").insert({
          title: form["title"] ?? "",
          assignee: owner,
          due_date: form["due_date"] || null,
          priority: form["priority"] || "Medium",
          status: "Open",
        });
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: async () => {
      toast.success(`${KINDS.find((k) => k.key === kind)?.label} created`);
      await qc.invalidateQueries();
      setForm({});
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]"
      style={{ background: "color-mix(in oklab, var(--ink) 34%, transparent)" }}
      onClick={onClose}
      role="presentation"
    >
      <form
        className="card drop w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <div className="ch">
          <div>
            <div className="ct">Quick create</div>
            <div className="cs">Add a record without leaving the page</div>
          </div>
          <button type="button" className="btn sm ico ml-auto" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-1 border-b border-border px-4">
          {KINDS.map((k) => (
            <button
              key={k.key}
              type="button"
              className={`tab ${kind === k.key ? "on" : ""}`}
              onClick={() => setKind(k.key)}
            >
              {k.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2">
          {kind === "company" ? (
            <>
              <Field label="Company name" required value={form["name"] ?? ""} onChange={(v) => set("name", v)} />
              <Field label="Industry" value={form["industry"] ?? ""} onChange={(v) => set("industry", v)} />
              <Field label="Country" value={form["country"] ?? ""} onChange={(v) => set("country", v)} />
            </>
          ) : null}

          {kind === "contact" ? (
            <>
              <Field label="Full name" required value={form["full_name"] ?? ""} onChange={(v) => set("full_name", v)} />
              <Field label="Job title" value={form["job_title"] ?? ""} onChange={(v) => set("job_title", v)} />
              <Field label="Email" type="email" value={form["email"] ?? ""} onChange={(v) => set("email", v)} />
              <CompanyPicker
                value={form["company_id"] ?? ""}
                onChange={(v) => set("company_id", v)}
                options={(companies.data ?? []).map((c) => ({ id: c.id, name: c.name }))}
              />
            </>
          ) : null}

          {kind === "opportunity" ? (
            <>
              <Field label="Opportunity name" required value={form["name"] ?? ""} onChange={(v) => set("name", v)} />
              <Field label="Value (EUR)" type="number" value={form["value"] ?? ""} onChange={(v) => set("value", v)} />
              <div className="field">
                <span className="lbl">Stage</span>
                <select value={form["stage"] ?? "Qualification"} onChange={(e) => set("stage", e.target.value)}>
                  {["Qualification", "Discovery", "Proposal", "Negotiation", "Closing"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <CompanyPicker
                value={form["company_id"] ?? ""}
                onChange={(v) => set("company_id", v)}
                options={(companies.data ?? []).map((c) => ({ id: c.id, name: c.name }))}
              />
            </>
          ) : null}

          {kind === "task" ? (
            <>
              <Field label="Task" required value={form["title"] ?? ""} onChange={(v) => set("title", v)} />
              <Field label="Due date" type="date" value={form["due_date"] ?? ""} onChange={(v) => set("due_date", v)} />
              <div className="field">
                <span className="lbl">Priority</span>
                <select value={form["priority"] ?? "Medium"} onChange={(e) => set("priority", e.target.value)}>
                  {["High", "Medium", "Low"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <button type="button" className="btn sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn sm pri" disabled={create.isPending}>
            {create.isPending ? "Saving…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span className="lbl">{label}</span>
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function CompanyPicker({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string }[];
}) {
  return (
    <label className="field">
      <span className="lbl">Company</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Unassigned</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );
}
