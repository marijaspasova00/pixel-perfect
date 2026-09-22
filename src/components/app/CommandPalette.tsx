import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Avatar } from "@/components/app/Avatar";
import {
  candidatesQuery,
  companiesQuery,
  consultantsQuery,
  opportunitiesQuery,
  projectsQuery,
} from "@/lib/queries";

type Hit = { id: string; kind: string; title: string; meta: string; to: string };

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const companies = useQuery({ ...companiesQuery(), enabled: open });
  const opportunities = useQuery({ ...opportunitiesQuery(), enabled: open });
  const projects = useQuery({ ...projectsQuery(), enabled: open });
  const candidates = useQuery({ ...candidatesQuery(), enabled: open });
  const consultants = useQuery({ ...consultantsQuery(), enabled: open });

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const hits = useMemo<Hit[]>(() => {
    const term = q.trim().toLowerCase();
    const all: Hit[] = [
      ...(companies.data ?? []).map((c) => ({
        id: c.id,
        kind: "Company",
        title: c.name,
        meta: [c.industry, c.country].filter(Boolean).join(" · "),
        to: `/companies/${c.id}`,
      })),
      ...(opportunities.data ?? []).map((o) => ({
        id: o.id,
        kind: "Opportunity",
        title: o.name,
        meta: `${o.stage} · ${o.owner ?? "Unassigned"}`,
        to: `/opportunities/${o.id}`,
      })),
      ...(projects.data ?? []).map((p) => ({
        id: p.id,
        kind: "Project",
        title: p.name,
        meta: `${p.code ?? ""} · ${p.status}`,
        to: `/projects/${p.id}`,
      })),
      ...(candidates.data ?? []).map((c) => ({
        id: c.id,
        kind: "Candidate",
        title: c.full_name,
        meta: `${c.role_applied} · ${c.stage}`,
        to: `/recruitment`,
      })),
      ...(consultants.data ?? []).map((c) => ({
        id: c.id,
        kind: "Consultant",
        title: c.full_name,
        meta: `${c.job_title ?? ""} · ${c.availability}`,
        to: `/skills`,
      })),
    ];
    if (!term) return all.slice(0, 8);
    return all
      .filter((h) => `${h.title} ${h.meta} ${h.kind}`.toLowerCase().includes(term))
      .slice(0, 20);
  }, [q, companies.data, opportunities.data, projects.data, candidates.data, consultants.data]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
      style={{ background: "color-mix(in oklab, var(--ink) 34%, transparent)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="card drop w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Global search"
      >
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-ink-3" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search companies, opportunities, projects, people…"
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-ink-3"
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && hits[0]) {
                onClose();
                void navigate({ to: hits[0].to });
              }
            }}
          />
          <span className="kbd">esc</span>
        </div>
        <div className="max-h-[420px] overflow-y-auto py-1.5">
          {hits.length === 0 ? (
            <p className="px-4 py-8 text-center text-[12.5px] text-ink-3">
              Nothing matches “{q}”.
            </p>
          ) : (
            hits.map((h) => (
              <button
                key={`${h.kind}-${h.id}`}
                className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-surface-2"
                onClick={() => {
                  onClose();
                  void navigate({ to: h.to });
                }}
              >
                <Avatar name={h.title} size="xs" />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[13px] font-medium text-ink">{h.title}</span>
                  <span className="truncate text-[11.5px] text-ink-3">{h.meta}</span>
                </span>
                <span className="bdg out ml-auto">{h.kind}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
