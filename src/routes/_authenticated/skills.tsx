import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/app/Avatar";
import {
  Bar,
  Card,
  EmptyState,
  FilterSelect,
  Filters,
  PageHeader,
  StatCard,
  StatusBadge,
  TableSkeleton,
} from "@/components/app/Bits";
import { consultantSkillsQuery, consultantsQuery, skillsQuery, type Consultant } from "@/lib/queries";
import { compactMoney, daysUntil, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/skills")({
  head: () => ({
    meta: [
      { title: "Skills & Availability — Semos CRM" },
      { name: "description", content: "Consultant utilization, availability and the full skills matrix." },
      { property: "og:title", content: "Skills & Availability — Semos CRM" },
      { property: "og:description", content: "Consultant utilization, availability and the full skills matrix." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SkillsPage,
});

function SkillsPage() {
  const consultants = useQuery(consultantsQuery());
  const skills = useQuery(skillsQuery());
  const consultantSkills = useQuery(consultantSkillsQuery());

  const [skillFilter, setSkillFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [seniorityFilter, setSeniorityFilter] = useState("All");

  const consultantList = consultants.data ?? [];
  const skillList = skills.data ?? [];
  const csList = consultantSkills.data ?? [];

  const categories = useMemo(
    () => Array.from(new Set(skillList.map((s) => s.category).filter(Boolean))) as string[],
    [skillList],
  );
  const availabilities = useMemo(
    () => Array.from(new Set(consultantList.map((c) => c.availability).filter(Boolean))) as string[],
    [consultantList],
  );
  const seniorities = useMemo(
    () => Array.from(new Set(consultantList.map((c) => c.seniority).filter(Boolean))) as string[],
    [consultantList],
  );

  const bench = consultantList.filter((c) => c.availability === "Bench").length;
  const avgUtilization = consultantList.length
    ? consultantList.reduce((a, c) => a + Number(c.utilization ?? 0), 0) / consultantList.length
    : 0;
  const availableSoon = consultantList.filter((c) => {
    const d = daysUntil(c.available_from);
    return d !== null && d <= 30;
  }).length;

  let rows: Consultant[] = consultantList;
  if (availabilityFilter !== "All") rows = rows.filter((c) => c.availability === availabilityFilter);
  if (seniorityFilter !== "All") rows = rows.filter((c) => c.seniority === seniorityFilter);
  if (skillFilter !== "All") {
    const skillId = skillList.find((s) => s.name === skillFilter)?.id;
    const ids = new Set(csList.filter((cs) => cs.skill_id === skillId).map((cs) => cs.consultant_id));
    rows = rows.filter((c) => ids.has(c.id));
  }

  const filteredSkills = categoryFilter === "All" ? skillList : skillList.filter((s) => s.category === categoryFilter);
  const categoriesGrouped = useMemo(() => {
    const groups: Record<string, typeof skillList> = {};
    for (const s of filteredSkills) {
      groups[s.category] = groups[s.category] ?? [];
      groups[s.category]!.push(s);
    }
    return groups;
  }, [filteredSkills]);

  const levelFor = (consultantId: string, skillId: string) =>
    csList.find((cs) => cs.consultant_id === consultantId && cs.skill_id === skillId)?.level ?? 0;

  return (
    <>
      <PageHeader title="Skills & Availability" subtitle="Consultant utilization, bench status and skills coverage." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Bench" value={bench} tone={bench > 0 ? "warn" : "ok"} />
        <StatCard label="Average utilization" value={`${avgUtilization.toFixed(0)}%`} />
        <StatCard label="Available within 30 days" value={availableSoon} />
        <StatCard label="Distinct skills" value={skillList.length} />
      </div>

      <Filters>
        <FilterSelect label="Skill" value={skillFilter} options={skillList.map((s) => s.name)} onChange={setSkillFilter} />
        <FilterSelect label="Category" value={categoryFilter} options={categories} onChange={setCategoryFilter} />
        <FilterSelect label="Availability" value={availabilityFilter} options={availabilities} onChange={setAvailabilityFilter} />
        <FilterSelect label="Seniority" value={seniorityFilter} options={seniorities} onChange={setSeniorityFilter} />
      </Filters>

      <Card title="Consultants" subtitle={`${rows.length} consultants`} bodyClassName="">
        {consultants.isLoading ? (
          <TableSkeleton cols={7} />
        ) : rows.length === 0 ? (
          <EmptyState title="No consultants found" body="Try adjusting filters." />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Consultant</th>
                <th>Utilization</th>
                <th>Availability</th>
                <th className="r">Day rate</th>
                <th>Current project</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.full_name} size="xs" />
                      <div>
                        <span className="nm">{c.full_name}</span>
                        <span className="block text-[11.5px] text-ink-3">
                          {[c.seniority, c.job_title].filter(Boolean).join(" · ")}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <Bar
                        value={c.utilization}
                        tone={c.utilization >= 85 ? "bad" : c.utilization >= 60 ? "warn" : "ok"}
                      />
                      <span className="num text-[11.5px]">{c.utilization}%</span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={c.availability} />
                    {c.availability !== "Available" ? (
                      <span className="block text-[11px] text-ink-3">from {shortDate(c.available_from)}</span>
                    ) : null}
                  </td>
                  <td className="r num">{c.day_rate ? compactMoney(c.day_rate) : "—"}</td>
                  <td>{c.current_project ?? "—"}</td>
                  <td>{c.location ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card title="Skills matrix" subtitle="Levels 1–5 per consultant, grouped by category" bodyClassName="overflow-x-auto p-0">
        {Object.keys(categoriesGrouped).length === 0 ? (
          <EmptyState title="No skills found" />
        ) : (
          Object.entries(categoriesGrouped).map(([category, catSkills]) => (
            <div key={category} className="border-b border-border p-4 last:border-0">
              <h3 className="mb-2 text-[12.5px] font-medium text-ink-2">{category}</h3>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Consultant</th>
                    {catSkills.map((s) => (
                      <th key={s.id} className="r">
                        {s.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.id}>
                      <td>{c.full_name}</td>
                      {catSkills.map((s) => {
                        const level = levelFor(c.id, s.id);
                        return (
                          <td key={s.id} className="r">
                            {level > 0 ? (
                              <span className="flex justify-end gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span
                                    key={i}
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      i < level ? "bg-accent-2" : "bg-surface-3"
                                    }`}
                                  />
                                ))}
                              </span>
                            ) : (
                              <span className="text-ink-3">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </Card>
    </>
  );
}
