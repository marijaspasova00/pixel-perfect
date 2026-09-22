import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/app/Avatar";
import { Badge, Card, EmptyState, PageHeader, StatCard, TableSkeleton } from "@/components/app/Bits";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { auditQuery, rolesQuery, teamQuery } from "@/lib/queries";
import { relativeDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Roles & audit log — Semos CRM" },
      { name: "description", content: "Team roles, permissions and the system audit log." },
      { property: "og:title", content: "Roles & audit log — Semos CRM" },
      { property: "og:description", content: "Team roles, permissions and the system audit log." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const ALL_ROLES: AppRole[] = ["admin", "manager", "member"];

function AdminPage() {
  const { roles } = useAuth();
  const queryClient = useQueryClient();
  const team = useQuery(teamQuery());
  const userRoles = useQuery(rolesQuery());
  const audit = useQuery(auditQuery());

  const isAdmin = roles.includes("admin");
  const members = team.data ?? [];
  const roleRows = userRoles.data ?? [];
  const auditRows = audit.data ?? [];

  function rolesFor(userId: string) {
    return roleRows.filter((r) => r.user_id === userId).map((r) => r.role);
  }

  async function toggleRole(userId: string, role: AppRole, has: boolean) {
    if (!isAdmin) return;
    if (has) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) {
        toast.error("Failed to remove role", { description: error.message });
        return;
      }
      toast.success(`Removed ${role} role`);
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) {
        toast.error("Failed to assign role", { description: error.message });
        return;
      }
      toast.success(`Assigned ${role} role`);
    }
    void queryClient.invalidateQueries({ queryKey: ["user_roles"] });
  }

  const adminCount = new Set(roleRows.filter((r) => r.role === "admin").map((r) => r.user_id)).size;

  return (
    <>
      <PageHeader
        title="Roles & audit log"
        subtitle="Team permissions and a record of recent system activity."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Team members" value={members.length} />
        <StatCard label="Admins" value={adminCount} />
        <StatCard label="Role assignments" value={roleRows.length} />
        <StatCard label="Audit entries" value={auditRows.length} />
      </div>

      {!isAdmin ? (
        <div className="card flex items-center gap-2.5 px-4 py-3 text-[12.5px] text-ink-2">
          <Lock className="h-4 w-4 text-ink-3" />
          Role assignment is read-only. Only admins can change team roles.
        </div>
      ) : null}

      <Card title="Team" subtitle={`${members.length} members`} bodyClassName="">
        {team.isLoading ? (
          <TableSkeleton cols={4} />
        ) : members.length === 0 ? (
          <EmptyState title="No team members found" />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Job title</th>
                <th>Roles</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const memberRoles = rolesFor(m.id);
                return (
                  <tr key={m.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={m.full_name} size="xs" />
                        <span className="nm">{m.full_name}</span>
                      </div>
                    </td>
                    <td className="text-ink-3">{m.email ?? "—"}</td>
                    <td>{m.job_title ?? "—"}</td>
                    <td>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {ALL_ROLES.map((role) => {
                          const has = memberRoles.includes(role);
                          return (
                            <button
                              key={role}
                              type="button"
                              disabled={!isAdmin}
                              onClick={() => toggleRole(m.id, role, has)}
                              className={`bdg ${has ? (role === "admin" ? "acc" : "ok") : "out"} ${
                                isAdmin ? "cursor-pointer" : "cursor-default opacity-70"
                              }`}
                            >
                              {role === "admin" ? <ShieldCheck className="h-3 w-3" /> : null}
                              {role}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <Card title="Audit log" subtitle="Most recent 50 entries" bodyClassName="">
        {audit.isLoading ? (
          <TableSkeleton cols={6} />
        ) : auditRows.length === 0 ? (
          <EmptyState title="No audit entries yet" />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Detail</th>
                <th>IP address</th>
                <th className="r">When</th>
              </tr>
            </thead>
            <tbody>
              {auditRows.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={a.actor} size="xs" />
                      <span className="nm">{a.actor}</span>
                    </div>
                  </td>
                  <td>
                    <Badge>{a.action}</Badge>
                  </td>
                  <td>
                    <span className="text-ink">{a.entity}</span>
                    {a.entity_label ? (
                      <span className="block text-[11.5px] text-ink-3">{a.entity_label}</span>
                    ) : null}
                  </td>
                  <td className="text-[12.5px] text-ink-3">{a.detail ?? "—"}</td>
                  <td className="mono text-[11.5px] text-ink-3">{a.ip_address ?? "—"}</td>
                  <td className="r text-[12.5px] text-ink-3">{relativeDate(a.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
