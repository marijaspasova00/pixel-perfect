import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/app/Avatar";
import {
  Bar,
  Card,
  EmptyState,
  PageHeader,
  StatCard,
  StatusBadge,
} from "@/components/app/Bits";
import { supabase } from "@/integrations/supabase/client";
import {
  activitiesQuery,
  companyQuery,
  contractsQuery,
  projectQuery,
} from "@/lib/queries";
import { compactMoney, relativeDate, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/projects/$id")({
  head: () => ({
    meta: [
      { title: "Project profile — Semos CRM" },
      {
        name: "description",
        content: "Delivery status, budget burn, timeline and related contracts for this project.",
      },
      { property: "og:title", content: "Project profile — Semos CRM" },
      {
        property: "og:description",
        content: "Delivery status, budget burn, timeline and related contracts for this project.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectProfile,
});

const STATUS_OPTIONS = ["On track", "Behind plan", "On hold", "Completed", "Cancelled"];

function ProjectProfile() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const project = useQuery(projectQuery(id));
  const p = project.data;
  const company = useQuery({ ...companyQuery(p?.company_id ?? ""), enabled: !!p?.company_id });
  const contracts = useQuery({ ...contractsQuery(p?.company_id ?? undefined), enabled: !!p?.company_id });
  const activities = useQuery({ ...activitiesQuery(p?.company_id ?? undefined), enabled: !!p?.company_id });

  const [statusDraft, setStatusDraft] = useState<string | null>(null);
  const [progressDraft, setProgressDraft] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  if (project.isLoading) {
    return <div className="skel h-40 animate-pulse" />;
  }

  if (!p) {
    return (
      <EmptyState
        title="Project not found"
        body="This project may have been removed or the link is incorrect."
        action={
          <Link to="/projects" className="btn sm pri">
            Back to projects
          </Link>
        }
      />
    );
  }

  const burnPct = p.budget > 0 ? Math.round((Number(p.spent) / Number(p.budget)) * 100) : 0;
  const status = statusDraft ?? p.status;
  const progress = progressDraft ?? p.progress;

  async function saveStatus() {
    setSaving(true);
    const { error } = await supabase
      .from("projects")
      .update({ status, progress })
      .eq("id", id);
    setSaving(false);
    if (error) {
      toast.error(`Could not update project: ${error.message}`);
      return;
    }
    toast.success("Project updated");
    setStatusDraft(null);
    setProgressDraft(null);
    queryClient.invalidateQueries({ queryKey: ["project", id] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  }

  return (
    <>
      <Link to="/projects" className="inline-flex w-fit items-center gap-1.5 text-[12.5px] text-ink-3 hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to projects
      </Link>

      <PageHeader
        title={p.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span className="mono text-ink-3">{p.code ?? "—"}</span>
            <span className="sep" />
            {p.company_id ? (
              <Link to="/companies" className="text-accent-ink">
                {company.data?.name ?? "Company"}
              </Link>
            ) : (
              "No company"
            )}
          </span>
        }
        actions={<StatusBadge status={p.status} />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Budget" value={compactMoney(p.budget)} />
        <StatCard label="Spent" value={compactMoney(p.spent)} />
        <StatCard
          label="Burn"
          value={`${burnPct}%`}
          tone={burnPct > 90 ? "bad" : burnPct > 75 ? "warn" : "ok"}
        />
        <StatCard label="Team size" value={p.team_size} />
        <StatCard label="Progress" value={`${p.progress}%`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-4">
          <Card title="Timeline" subtitle="Start to end date">
            <div className="flex items-center justify-between text-[12.5px] text-ink-3">
              <span>{shortDate(p.start_date)}</span>
              <span>{shortDate(p.end_date)}</span>
            </div>
            <div className="mt-2">
              <Bar value={p.progress} />
            </div>
            <p className="mt-2 text-[11.5px] text-ink-3">{p.progress}% complete</p>
          </Card>

          <Card title="Budget vs spend">
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="text-ink-2">Spent {compactMoney(p.spent)}</span>
              <span className="text-ink-3">Budget {compactMoney(p.budget)}</span>
            </div>
            <div className="mt-2">
              <Bar value={burnPct} tone={burnPct > 90 ? "bad" : burnPct > 75 ? "warn" : "ok"} />
            </div>
            <p className="mt-2 text-[11.5px] text-ink-3">{burnPct}% of budget consumed</p>
          </Card>

          <Card title="Related contracts" subtitle={company.data?.name ?? "—"} bodyClassName="">
            {!contracts.data || contracts.data.length === 0 ? (
              <div className="p-4">
                <EmptyState title="No related contracts" body="This company has no contracts on file." />
              </div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Contract</th>
                    <th>Type</th>
                    <th className="r">Value</th>
                    <th>Status</th>
                    <th>End date</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.data.map((c) => (
                    <tr key={c.id}>
                      <td className="nm">{c.title}</td>
                      <td>{c.contract_type}</td>
                      <td className="r num">{compactMoney(c.value, c.currency)}</td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="num text-[12.5px]">{shortDate(c.end_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card title="Status &amp; progress" subtitle="Editable — writes straight to Supabase">
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="lbl">Status</span>
                <select
                  className="field"
                  value={status}
                  onChange={(e) => setStatusDraft(e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="lbl">Progress ({progress}%)</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={(e) => setProgressDraft(Number(e.target.value))}
                />
              </label>
              <button
                className="btn sm pri w-fit"
                disabled={saving || (statusDraft === null && progressDraft === null)}
                onClick={saveStatus}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </Card>

          <Card title="Company snapshot">
            {company.data ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <Avatar name={company.data.name} size="lg" />
                  <div>
                    <Link to="/companies" className="nm">
                      {company.data.name}
                    </Link>
                    <p className="text-[11.5px] text-ink-3">
                      {[company.data.industry, company.data.country].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
                <div className="kv mt-1">Account manager</div>
                <p className="text-[12.5px]">{company.data.account_manager ?? "—"}</p>
              </div>
            ) : (
              <p className="text-[12.5px] text-ink-3">No company linked.</p>
            )}
          </Card>

          <Card title="Activity" subtitle="Scoped to this company">
            {!activities.data || activities.data.length === 0 ? (
              <p className="text-[12.5px] text-ink-3">No recent activity.</p>
            ) : (
              <ol className="flex flex-col gap-3.5">
                {activities.data.slice(0, 8).map((a) => (
                  <li key={a.id} className="flex gap-2.5">
                    <Avatar name={a.created_by ?? a.subject} size="xs" />
                    <div className="min-w-0">
                      <p className="text-[12.5px] text-ink">
                        <b className="font-medium">{a.subject}</b>
                      </p>
                      <p className="text-[11.5px] text-ink-3">
                        {a.activity_type} · {relativeDate(a.occurred_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
