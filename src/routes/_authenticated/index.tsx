import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { Avatar } from "@/components/app/Avatar";
import {
  Bar,
  Card,
  HealthBadge,
  PageHeader,
  StatCard,
  StatusBadge,
  TableSkeleton,
} from "@/components/app/Bits";
import { useAuth } from "@/hooks/useAuth";
import {
  activitiesQuery,
  companiesQuery,
  contractsQuery,
  opportunitiesQuery,
  projectsQuery,
  tasksQuery,
} from "@/lib/queries";
import { compactMoney, daysUntil, relativeDate, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Semos CRM" },
      {
        name: "description",
        content:
          "Account health, pipeline value, renewals and delivery status across the Semos client portfolio.",
      },
      { property: "og:title", content: "Dashboard — Semos CRM" },
      {
        property: "og:description",
        content: "Account health, pipeline value, renewals and delivery status at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const STAGES = ["Qualification", "Discovery", "Proposal", "Negotiation", "Closing"];

function Dashboard() {
  const { profile } = useAuth();
  const companies = useQuery(companiesQuery());
  const opportunities = useQuery(opportunitiesQuery());
  const projects = useQuery(projectsQuery());
  const contracts = useQuery(contractsQuery());
  const activities = useQuery(activitiesQuery());
  const tasks = useQuery(tasksQuery());

  const list = companies.data ?? [];
  const revenue = list.reduce((a, c) => a + Number(c.revenue_12m ?? 0), 0);
  const healthy = list.filter((c) => c.health_score >= 75).length;
  const attention = list.filter((c) => c.health_score >= 50 && c.health_score < 75).length;
  const atRisk = list.filter((c) => c.health_score < 50).length;

  const opps = opportunities.data ?? [];
  const pipeline = opps.reduce((a, o) => a + Number(o.value ?? 0), 0);
  const weighted = opps.reduce((a, o) => a + (Number(o.value ?? 0) * (o.probability ?? 0)) / 100, 0);
  const maxStage = Math.max(
    1,
    ...STAGES.map((s) =>
      opps.filter((o) => o.stage === s).reduce((a, o) => a + Number(o.value ?? 0), 0),
    ),
  );

  const renewals = (contracts.data ?? [])
    .filter((c) => {
      const d = daysUntil(c.end_date);
      return d !== null && d >= 0 && d <= 90;
    })
    .slice(0, 6);

  const watchlist = [...list].sort((a, b) => a.health_score - b.health_score).slice(0, 6);
  const delivery = projects.data ?? [];
  const behind = delivery.filter((p) => p.status !== "On track").length;
  const myTasks = (tasks.data ?? []).slice(0, 6);
  const companyName = (id: string | null) => list.find((c) => c.id === id)?.name ?? "—";

  return (
    <>
      <PageHeader
        title={`Good to see you, ${profile?.full_name?.split(" ")[0] ?? "there"}`}
        subtitle="Portfolio health, pipeline movement and delivery risk across all accounts."
        actions={
          <>
            <Link to="/pipeline" className="btn sm">
              Open pipeline
            </Link>
            <Link to="/client-health" className="btn sm pri">
              Review client health
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Clients"
          value={list.length}
          hint={`${healthy} healthy · ${attention} need attention · ${atRisk} at risk`}
        />
        <StatCard label="Managed revenue (12m)" value={compactMoney(revenue)} hint="Signed and invoiced" />
        <StatCard
          label="Open pipeline"
          value={compactMoney(pipeline)}
          hint={`${compactMoney(weighted)} weighted · ${opps.length} opportunities`}
        />
        <StatCard
          label="Delivery risk"
          value={behind}
          tone={behind > 0 ? "warn" : "ok"}
          hint={`${delivery.length} active projects`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <Card
          title="Accounts to watch"
          subtitle="Lowest health scores first"
          actions={
            <Link to="/companies" className="btn sm gh">
              All companies <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
          bodyClassName=""
        >
          {companies.isLoading ? (
            <TableSkeleton cols={4} />
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Health</th>
                  <th className="r">Revenue 12m</th>
                  <th>Account manager</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.name} size="xs" />
                        <Link to="/companies/$id" params={{ id: c.id }} className="nm">
                          {c.name}
                        </Link>
                      </div>
                      <span className="text-[11.5px] text-ink-3">
                        {[c.industry, c.country].filter(Boolean).join(" · ")}
                      </span>
                    </td>
                    <td>
                      <HealthBadge score={c.health_score} label={c.health_label} />
                    </td>
                    <td className="r num">{compactMoney(c.revenue_12m)}</td>
                    <td>{c.account_manager ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Pipeline by stage" subtitle="Open value per stage">
          <div className="flex flex-col gap-3.5">
            {STAGES.map((s) => {
              const value = opps
                .filter((o) => o.stage === s)
                .reduce((a, o) => a + Number(o.value ?? 0), 0);
              return (
                <div key={s} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12.5px] text-ink-2">{s}</span>
                    <span className="num text-[12.5px] font-medium">{compactMoney(value)}</span>
                  </div>
                  <Bar value={(value / maxStage) * 100} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Renewals in 90 days" subtitle={`${renewals.length} contracts`} bodyClassName="">
          <table className="tbl">
            <tbody>
              {renewals.length === 0 ? (
                <tr>
                  <td className="text-ink-3">No renewals in the next 90 days.</td>
                </tr>
              ) : (
                renewals.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="nm">{companyName(c.company_id)}</span>
                      <span className="block text-[11.5px] text-ink-3">{c.title}</span>
                    </td>
                    <td className="r">
                      <span className="num block text-[12.5px]">{shortDate(c.end_date)}</span>
                      <span className="text-[11.5px] text-ink-3">{daysUntil(c.end_date)} days</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        <Card title="My tasks" subtitle="Next due first" bodyClassName="">
          <table className="tbl">
            <tbody>
              {myTasks.map((t) => (
                <tr key={t.id}>
                  <td>
                    <span className="nm">{t.title}</span>
                    <span className="block text-[11.5px] text-ink-3">
                      {t.assignee ?? "Unassigned"} · due {shortDate(t.due_date)}
                    </span>
                  </td>
                  <td className="r">
                    <StatusBadge status={t.priority} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Recent activity" subtitle="Across all accounts">
          <ol className="flex flex-col gap-3.5">
            {(activities.data ?? []).slice(0, 7).map((a) => (
              <li key={a.id} className="flex gap-2.5">
                <Avatar name={a.created_by ?? a.subject} size="xs" />
                <div className="min-w-0">
                  <p className="text-[12.5px] text-ink">
                    <b className="font-medium">{a.subject}</b>
                  </p>
                  <p className="text-[11.5px] text-ink-3">
                    {a.activity_type} · {companyName(a.company_id)} · {relativeDate(a.occurred_at)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}
