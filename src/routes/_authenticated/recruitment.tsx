import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/app/Avatar";
import {
  Card,
  EmptyState,
  FilterSelect,
  Filters,
  PageHeader,
  StatCard,
  StatusBadge,
  TableSkeleton,
} from "@/components/app/Bits";
import { supabase } from "@/integrations/supabase/client";
import { candidatesQuery, type Candidate } from "@/lib/queries";
import { compactMoney, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/recruitment")({
  head: () => ({
    meta: [
      { title: "Recruitment — Semos CRM" },
      { name: "description", content: "Candidate pipeline, stages, ratings and interview scheduling." },
      { property: "og:title", content: "Recruitment — Semos CRM" },
      { property: "og:description", content: "Candidate pipeline, stages, ratings and interview scheduling." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RecruitmentPage,
});

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < Math.round(rating) ? "fill-warn text-warn" : "text-ink-3"}`}
        />
      ))}
    </span>
  );
}

function RecruitmentPage() {
  const queryClient = useQueryClient();
  const candidates = useQuery(candidatesQuery());

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("All");
  const [seniority, setSeniority] = useState("All");
  const [recruiter, setRecruiter] = useState("All");
  const [source, setSource] = useState("All");

  const list = candidates.data ?? [];

  const stages = useMemo(
    () => Array.from(new Set(list.map((c) => c.stage).filter(Boolean))) as string[],
    [list],
  );
  const seniorities = useMemo(
    () => Array.from(new Set(list.map((c) => c.seniority).filter(Boolean))) as string[],
    [list],
  );
  const recruiters = useMemo(
    () => Array.from(new Set(list.map((c) => c.recruiter).filter(Boolean))) as string[],
    [list],
  );
  const sources = useMemo(
    () => Array.from(new Set(list.map((c) => c.source).filter(Boolean))) as string[],
    [list],
  );

  const inInterview = list.filter((c) => c.stage === "Interview").length;
  const offersOut = list.filter((c) => c.stage === "Offer").length;
  const avgRating = list.length
    ? list.reduce((a, c) => a + Number(c.rating ?? 0), 0) / list.length
    : 0;

  let rows: Candidate[] = list;
  if (stage !== "All") rows = rows.filter((c) => c.stage === stage);
  if (seniority !== "All") rows = rows.filter((c) => c.seniority === seniority);
  if (recruiter !== "All") rows = rows.filter((c) => c.recruiter === recruiter);
  if (source !== "All") rows = rows.filter((c) => c.source === source);
  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter(
      (c) => c.full_name.toLowerCase().includes(s) || c.role_applied.toLowerCase().includes(s),
    );
  }

  async function changeStage(id: string, newStage: string) {
    const { error } = await supabase.from("candidates").update({ stage: newStage }).eq("id", id);
    if (error) {
      toast.error("Failed to update stage", { description: error.message });
      return;
    }
    toast.success("Candidate stage updated");
    void queryClient.invalidateQueries({ queryKey: ["candidates"] });
  }

  return (
    <>
      <PageHeader title="Recruitment" subtitle="Candidate pipeline across all open roles." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Candidates" value={list.length} />
        <StatCard label="In interview" value={inInterview} />
        <StatCard label="Offers out" value={offersOut} {...(offersOut > 0 ? { tone: "warn" as const } : {})} />
        <StatCard label="Average rating" value={avgRating.toFixed(1)} />
      </div>

      <Filters>
        <div className="btn sm gap-1.5">
          <Search className="h-3.5 w-3.5 text-ink-3" />
          <input
            className="w-40 bg-transparent outline-none placeholder:text-ink-3"
            placeholder="Search candidates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <FilterSelect label="Stage" value={stage} options={stages} onChange={setStage} />
        <FilterSelect label="Seniority" value={seniority} options={seniorities} onChange={setSeniority} />
        <FilterSelect label="Recruiter" value={recruiter} options={recruiters} onChange={setRecruiter} />
        <FilterSelect label="Source" value={source} options={sources} onChange={setSource} />
      </Filters>

      <Card title="Pipeline by stage" subtitle="Candidates grouped by current stage">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(1, stages.length)}, minmax(0,1fr))` }}>
          {stages.map((s) => {
            const inStage = list.filter((c) => c.stage === s);
            return (
              <div key={s} className="flex flex-col gap-2 rounded-lg border border-border bg-surface-2 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-ink-2">{s}</span>
                  <span className="bdg">{inStage.length}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {inStage.slice(0, 4).map((c) => (
                    <div key={c.id} className="flex items-center gap-1.5">
                      <Avatar name={c.full_name} size="xs" />
                      <span className="truncate text-[11.5px] text-ink">{c.full_name}</span>
                    </div>
                  ))}
                  {inStage.length > 4 ? (
                    <span className="text-[11px] text-ink-3">+{inStage.length - 4} more</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card bodyClassName="">
        {candidates.isLoading ? (
          <TableSkeleton cols={8} />
        ) : rows.length === 0 ? (
          <EmptyState title="No candidates found" body="Try adjusting filters or search." />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Role applied</th>
                <th>Seniority</th>
                <th>Stage</th>
                <th>Rating</th>
                <th>Recruiter</th>
                <th className="r">Expected salary</th>
                <th>Next interview</th>
                <th>Applied</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.full_name} size="xs" />
                      <span className="nm">{c.full_name}</span>
                    </div>
                  </td>
                  <td>{c.role_applied}</td>
                  <td>{c.seniority ?? "—"}</td>
                  <td>
                    <StatusBadge status={c.stage} />
                  </td>
                  <td>
                    <RatingStars rating={c.rating} />
                  </td>
                  <td>{c.recruiter ?? "—"}</td>
                  <td className="r num">{c.expected_salary ? compactMoney(c.expected_salary) : "—"}</td>
                  <td className="text-[12.5px] text-ink-3">{shortDate(c.next_interview_at)}</td>
                  <td className="text-[12.5px] text-ink-3">{shortDate(c.applied_at)}</td>
                  <td>
                    <select
                      className="field h-7 py-0 text-[12px]"
                      value={c.stage}
                      onChange={(e) => changeStage(c.id, e.target.value)}
                    >
                      {stages.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
