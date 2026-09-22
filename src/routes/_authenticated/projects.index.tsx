import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/app/Avatar";
import {
  Bar,
  Card,
  EmptyState,
  Filters,
  FilterSelect,
  PageHeader,
  StatCard,
  StatusBadge,
  TableSkeleton,
} from "@/components/app/Bits";
import { companiesQuery, projectsQuery } from "@/lib/queries";
import { compactMoney, daysUntil, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Semos CRM" },
      {
        name: "description",
        content: "Delivery status, budgets and burn across every active client project.",
      },
      { property: "og:title", content: "Projects — Semos CRM" },
      {
        property: "og:description",
        content: "Delivery status, budgets and burn across every active client project.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectsPage,
});

const TABS = ["All", "On track", "Behind plan / On hold", "Ending in 60 days"] as const;

function ProjectsPage() {
  const projects = useQuery(projectsQuery());
  const companies = useQuery(companiesQuery());

  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [status, setStatus] = useState("All");
  const [manager, setManager] = useState("All");
  const [billing, setBilling] = useState("All");
  const [q, setQ] = useState("");

  const list = projects.data ?? [];
  const companyList = companies.data ?? [];
  const companyName = (id: string | null) => companyList.find((c) => c.id === id)?.name ?? "—";

  const statuses = useMemo(() => Array.from(new Set(list.map((p) => p.status).filter(Boolean))) as string[], [list]);
  const managers = useMemo(
    () => Array.from(new Set(list.map((p) => p.delivery_manager).filter(Boolean))) as string[],
    [list],
  );
  const billingModels = useMemo(
    () => Array.from(new Set(list.map((p) => p.billing_model).filter(Boolean))) as string[],
    [list],
  );

  const active = list.filter((p) => p.status !== "Completed" && p.status !== "Cancelled");
  const totalBudget = list.reduce((a, p) => a + Number(p.budget ?? 0), 0);
  const totalSpent = list.reduce((a, p) => a + Number(p.spent ?? 0), 0);
  const spentPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const notOnTrack = list.filter((p) => p.status !== "On track").length;

  const filtered = list.filter((p) => {
    if (status !== "All" && p.status !== status) return false;
    if (manager !== "All" && p.delivery_manager !== manager) return false;
    if (billing !== "All" && p.billing_model !== billing) return false;
    if (q && !`${p.name} ${p.code ?? ""} ${companyName(p.company_id)}`.toLowerCase().includes(q.toLowerCase()))
      return false;
    if (tab === "On track" && p.status !== "On track") return false;
    if (tab === "Behind plan / On hold" && !["Behind plan", "On hold"].includes(p.status)) return false;
    if (tab === "Ending in 60 days") {
      const d = daysUntil(p.end_date);
      if (d === null || d < 0 || d > 60) return false;
    }
    return true;
  });

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Delivery status, budgets and burn across every active client project."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active projects" value={active.length} hint={`${list.length} total`} />
        <StatCard label="Total budget" value={compactMoney(totalBudget)} />
        <StatCard
          label="Spent vs budget"
          value={`${spentPct}%`}
          tone={spentPct > 90 ? "bad" : spentPct > 75 ? "warn" : "ok"}
          hint={`${compactMoney(totalSpent)} spent`}
        />
        <StatCard
          label="Not on track"
          value={notOnTrack}
          tone={notOnTrack > 0 ? "warn" : "ok"}
          hint="Behind plan or on hold"
        />
      </div>

      <Filters>
        <input
          className="field w-56"
          placeholder="Search projects, code or company…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <FilterSelect label="Status" value={status} options={statuses} onChange={setStatus} />
        <FilterSelect label="Delivery manager" value={manager} options={managers} onChange={setManager} />
        <FilterSelect label="Billing model" value={billing} options={billingModels} onChange={setBilling} />
      </Filters>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <Card bodyClassName="">
        {projects.isLoading ? (
          <TableSkeleton cols={8} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No projects found" body="Adjust filters or search to see more projects." />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Project</th>
                <th>Company</th>
                <th>Status</th>
                <th>Progress</th>
                <th className="r">Budget</th>
                <th className="r">Spent</th>
                <th className="r">Team</th>
                <th>Delivery manager</th>
                <th>End date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to="/projects/$id" params={{ id: p.id }} className="nm">
                      {p.name}
                    </Link>
                    <span className="block text-[11.5px] text-ink-3">{p.code ?? "—"}</span>
                  </td>
                  <td>{companyName(p.company_id)}</td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-24">
                        <Bar value={p.progress} />
                      </div>
                      <span className="num text-[11.5px] text-ink-3">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="r num">{compactMoney(p.budget)}</td>
                  <td className="r num">{compactMoney(p.spent)}</td>
                  <td className="r num">{p.team_size}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={p.delivery_manager} size="xs" />
                      <span className="text-[12.5px]">{p.delivery_manager ?? "Unassigned"}</span>
                    </div>
                  </td>
                  <td className="num text-[12.5px]">{shortDate(p.end_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
