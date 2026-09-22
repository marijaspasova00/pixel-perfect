import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/app/Avatar";
import {
  Card,
  EmptyState,
  PageHeader,
  StatCard,
  StatusBadge,
  TableSkeleton,
} from "@/components/app/Bits";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  activitiesQuery,
  companiesQuery,
  opportunitiesQuery,
  tasksQuery,
} from "@/lib/queries";
import { compactMoney, daysUntil, relativeDate, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/workspace")({
  head: () => ({
    meta: [
      { title: "My Workspace — Semos CRM" },
      {
        name: "description",
        content: "Your tasks, accounts, pipeline and recent activity in one place.",
      },
      { property: "og:title", content: "My Workspace — Semos CRM" },
      {
        property: "og:description",
        content: "Your tasks, accounts, pipeline and recent activity in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkspacePage,
});

function WorkspacePage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const tasks = useQuery(tasksQuery());
  const companies = useQuery(companiesQuery());
  const opportunities = useQuery(opportunitiesQuery());
  const activities = useQuery(activitiesQuery());

  const name = profile?.full_name ?? "";
  const myTasks = (tasks.data ?? []).filter((t) => t.assignee === name);
  const myAccounts = (companies.data ?? []).filter((c) => c.account_manager === name);
  const myOpps = (opportunities.data ?? []).filter((o) => o.owner === name);

  const openTasks = myTasks.filter((t) => t.status !== "Done");
  const overdueTasks = openTasks.filter((t) => {
    const d = daysUntil(t.due_date);
    return d !== null && d < 0;
  });
  const pipelineValue = myOpps.reduce((a, o) => a + Number(o.value ?? 0), 0);

  const companyName = (id: string | null) =>
    (companies.data ?? []).find((c) => c.id === id)?.name ?? "—";

  async function toggleDone(taskId: string, currentStatus: string) {
    const nextStatus = currentStatus === "Done" ? "Open" : "Done";
    const { error } = await supabase.from("tasks").update({ status: nextStatus }).eq("id", taskId);
    if (error) {
      toast.error("Failed to update task", { description: error.message });
      return;
    }
    toast.success(nextStatus === "Done" ? "Task marked done" : "Task reopened");
    void queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  const sortedTasks = [...myTasks].sort((a, b) => {
    if (a.status === "Done" && b.status !== "Done") return 1;
    if (a.status !== "Done" && b.status === "Done") return -1;
    return (a.due_date ?? "").localeCompare(b.due_date ?? "");
  });

  return (
    <>
      <PageHeader
        title={`My Workspace — ${profile?.full_name?.split(" ")[0] ?? "there"}`}
        subtitle="Your tasks, accounts, pipeline and recent activity."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open tasks" value={openTasks.length} />
        <StatCard
          label="Overdue tasks"
          value={overdueTasks.length}
          tone={overdueTasks.length > 0 ? "bad" : "ok"}
        />
        <StatCard label="My pipeline value" value={compactMoney(pipelineValue)} hint={`${myOpps.length} opportunities`} />
        <StatCard label="My accounts" value={myAccounts.length} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card title="My tasks" subtitle="Check off to mark done" bodyClassName="">
          {tasks.isLoading ? (
            <TableSkeleton cols={4} />
          ) : sortedTasks.length === 0 ? (
            <EmptyState title="No tasks assigned to you" />
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th></th>
                  <th>Task</th>
                  <th>Priority</th>
                  <th className="r">Due</th>
                </tr>
              </thead>
              <tbody>
                {sortedTasks.map((t) => {
                  const done = t.status === "Done";
                  const overdue = !done && (daysUntil(t.due_date) ?? 1) < 0;
                  return (
                    <tr key={t.id}>
                      <td>
                        <button
                          type="button"
                          onClick={() => toggleDone(t.id, t.status)}
                          className={`flex h-5 w-5 items-center justify-center rounded border ${
                            done ? "border-ok bg-ok-soft text-ok" : "border-border-strong text-transparent"
                          }`}
                          aria-label={done ? "Mark as open" : "Mark as done"}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </td>
                      <td>
                        <span className={`nm ${done ? "text-ink-3 line-through" : ""}`}>{t.title}</span>
                        <span className="block text-[11.5px] text-ink-3">{companyName(t.company_id)}</span>
                      </td>
                      <td>
                        <StatusBadge status={t.priority} />
                      </td>
                      <td className={`r text-[12.5px] ${overdue ? "text-bad" : "text-ink-3"}`}>
                        {shortDate(t.due_date)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Recent activity" subtitle="Across your accounts">
          {activities.isLoading ? (
            <TableSkeleton cols={2} />
          ) : (
            <ol className="flex flex-col gap-3.5">
              {(activities.data ?? [])
                .filter((a) => myAccounts.some((c) => c.id === a.company_id))
                .slice(0, 8)
                .map((a) => (
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
              {activities.data && myAccounts.length > 0 &&
                (activities.data ?? []).filter((a) => myAccounts.some((c) => c.id === a.company_id)).length === 0 ? (
                <p className="text-[12.5px] text-ink-3">No recent activity on your accounts.</p>
              ) : null}
            </ol>
          )}
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="My accounts" subtitle={`${myAccounts.length} accounts`} bodyClassName="">
          {myAccounts.length === 0 ? (
            <EmptyState title="No accounts assigned" body="You are not the account manager for any company." />
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Health</th>
                  <th className="r">Revenue 12m</th>
                </tr>
              </thead>
              <tbody>
                {myAccounts.map((c) => (
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
                      <StatusBadge status={c.health_label} />
                    </td>
                    <td className="r num">{compactMoney(c.revenue_12m)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="My opportunities" subtitle={`${myOpps.length} opportunities`} bodyClassName="">
          {myOpps.length === 0 ? (
            <EmptyState title="No opportunities owned" />
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Stage</th>
                  <th className="r">Value</th>
                </tr>
              </thead>
              <tbody>
                {myOpps.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link to="/opportunities/$id" params={{ id: o.id }} className="nm">
                        {o.name}
                      </Link>
                      <span className="block text-[11.5px] text-ink-3">{companyName(o.company_id)}</span>
                    </td>
                    <td>
                      <StatusBadge status={o.stage} />
                    </td>
                    <td className="r num">{compactMoney(o.value)}</td>
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
