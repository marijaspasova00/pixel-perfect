import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Bar as RBar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { Avatar } from "@/components/app/Avatar";
import { Card, EmptyState, HealthBadge, PageHeader, StatCard, TableSkeleton } from "@/components/app/Bits";
import { companiesQuery, contractsQuery, opportunitiesQuery } from "@/lib/queries";
import { compactMoney, daysUntil, healthTone, relativeDate, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/client-health")({
  head: () => ({
    meta: [
      { title: "Client health — Semos CRM" },
      {
        name: "description",
        content: "Health score distribution, industry breakdown and at-risk account watchlist.",
      },
      { property: "og:title", content: "Client health — Semos CRM" },
      { property: "og:description", content: "Health score distribution and watchlist across accounts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientHealthPage,
});

function toneColor(score: number) {
  const t = healthTone(score);
  return t === "ok" ? "var(--ok)" : t === "warn" ? "var(--warn)" : "var(--bad)";
}

function ClientHealthPage() {
  const companies = useQuery(companiesQuery());
  const opportunities = useQuery(opportunitiesQuery());
  const contracts = useQuery(contractsQuery());

  const list = companies.data ?? [];
  const opps = opportunities.data ?? [];
  const contractList = contracts.data ?? [];

  const healthy = list.filter((c) => c.health_score >= 75).length;
  const attention = list.filter((c) => c.health_score >= 50 && c.health_score < 75).length;
  const atRisk = list.filter((c) => c.health_score < 50).length;

  const scatterData = list.map((c) => ({
    name: c.name,
    health: c.health_score,
    revenue: Number(c.revenue_12m ?? 0),
    color: toneColor(c.health_score),
  }));

  const industryData = useMemo(() => {
    const map = new Map<string, { industry: string; total: number; count: number }>();
    for (const c of list) {
      const key = c.industry ?? "Other";
      const entry = map.get(key) ?? { industry: key, total: 0, count: 0 };
      entry.total += c.health_score;
      entry.count += 1;
      map.set(key, entry);
    }
    return Array.from(map.values())
      .map((e) => ({ industry: e.industry, avgHealth: Math.round(e.total / e.count), count: e.count }))
      .sort((a, b) => b.avgHealth - a.avgHealth);
  }, [list]);

  const watchlist = list
    .filter((c) => c.health_score < 60)
    .sort((a, b) => a.health_score - b.health_score);

  function nextRenewal(companyId: string) {
    const now = Date.now();
    const upcoming = contractList
      .filter((c) => c.company_id === companyId && c.end_date && new Date(c.end_date).getTime() >= now)
      .sort((a, b) => new Date(a.end_date!).getTime() - new Date(b.end_date!).getTime());
    return upcoming[0]?.end_date ?? null;
  }

  function openOppCount(companyId: string) {
    return opps.filter((o) => o.company_id === companyId && o.stage !== "Closing").length;
  }

  return (
    <>
      <PageHeader
        title="Client health"
        subtitle="Health score distribution, industry trends and accounts that need attention."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Healthy" value={healthy} tone="ok" hint="Score 75+" />
        <StatCard label="Needs attention" value={attention} tone="warn" hint="Score 50–74" />
        <StatCard label="At risk" value={atRisk} tone="bad" hint="Score under 50" />
        <StatCard label="Accounts" value={list.length} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card title="Health score vs revenue" subtitle="Each point is a company">
          {companies.isLoading ? (
            <div className="skel h-64 animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="health"
                  name="Health score"
                  domain={[0, 100]}
                  tick={{ fill: "var(--ink-3)", fontSize: 11 }}
                  stroke="var(--border)"
                />
                <YAxis
                  type="number"
                  dataKey="revenue"
                  name="Revenue"
                  tickFormatter={(v) => compactMoney(v)}
                  tick={{ fill: "var(--ink-3)", fontSize: 11 }}
                  stroke="var(--border)"
                  width={70}
                />
                <ZAxis range={[60, 60]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                  formatter={(value: number, key: string) =>
                    key === "revenue" ? compactMoney(value) : value
                  }
                  labelFormatter={() => ""}
                />
                <Scatter data={scatterData} fill="var(--accent-2)" />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Average health by industry">
          {companies.isLoading ? (
            <div className="skel h-64 animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={industryData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--ink-3)", fontSize: 11 }} stroke="var(--border)" />
                <YAxis
                  type="category"
                  dataKey="industry"
                  width={100}
                  tick={{ fill: "var(--ink-2)", fontSize: 11 }}
                  stroke="var(--border)"
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <RBar dataKey="avgHealth" fill="var(--accent-2)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card
        title="Watchlist"
        subtitle="Accounts with a health score under 60"
        bodyClassName=""
      >
        {companies.isLoading ? (
          <TableSkeleton cols={7} />
        ) : watchlist.length === 0 ? (
          <EmptyState title="No accounts at risk" body="Every account is above the 60 health threshold." />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Company</th>
                <th>Health</th>
                <th className="r">Revenue 12m</th>
                <th className="r">Open opps</th>
                <th>Last activity</th>
                <th>Account manager</th>
                <th>Next renewal</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((c) => {
                const renewal = nextRenewal(c.id);
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.name} size="xs" />
                        <Link to="/companies/$id" params={{ id: c.id }} className="nm">
                          {c.name}
                        </Link>
                      </div>
                      <span className="text-[11.5px] text-ink-3">{c.industry ?? "—"}</span>
                    </td>
                    <td>
                      <HealthBadge score={c.health_score} label={c.health_label} />
                    </td>
                    <td className="r num">{compactMoney(c.revenue_12m)}</td>
                    <td className="r num">{openOppCount(c.id)}</td>
                    <td>
                      <span className="text-[12.5px]">{relativeDate(c.last_activity_at)}</span>
                      {c.last_activity_at ? (
                        <span className="block text-[11px] text-ink-3">
                          {Math.abs(daysUntil(c.last_activity_at) ?? 0)} days ago
                        </span>
                      ) : null}
                    </td>
                    <td>{c.account_manager ?? "—"}</td>
                    <td>{renewal ? shortDate(renewal) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
