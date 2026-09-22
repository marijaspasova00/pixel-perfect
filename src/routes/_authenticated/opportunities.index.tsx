import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Avatar } from "@/components/app/Avatar";
import {
  Bar,
  Card,
  EmptyState,
  Filters,
  FilterSelect,
  PageHeader,
  StatCard,
  TableSkeleton,
} from "@/components/app/Bits";
import { useAuth } from "@/hooks/useAuth";
import { companiesQuery, opportunitiesQuery, type Opportunity } from "@/lib/queries";
import { compactMoney, daysUntil, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/opportunities/")({
  head: () => ({
    meta: [
      { title: "Opportunities — Semos CRM" },
      {
        name: "description",
        content: "Track open opportunities, stages, value and probability across the pipeline.",
      },
      { property: "og:title", content: "Opportunities — Semos CRM" },
      { property: "og:description", content: "Track open opportunities across the pipeline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OpportunitiesPage,
});

const STAGES = ["Qualification", "Discovery", "Proposal", "Negotiation", "Closing"];
type Tab = "All" | "Mine" | "Closing" | "At risk";

function stageTone(stage: string) {
  if (stage === "Closing") return "ok" as const;
  if (stage === "Negotiation") return "acc" as const;
  return "" as const;
}

function OpportunitiesPage() {
  const { profile } = useAuth();
  const opportunities = useQuery(opportunitiesQuery());
  const companies = useQuery(companiesQuery());

  const [stage, setStage] = useState("All");
  const [owner, setOwner] = useState("All");
  const [company, setCompany] = useState("All");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("All");

  const companyList = companies.data ?? [];
  const companyName = (id: string | null) => companyList.find((c) => c.id === id)?.name ?? "—";
  const opps = opportunities.data ?? [];

  const owners = useMemo(
    () => Array.from(new Set(opps.map((o) => o.owner).filter(Boolean))) as string[],
    [opps],
  );
  const companyNames = useMemo(
    () => Array.from(new Set(companyList.map((c) => c.name))).sort(),
    [companyList],
  );

  const quarterEnd = useMemo(() => {
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3);
    return new Date(now.getFullYear(), q * 3 + 3, 0);
  }, []);

  const filtered = opps.filter((o) => {
    if (stage !== "All" && o.stage !== stage) return false;
    if (owner !== "All" && o.owner !== owner) return false;
    if (company !== "All" && companyName(o.company_id) !== company) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !o.name.toLowerCase().includes(s) &&
        !companyName(o.company_id).toLowerCase().includes(s) &&
        !(o.owner ?? "").toLowerCase().includes(s)
      )
        return false;
    }
    if (tab === "Mine" && o.owner !== profile?.full_name) return false;
    if (tab === "Closing") {
      if (!o.expected_close) return false;
      const d = new Date(o.expected_close);
      if (d > quarterEnd || d < new Date(new Date().setHours(0, 0, 0, 0))) return false;
    }
    if (tab === "At risk" && !(o.probability < 40)) return false;
    return true;
  });

  const openValue = filtered.reduce((a, o) => a + Number(o.value ?? 0), 0);
  const weighted = filtered.reduce((a, o) => a + (Number(o.value ?? 0) * (o.probability ?? 0)) / 100, 0);
  const avgDeal = filtered.length ? openValue / filtered.length : 0;

  const tabs: { key: Tab; label: string }[] = [
    { key: "All", label: "All" },
    { key: "Mine", label: "My opportunities" },
    { key: "Closing", label: "Closing this quarter" },
    { key: "At risk", label: "At risk" },
  ];

  return (
    <>
      <PageHeader
        title="Opportunities"
        subtitle="Open deals across the pipeline, filtered by stage, owner and company."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open value" value={compactMoney(openValue)} hint={`${filtered.length} opportunities`} />
        <StatCard label="Weighted value" value={compactMoney(weighted)} hint="Value × probability" />
        <StatCard label="Opportunities" value={filtered.length} />
        <StatCard label="Average deal size" value={compactMoney(avgDeal)} />
      </div>

      <Filters>
        <div className="btn sm gap-1.5">
          <Search className="h-3.5 w-3.5 text-ink-3" />
          <input
            className="w-40 bg-transparent outline-none placeholder:text-ink-3"
            placeholder="Search opportunities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <FilterSelect label="Stage" value={stage} options={STAGES} onChange={setStage} />
        <FilterSelect label="Owner" value={owner} options={owners} onChange={setOwner} />
        <FilterSelect label="Company" value={company} options={companyNames} onChange={setCompany} />
      </Filters>

      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
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
        {opportunities.isLoading ? (
          <TableSkeleton cols={7} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No opportunities found" body="Try adjusting your filters or search." />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Opportunity</th>
                <th>Company</th>
                <th>Stage</th>
                <th className="r">Value</th>
                <th>Probability</th>
                <th>Expected close</th>
                <th>Owner</th>
                <th>Next step</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o: Opportunity) => (
                <tr key={o.id}>
                  <td>
                    <Link to="/opportunities/$id" params={{ id: o.id }} className="nm">
                      {o.name}
                    </Link>
                  </td>
                  <td>
                    {o.company_id ? (
                      <Link to="/companies/$id" params={{ id: o.company_id }} className="text-ink-2">
                        {companyName(o.company_id)}
                      </Link>
                    ) : (
                      <span className="text-ink-3">—</span>
                    )}
                  </td>
                  <td>
                    <span className={`bdg ${stageTone(o.stage)}`}>{o.stage}</span>
                  </td>
                  <td className="r num">{compactMoney(o.value)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16">
                        <Bar
                          value={o.probability}
                          tone={o.probability >= 60 ? "ok" : o.probability >= 40 ? "warn" : "bad"}
                        />
                      </div>
                      <span className="num text-[11.5px] text-ink-3">{o.probability}%</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-[12.5px]">{shortDate(o.expected_close)}</span>
                    {o.expected_close ? (
                      <span className="block text-[11px] text-ink-3">
                        {daysUntil(o.expected_close)} days
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={o.owner} size="xs" />
                      <span className="text-[12.5px]">{o.owner ?? "Unassigned"}</span>
                    </div>
                  </td>
                  <td className="text-[12.5px] text-ink-3">{o.next_step ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
