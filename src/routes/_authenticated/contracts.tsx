import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Badge,
  Card,
  EmptyState,
  Filters,
  FilterSelect,
  PageHeader,
  StatCard,
  StatusBadge,
  TableSkeleton,
} from "@/components/app/Bits";
import { companiesQuery, contractsQuery } from "@/lib/queries";
import { compactMoney, daysUntil, money, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/contracts")({
  head: () => ({
    meta: [
      { title: "Contracts — Semos CRM" },
      {
        name: "description",
        content: "Contract register with values, renewal windows and ownership across all accounts.",
      },
      { property: "og:title", content: "Contracts — Semos CRM" },
      {
        property: "og:description",
        content: "Contract register with values, renewal windows and ownership across all accounts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContractsPage,
});

const TABS = ["All", "Active", "Expiring <90 days", "Expired"] as const;

function ContractsPage() {
  const contracts = useQuery(contractsQuery());
  const companies = useQuery(companiesQuery());

  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [owner, setOwner] = useState("All");
  const [q, setQ] = useState("");

  const list = contracts.data ?? [];
  const companyList = companies.data ?? [];
  const companyName = (id: string | null) => companyList.find((c) => c.id === id)?.name ?? "—";

  const statuses = useMemo(() => Array.from(new Set(list.map((c) => c.status).filter(Boolean))) as string[], [list]);
  const types = useMemo(
    () => Array.from(new Set(list.map((c) => c.contract_type).filter(Boolean))) as string[],
    [list],
  );
  const owners = useMemo(() => Array.from(new Set(list.map((c) => c.owner).filter(Boolean))) as string[], [list]);

  const active = list.filter((c) => c.status === "Active");
  const totalValue = list.reduce((a, c) => a + Number(c.value ?? 0), 0);
  const expiring90 = list.filter((c) => {
    const d = daysUntil(c.end_date);
    return d !== null && d >= 0 && d <= 90;
  }).length;
  const autoRenewShare = list.length > 0 ? Math.round((list.filter((c) => c.auto_renew).length / list.length) * 100) : 0;

  const filtered = list.filter((c) => {
    if (status !== "All" && c.status !== status) return false;
    if (type !== "All" && c.contract_type !== type) return false;
    if (owner !== "All" && c.owner !== owner) return false;
    if (q && !`${c.title} ${companyName(c.company_id)}`.toLowerCase().includes(q.toLowerCase())) return false;
    const d = daysUntil(c.end_date);
    if (tab === "Active" && c.status !== "Active") return false;
    if (tab === "Expiring <90 days" && !(d !== null && d >= 0 && d <= 90)) return false;
    if (tab === "Expired" && !(d !== null && d < 0)) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Contracts"
        subtitle="Contract register with values, renewal windows and ownership across all accounts."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active contracts" value={active.length} hint={`${list.length} total`} />
        <StatCard label="Total contract value" value={compactMoney(totalValue)} />
        <StatCard
          label="Expiring in 90 days"
          value={expiring90}
          tone={expiring90 > 0 ? "warn" : "ok"}
        />
        <StatCard label="Auto-renew share" value={`${autoRenewShare}%`} />
      </div>

      <Filters>
        <input
          className="field w-56"
          placeholder="Search contracts or company…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <FilterSelect label="Status" value={status} options={statuses} onChange={setStatus} />
        <FilterSelect label="Type" value={type} options={types} onChange={setType} />
        <FilterSelect label="Owner" value={owner} options={owners} onChange={setOwner} />
      </Filters>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <Card bodyClassName="">
        {contracts.isLoading ? (
          <TableSkeleton cols={9} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No contracts found" body="Adjust filters or search to see more contracts." />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Contract</th>
                <th>Company</th>
                <th>Type</th>
                <th className="r">Value</th>
                <th>Start</th>
                <th>End</th>
                <th className="r">Renewal</th>
                <th className="r">Notice</th>
                <th>Auto-renew</th>
                <th>Status</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const d = daysUntil(c.end_date);
                const warn = d !== null && d >= 0 && d <= 30;
                return (
                  <tr key={c.id}>
                    <td className="nm">
                      {c.title}
                      {warn ? (
                        <span className="ml-2">
                          <Badge tone="warn">Renews soon</Badge>
                        </span>
                      ) : null}
                    </td>
                    <td>{companyName(c.company_id)}</td>
                    <td>{c.contract_type}</td>
                    <td className="r num">{money(c.value, c.currency)}</td>
                    <td className="num text-[12.5px]">{shortDate(c.start_date)}</td>
                    <td className="num text-[12.5px]">{shortDate(c.end_date)}</td>
                    <td className="r num">{d === null ? "—" : `${d}d`}</td>
                    <td className="r num">{c.notice_days}d</td>
                    <td>
                      <Badge tone={c.auto_renew ? "ok" : ""} outline={!c.auto_renew}>
                        {c.auto_renew ? "Auto-renews" : "Manual"}
                      </Badge>
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td>{c.owner ?? "—"}</td>
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
