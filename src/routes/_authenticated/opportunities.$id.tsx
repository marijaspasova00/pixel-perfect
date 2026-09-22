import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, CircleDot } from "lucide-react";
import { Avatar } from "@/components/app/Avatar";
import { Bar, Card, EmptyState, PageHeader, StatCard } from "@/components/app/Bits";
import { supabase } from "@/integrations/supabase/client";
import { activitiesQuery, companiesQuery, opportunityQuery } from "@/lib/queries";
import { compactMoney, relativeDate, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/opportunities/$id")({
  head: () => ({
    meta: [
      { title: "Opportunity — Semos CRM" },
      { name: "description", content: "Opportunity details, stage progress and related activity." },
      { property: "og:title", content: "Opportunity — Semos CRM" },
      { property: "og:description", content: "Opportunity details, stage progress and related activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OpportunityDetail,
});

const STAGES = ["Qualification", "Discovery", "Proposal", "Negotiation", "Closing"];

function OpportunityDetail() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const opportunity = useQuery(opportunityQuery(id));
  const companies = useQuery(companiesQuery());
  const activities = useQuery(activitiesQuery());

  const opp = opportunity.data;
  const company = companies.data?.find((c) => c.id === opp?.company_id);

  const [stage, setStage] = useState("");
  const [probability, setProbability] = useState(0);
  const [expectedClose, setExpectedClose] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (opp) {
      setStage(opp.stage);
      setProbability(opp.probability);
      setExpectedClose(opp.expected_close ?? "");
      setNextStep(opp.next_step ?? "");
    }
  }, [opp]);

  if (opportunity.isLoading) {
    return <div className="skel h-40 animate-pulse" />;
  }

  if (!opp) {
    return (
      <EmptyState
        title="Opportunity not found"
        body="This opportunity may have been removed or the link is incorrect."
        action={
          <Link to="/opportunities" className="btn sm pri">
            Back to opportunities
          </Link>
        }
      />
    );
  }

  const related = (activities.data ?? []).filter(
    (a) => a.opportunity_id === opp.id || (opp.company_id && a.company_id === opp.company_id),
  );

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("opportunities")
      .update({
        stage,
        probability,
        expected_close: expectedClose || null,
        next_step: nextStep || null,
      })
      .eq("id", id);
    setSaving(false);
    if (error) {
      toast.error("Failed to update opportunity", { description: error.message });
      return;
    }
    toast.success("Opportunity updated");
    void queryClient.invalidateQueries({ queryKey: ["opportunity", id] });
    void queryClient.invalidateQueries({ queryKey: ["opportunities"] });
  }

  const stageIndex = STAGES.indexOf(opp.stage);

  return (
    <>
      <PageHeader
        title={opp.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-1.5">
            {company ? (
              <Link to="/companies/$id" params={{ id: company.id }} className="text-accent-ink">
                {company.name}
              </Link>
            ) : (
              "No company"
            )}
            <span>· {opp.stage} · {compactMoney(opp.value)} · {opp.probability}% probability</span>
          </span>
        }
        actions={
          <Link to="/opportunities" className="btn sm gh">
            All opportunities
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Value" value={compactMoney(opp.value)} />
        <StatCard label="Probability" value={`${opp.probability}%`} />
        <StatCard label="Weighted value" value={compactMoney((Number(opp.value ?? 0) * opp.probability) / 100)} />
        <StatCard label="Expected close" value={shortDate(opp.expected_close)} />
      </div>

      <Card title="Stage progress">
        <div className="flex items-center">
          {STAGES.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                    i <= stageIndex
                      ? "border-accent-2 bg-accent-soft text-accent-ink"
                      : "border-border text-ink-3"
                  }`}
                >
                  {i < stageIndex ? <Check className="h-3.5 w-3.5" /> : <CircleDot className="h-3.5 w-3.5" />}
                </div>
                <span className={`text-[11px] ${i === stageIndex ? "font-medium text-ink" : "text-ink-3"}`}>
                  {s}
                </span>
              </div>
              {i < STAGES.length - 1 ? (
                <div className={`mx-2 h-px flex-1 ${i < stageIndex ? "bg-accent-2" : "bg-border"}`} />
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card title="Edit opportunity" subtitle="Updates save directly to the database">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="lbl">Stage</span>
              <select className="field" value={stage} onChange={(e) => setStage(e.target.value)}>
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="lbl">Probability (%)</span>
              <input
                className="field"
                type="number"
                min={0}
                max={100}
                value={probability}
                onChange={(e) => setProbability(Number(e.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="lbl">Expected close</span>
              <input
                className="field"
                type="date"
                value={expectedClose ? expectedClose.slice(0, 10) : ""}
                onChange={(e) => setExpectedClose(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="lbl">Next step</span>
              <input
                className="field"
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
                placeholder="What happens next…"
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="btn sm pri" onClick={handleSave} disabled={saving} type="button">
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </Card>

        <Card title="Company snapshot">
          {company ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <Avatar name={company.name} size="lg" />
                <div>
                  <Link to="/companies/$id" params={{ id: company.id }} className="nm">
                    {company.name}
                  </Link>
                  <p className="text-[11.5px] text-ink-3">
                    {[company.industry, company.country].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between text-[12.5px]">
                  <span className="text-ink-3">Health score</span>
                  <span className="num font-medium">{company.health_score}</span>
                </div>
                <Bar
                  value={company.health_score}
                  tone={company.health_score >= 75 ? "ok" : company.health_score >= 50 ? "warn" : "bad"}
                />
              </div>
              <div className="kv">Revenue 12m</div>
              <span className="num">{compactMoney(company.revenue_12m)}</span>
              <div className="kv">Account manager</div>
              <span>{company.account_manager ?? "—"}</span>
            </div>
          ) : (
            <p className="text-[12.5px] text-ink-3">No company linked to this opportunity.</p>
          )}
        </Card>
      </div>

      <Card title="Related activity" subtitle={`${related.length} entries`}>
        {related.length === 0 ? (
          <p className="text-[12.5px] text-ink-3">No related activity yet.</p>
        ) : (
          <ol className="flex flex-col gap-3.5">
            {related.map((a) => (
              <li key={a.id} className="flex gap-2.5">
                <Avatar name={a.created_by ?? a.author ?? a.subject} size="xs" />
                <div className="min-w-0">
                  <p className="text-[12.5px] text-ink">
                    <b className="font-medium">{a.subject}</b>
                  </p>
                  <p className="text-[11.5px] text-ink-3">
                    {a.activity_type} · {relativeDate(a.occurred_at)}
                  </p>
                  {a.body ? <p className="mt-0.5 text-[12px] text-ink-2">{a.body}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </>
  );
}
