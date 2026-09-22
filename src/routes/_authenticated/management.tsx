import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Bar as RBar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Avatar } from "@/components/app/Avatar";
import { Card, HealthBadge, PageHeader, StatCard, TableSkeleton } from "@/components/app/Bits";
import { companiesQuery, opportunitiesQuery, projectsQuery } from "@/lib/queries";
import { compactMoney } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/management")({
  head: () => ({
    meta: [
      { title: "Management overview — Semos CRM" },
      {
        name: "description",
        content: "Revenue mix, pipeline forecast, portfolio health and delivery status across the business.",
      },
      { property: "og:title", content: "Management overview — Semos CRM" },
      {
        property: "og:description",
        content: "Revenue mix, pipeline forecast, portfolio health and delivery status across the business.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ManagementPage,
});

const PIE_COLORS = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)", "var(--c6)"];

function tooltipStyle() {
  return { background: "var(--surface)", border: "1px solid var(--border)", fontSize: 12 };
}

function ManagementPage() {
  const companies = useQuery(companiesQuery());
  const opportunities = useQuery(opportunitiesQuery());
  const projects = useQuery(projectsQuery());

  const list = companies.data ?? [];
  const opps = opportunities.data ?? [];
  const projectList = projects.data ?? [];

  const revenueByIndustry = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of list) {
      const key = c.industry ?? "Other";
      map.set(key, (map.get(key) ?? 0) + Number(c.revenue_12m ?? 0));
    }
    return Array.from(map.entries())
      .map(([industry, revenue]) => ({ industry, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [list]);

  const revenueByCountry = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of list) {
      const key = c.country ?? "Other";
      map.set(key, (map.get(key) ?? 0) + Number(c.revenue_12m ?? 0));
    }
    return Array.from(map.entries())
      .map(([country, revenue]) => ({ country, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [list]);

  const forecast = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of opps) {
      if (!o.expected_close) continue;
      const month = o.expected_close.slice(0, 7);
      map.set(month, (map.get(month) ?? 0) + (Number(o.value ?? 0) * (o.probability ?? 0)) / 100);
    }
    return Array.from(map.entries())
      .map(([month, weighted]) => ({ month, weighted }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [opps]);

  const healthDistribution = useMemo(() => {
    const healthy = list.filter((c) => c.health_score >= 75).length;
    const attention = list.filter((c) => c.health_score >= 50 && c.health_score < 75).length;
    const risk = list.filter((c) => c.health_score < 50).length;
    return [
      { name: "Healthy", value: healthy },
      { name: "Needs attention", value: attention },
      { name: "At risk", value: risk },
    ].filter((d) => d.value > 0);
  }, [list]);

  const deliveryStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of projectList) {
      const key = p.status ?? "Unknown";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [projectList]);

  const topAccounts = useMemo(
    () => [...list].sort((a, b) => Number(b.revenue_12m) - Number(a.revenue_12m)).slice(0, 10),
    [list],
  );

  const managerLeague = useMemo(() => {
    const map = new Map<
      string,
      { manager: string; accounts: number; revenue: number; healthTotal: number; pipeline: number }
    >();
    for (const c of list) {
      const key = c.account_manager ?? "Unassigned";
      const entry = map.get(key) ?? { manager: key, accounts: 0, revenue: 0, healthTotal: 0, pipeline: 0 };
      entry.accounts += 1;
      entry.revenue += Number(c.revenue_12m ?? 0);
      entry.healthTotal += c.health_score;
      map.set(key, entry);
    }
    for (const o of opps) {
      if (o.stage === "Closing" || !o.company_id) continue;
      const company = list.find((c) => c.id === o.company_id);
      const key = company?.account_manager ?? "Unassigned";
      const entry = map.get(key);
      if (entry) entry.pipeline += Number(o.value ?? 0);
    }
    return Array.from(map.values())
      .map((e) => ({ ...e, avgHealth: Math.round(e.healthTotal / e.accounts) }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [list, opps]);

  const totalRevenue = list.reduce((a, c) => a + Number(c.revenue_12m ?? 0), 0);
  const totalWeighted = forecast.reduce((a, f) => a + f.weighted, 0);

  return (
    <>
      <PageHeader title="Management overview" subtitle="Revenue mix, pipeline forecast and delivery across the portfolio." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Managed revenue (12m)" value={compactMoney(totalRevenue)} />
        <StatCard label="Weighted pipeline" value={compactMoney(totalWeighted)} />
        <StatCard label="Accounts" value={list.length} />
        <StatCard label="Active projects" value={projectList.length} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Revenue by industry">
          {companies.isLoading ? (
            <div className="skel h-64 animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueByIndustry} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => compactMoney(v)}
                  tick={{ fill: "var(--ink-3)", fontSize: 11 }}
                  stroke="var(--border)"
                />
                <YAxis
                  type="category"
                  dataKey="industry"
                  width={100}
                  tick={{ fill: "var(--ink-2)", fontSize: 11 }}
                  stroke="var(--border)"
                />
                <Tooltip contentStyle={tooltipStyle()} formatter={(v: number) => compactMoney(v)} />
                <RBar dataKey="revenue" fill="var(--c1)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Revenue by country">
          {companies.isLoading ? (
            <div className="skel h-64 animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueByCountry} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => compactMoney(v)}
                  tick={{ fill: "var(--ink-3)", fontSize: 11 }}
                  stroke="var(--border)"
                />
                <YAxis
                  type="category"
                  dataKey="country"
                  width={100}
                  tick={{ fill: "var(--ink-2)", fontSize: 11 }}
                  stroke="var(--border)"
                />
                <Tooltip contentStyle={tooltipStyle()} formatter={(v: number) => compactMoney(v)} />
                <RBar dataKey="revenue" fill="var(--c2)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card title="Pipeline forecast" subtitle="Weighted value by expected close month">
          {opportunities.isLoading ? (
            <div className="skel h-64 animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={forecast} margin={{ left: 0, right: 10 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "var(--ink-3)", fontSize: 11 }} stroke="var(--border)" />
                <YAxis tickFormatter={(v) => compactMoney(v)} tick={{ fill: "var(--ink-3)", fontSize: 11 }} stroke="var(--border)" width={70} />
                <Tooltip contentStyle={tooltipStyle()} formatter={(v: number) => compactMoney(v)} />
                <RBar dataKey="weighted" fill="var(--c3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Portfolio health" subtitle="Distribution of account health">
          {companies.isLoading ? (
            <div className="skel h-64 animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={healthDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                  {healthDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle()} />
                <Legend wrapperStyle={{ fontSize: 11, color: "var(--ink-2)" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card title="Delivery status split" subtitle="Active and past projects by status">
        {projects.isLoading ? (
          <div className="skel h-48 animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deliveryStatus} margin={{ left: 0, right: 10 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--ink-3)", fontSize: 11 }} stroke="var(--border)" />
              <YAxis tick={{ fill: "var(--ink-3)", fontSize: 11 }} stroke="var(--border)" allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle()} />
              <RBar dataKey="value" fill="var(--c4)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Top 10 accounts by revenue" bodyClassName="">
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
                {topAccounts.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.name} size="xs" />
                        <Link to="/companies/$id" params={{ id: c.id }} className="nm">
                          {c.name}
                        </Link>
                      </div>
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

        <Card title="Account manager league table" bodyClassName="">
          {companies.isLoading ? (
            <TableSkeleton cols={4} />
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Manager</th>
                  <th className="r">Accounts</th>
                  <th className="r">Revenue</th>
                  <th className="r">Avg health</th>
                  <th className="r">Open pipeline</th>
                </tr>
              </thead>
              <tbody>
                {managerLeague.map((m) => (
                  <tr key={m.manager}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={m.manager} size="xs" />
                        <span className="nm">{m.manager}</span>
                      </div>
                    </td>
                    <td className="r num">{m.accounts}</td>
                    <td className="r num">{compactMoney(m.revenue)}</td>
                    <td className="r num">{m.avgHealth}</td>
                    <td className="r num">{compactMoney(m.pipeline)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </>
  );
}
