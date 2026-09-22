import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Avatar } from "@/components/app/Avatar";
import {
  Card,
  EmptyState,
  FilterSelect,
  Filters,
  HealthBadge,
  PageHeader,
  StatCard,
  StatusBadge,
  TableSkeleton,
} from "@/components/app/Bits";
import { useAuth } from "@/hooks/useAuth";
import { companiesQuery, contractsQuery, type Company } from "@/lib/queries";
import { compactMoney, daysUntil, relativeDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/companies/")({
  head: () => ({
    meta: [
      { title: "Companies — Semos CRM" },
      {
        name: "description",
        content: "Browse and filter all client companies, health, revenue and account ownership.",
      },
      { property: "og:title", content: "Companies — Semos CRM" },
      {
        property: "og:description",
        content: "Browse and filter all client companies, health, revenue and account ownership.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompaniesPage,
});

type TabKey = "all" | "mine" | "risk" | "renewals" | "top";
const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All companies" },
  { key: "mine", label: "My accounts" },
  { key: "risk", label: "At risk" },
  { key: "renewals", label: "Renewals <90 days" },
  { key: "top", label: "Top 20 by revenue" },
];

type SortKey = "revenue" | "health" | "";

function CompaniesPage() {
  const { profile } = useAuth();
  const companies = useQuery(companiesQuery());
  const contracts = useQuery(contractsQuery());

  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [country, setCountry] = useState("All");
  const [manager, setManager] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState<SortKey>("");

  const list = companies.data ?? [];

  const industries = useMemo(
    () => Array.from(new Set(list.map((c) => c.industry).filter(Boolean))) as string[],
    [list],
  );
  const countries = useMemo(
    () => Array.from(new Set(list.map((c) => c.country).filter(Boolean))) as string[],
    [list],
  );
  const managers = useMemo(
    () => Array.from(new Set(list.map((c) => c.account_manager).filter(Boolean))) as string[],
    [list],
  );
  const statuses = useMemo(
    () => Array.from(new Set(list.map((c) => c.contract_status).filter(Boolean))) as string[],
    [list],
  );

  const renewingIds = useMemo(() => {
    const set = new Set<string>();
    for (const c of contracts.data ?? []) {
      const d = daysUntil(c.end_date);
      if (d !== null && d >= 0 && d <= 90 && c.company_id) set.add(c.company_id);
    }
    return set;
  }, [contracts.data]);

  const healthy = list.filter((c) => c.health_score >= 75).length;
  const attention = list.filter((c) => c.health_score >= 50 && c.health_score < 75).length;
  const atRisk = list.filter((c) => c.health_score < 50).length;
  const revenue = list.reduce((a, c) => a + Number(c.revenue_12m ?? 0), 0);

  let rows: Company[] = list;
  if (tab === "mine" && profile?.full_name) {
    rows = rows.filter((c) => c.account_manager === profile.full_name);
  } else if (tab === "risk") {
    rows = rows.filter((c) => c.health_score < 50);
  } else if (tab === "renewals") {
    rows = rows.filter((c) => renewingIds.has(c.id));
  } else if (tab === "top") {
    rows = [...rows].sort((a, b) => Number(b.revenue_12m) - Number(a.revenue_12m)).slice(0, 20);
  }

  rows = rows.filter((c) => {
    if (industry !== "All" && c.industry !== industry) return false;
    if (country !== "All" && c.country !== country) return false;
    if (manager !== "All" && c.account_manager !== manager) return false;
    if (status !== "All" && c.contract_status !== status) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (sort === "revenue") rows = [...rows].sort((a, b) => Number(b.revenue_12m) - Number(a.revenue_12m));
  if (sort === "health") rows = [...rows].sort((a, b) => a.health_score - b.health_score);

  return (
    <>
      <PageHeader
        title="Companies"
        subtitle="All client accounts, health and revenue in one place."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total clients" value={list.length} />
        <StatCard label="Managed revenue (12m)" value={compactMoney(revenue)} />
        <StatCard label="Healthy" value={healthy} tone="ok" />
        <StatCard
          label="Needs attention / at risk"
          value={`${attention} / ${atRisk}`}
          tone={atRisk > 0 ? "bad" : "warn"}
        />
      </div>

      <Filters>
        <div className="btn sm gap-1.5">
          <Search className="h-3.5 w-3.5 text-ink-3" />
          <input
            className="w-40 bg-transparent outline-none placeholder:text-ink-3"
            placeholder="Search companies…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <FilterSelect label="Industry" value={industry} options={industries} onChange={setIndustry} />
        <FilterSelect label="Country" value={country} options={countries} onChange={setCountry} />
        <FilterSelect label="Manager" value={manager} options={managers} onChange={setManager} />
        <FilterSelect label="Contract status" value={status} options={statuses} onChange={setStatus} />
      </Filters>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? "on" : ""}`}
            onClick={() => setTab(t.key)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card bodyClassName="">
        {companies.isLoading ? (
          <TableSkeleton cols={7} />
        ) : rows.length === 0 ? (
          <EmptyState title="No companies found" body="Try adjusting filters or search." />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Company</th>
                <th
                  className="cursor-pointer select-none"
                  onClick={() => setSort(sort === "health" ? "" : "health")}
                >
                  Health {sort === "health" ? "↑" : ""}
                </th>
                <th
                  className="r cursor-pointer select-none"
                  onClick={() => setSort(sort === "revenue" ? "" : "revenue")}
                >
                  Revenue 12m {sort === "revenue" ? "↓" : ""}
                </th>
                <th className="r">Active projects</th>
                <th>Contract status</th>
                <th>Account manager</th>
                <th>Last activity</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.name} size="xs" />
                      <div>
                        <Link to="/companies/$id" params={{ id: c.id }} className="nm">
                          {c.name}
                        </Link>
                        <span className="block text-[11.5px] text-ink-3">
                          {[c.industry, c.country].filter(Boolean).join(" · ")}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <HealthBadge score={c.health_score} label={c.health_label} />
                  </td>
                  <td className="r num">{compactMoney(c.revenue_12m)}</td>
                  <td className="r num">{c.active_projects}</td>
                  <td>
                    <StatusBadge status={c.contract_status} />
                  </td>
                  <td>{c.account_manager ?? "—"}</td>
                  <td className="text-[12.5px] text-ink-3">{relativeDate(c.last_activity_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
