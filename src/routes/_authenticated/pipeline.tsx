import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/app/Avatar";
import { Bar, Filters, FilterSelect, PageHeader, StatCard } from "@/components/app/Bits";
import { supabase } from "@/integrations/supabase/client";
import { companiesQuery, opportunitiesQuery, type Opportunity } from "@/lib/queries";
import { compactMoney, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline — Semos CRM" },
      { name: "description", content: "Kanban view of opportunities by stage, with quick stage moves." },
      { property: "og:title", content: "Pipeline — Semos CRM" },
      { property: "og:description", content: "Kanban view of opportunities by stage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PipelinePage,
});

const STAGES = ["Qualification", "Discovery", "Proposal", "Negotiation", "Closing"];

function PipelinePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const opportunities = useQuery(opportunitiesQuery());
  const companies = useQuery(companiesQuery());
  const [owner, setOwner] = useState("All");

  const companyList = companies.data ?? [];
  const companyName = (id: string | null) => companyList.find((c) => c.id === id)?.name ?? "—";
  const opps = opportunities.data ?? [];

  const owners = useMemo(
    () => Array.from(new Set(opps.map((o) => o.owner).filter(Boolean))) as string[],
    [opps],
  );

  const filtered = owner === "All" ? opps : opps.filter((o) => o.owner === owner);

  const totalValue = filtered.reduce((a, o) => a + Number(o.value ?? 0), 0);
  const totalWeighted = filtered.reduce(
    (a, o) => a + (Number(o.value ?? 0) * (o.probability ?? 0)) / 100,
    0,
  );

  async function moveStage(id: string, stage: string) {
    const { error } = await supabase.from("opportunities").update({ stage }).eq("id", id);
    if (error) {
      toast.error("Failed to move opportunity", { description: error.message });
      return;
    }
    toast.success(`Moved to ${stage}`);
    void queryClient.invalidateQueries({ queryKey: ["opportunities"] });
  }

  return (
    <>
      <PageHeader title="Pipeline" subtitle="Drag-free kanban view of opportunities across stages." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open value" value={compactMoney(totalValue)} hint={`${filtered.length} opportunities`} />
        <StatCard label="Weighted value" value={compactMoney(totalWeighted)} />
        <StatCard
          label="Avg probability"
          value={filtered.length ? `${Math.round(filtered.reduce((a, o) => a + o.probability, 0) / filtered.length)}%` : "—"}
        />
        <StatCard label="Owners" value={owners.length} />
      </div>

      <Filters>
        <FilterSelect label="Owner" value={owner} options={owners} onChange={setOwner} />
      </Filters>

      <div className="grid gap-3 overflow-x-auto pb-2 xl:grid-cols-5">
        {STAGES.map((stage) => {
          const cards = filtered.filter((o) => o.stage === stage);
          const stageValue = cards.reduce((a, o) => a + Number(o.value ?? 0), 0);
          return (
            <div key={stage} className="card min-w-[240px]" style={{ display: "flex", flexDirection: "column" }}>
              <div className="ch">
                <div>
                  <div className="ct">{stage}</div>
                  <div className="cs">
                    {cards.length} deals · {compactMoney(stageValue)}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 p-3">
                {cards.length === 0 ? (
                  <p className="px-1 py-4 text-center text-[11.5px] text-ink-3">No deals</p>
                ) : (
                  cards.map((o: Opportunity) => (
                    <div
                      key={o.id}
                      className="lift card cursor-pointer p-2.5"
                      onClick={() => navigate({ to: "/opportunities/$id", params: { id: o.id } })}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to="/opportunities/$id"
                          params={{ id: o.id }}
                          className="nm text-[12.5px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {o.name}
                        </Link>
                        <span className="num shrink-0 text-[12px] font-medium">{compactMoney(o.value)}</span>
                      </div>
                      <p className="mt-0.5 text-[11.5px] text-ink-3">{companyName(o.company_id)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-full">
                          <Bar
                            value={o.probability}
                            tone={o.probability >= 60 ? "ok" : o.probability >= 40 ? "warn" : "bad"}
                          />
                        </div>
                        <span className="num shrink-0 text-[11px] text-ink-3">{o.probability}%</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Avatar name={o.owner} size="xs" />
                          <span className="text-[11px] text-ink-3">{shortDate(o.expected_close)}</span>
                        </div>
                      </div>
                      <select
                        className="field mt-2 w-full text-[11px]"
                        value={o.stage}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => moveStage(o.id, e.target.value)}
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
