import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { Avatar } from "@/components/app/Avatar";
import {
  Bar,
  Card,
  EmptyState,
  HealthBadge,
  StatCard,
  StatusBadge,
  TableSkeleton,
} from "@/components/app/Bits";
import {
  activitiesQuery,
  companyQuery,
  contactsQuery,
  contractsQuery,
  opportunitiesQuery,
  projectsQuery,
} from "@/lib/queries";
import { compactMoney, money, relativeDate, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/companies/$id")({
  head: () => ({
    meta: [
      { title: "Company profile — Semos CRM" },
      { name: "description", content: "Full account profile: contacts, opportunities, projects, contracts and activity." },
      { property: "og:title", content: "Company profile — Semos CRM" },
      { property: "og:description", content: "Full account profile and activity timeline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompanyProfilePage,
});

type TabKey = "overview" | "contacts" | "opportunities" | "projects" | "contracts" | "activity";
const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "contacts", label: "Contacts" },
  { key: "opportunities", label: "Opportunities" },
  { key: "projects", label: "Projects" },
  { key: "contracts", label: "Contracts" },
  { key: "activity", label: "Activity" },
];

function CompanyProfilePage() {
  const { id } = useParams({ from: "/_authenticated/companies/$id" });
  const company = useQuery(companyQuery(id));
  const contacts = useQuery(contactsQuery(id));
  const opportunities = useQuery(opportunitiesQuery(id));
  const projects = useQuery(projectsQuery(id));
  const contracts = useQuery(contractsQuery(id));
  const activities = useQuery(activitiesQuery(id));
  const [tab, setTab] = useState<TabKey>("overview");

  if (company.isLoading) {
    return <TableSkeleton rows={8} cols={4} />;
  }

  if (!company.data) {
    return (
      <EmptyState
        title="Company not found"
        body="This company may have been removed or the link is incorrect."
        action={
          <Link to="/companies" className="btn sm pri">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to companies
          </Link>
        }
      />
    );
  }

  const c = company.data;
  const primaryContact = (contacts.data ?? []).find((x) => x.is_primary) ?? (contacts.data ?? [])[0];
  const healthy = c.health_score >= 75 ? 1 : 0;
  const attention = c.health_score >= 50 && c.health_score < 75 ? 1 : 0;
  const atRisk = c.health_score < 50 ? 1 : 0;

  return (
    <>
      <Link to="/companies" className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-3 hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> All companies
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={c.name} size="lg" />
          <div>
            <h1 className="text-[22px]">{c.name}</h1>
            <p className="mt-0.5 text-[12.5px] text-ink-3">
              {[c.industry, c.country, c.segment].filter(Boolean).join(" · ")}
            </p>
          </div>
          <HealthBadge score={c.health_score} label={c.health_label} />
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={c.contract_status} />
          {c.website ? (
            <a href={c.website} target="_blank" rel="noreferrer" className="btn sm">
              Website
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue 12m" value={compactMoney(c.revenue_12m)} />
        <StatCard label="Active projects" value={c.active_projects} />
        <StatCard label="Employees" value={c.employees ?? "—"} />
        <StatCard label="Client since" value={shortDate(c.client_since)} />
      </div>

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

      {tab === "overview" && (
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-4">
            <Card title="Notes">
              <p className="text-[12.5px] text-ink-2">{c.notes || "No notes recorded for this account."}</p>
            </Card>
            <Card title="Health breakdown">
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12.5px] text-ink-2">Healthy</span>
                    <span className="num text-[12.5px] font-medium">{healthy}</span>
                  </div>
                  <Bar value={healthy * 100} tone="ok" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12.5px] text-ink-2">Needs attention</span>
                    <span className="num text-[12.5px] font-medium">{attention}</span>
                  </div>
                  <Bar value={attention * 100} tone="warn" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12.5px] text-ink-2">At risk</span>
                    <span className="num text-[12.5px] font-medium">{atRisk}</span>
                  </div>
                  <Bar value={atRisk * 100} tone="bad" />
                </div>
              </div>
            </Card>
          </div>
          <div className="flex flex-col gap-4">
            <Card title="Primary contact">
              {primaryContact ? (
                <div className="flex items-center gap-2.5">
                  <Avatar name={primaryContact.full_name} size="xs" />
                  <div className="min-w-0">
                    <p className="nm">{primaryContact.full_name}</p>
                    <p className="text-[11.5px] text-ink-3">{primaryContact.job_title ?? "—"}</p>
                    <div className="mt-1 flex flex-col gap-0.5 text-[11.5px] text-ink-3">
                      {primaryContact.email ? (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {primaryContact.email}
                        </span>
                      ) : null}
                      {primaryContact.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {primaryContact.phone}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[12.5px] text-ink-3">No contacts recorded.</p>
              )}
            </Card>
            <Card title="Recent activity">
              <ol className="flex flex-col gap-3.5">
                {(activities.data ?? []).slice(0, 6).map((a) => (
                  <li key={a.id} className="flex gap-2.5">
                    <Avatar name={a.created_by ?? a.subject} size="xs" />
                    <div className="min-w-0">
                      <p className="text-[12.5px] text-ink">
                        <b className="font-medium">{a.subject}</b>
                      </p>
                      <p className="text-[11.5px] text-ink-3">
                        {a.activity_type} · {relativeDate(a.occurred_at)}
                      </p>
                    </div>
                  </li>
                ))}
                {(activities.data ?? []).length === 0 && (
                  <p className="text-[12.5px] text-ink-3">No activity recorded.</p>
                )}
              </ol>
            </Card>
          </div>
        </div>
      )}

      {tab === "contacts" && (
        <Card bodyClassName="">
          {contacts.isLoading ? (
            <TableSkeleton cols={5} />
          ) : (contacts.data ?? []).length === 0 ? (
            <EmptyState title="No contacts" body="No contacts recorded for this company." />
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Job title</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Last contacted</th>
                </tr>
              </thead>
              <tbody>
                {(contacts.data ?? []).map((ct) => (
                  <tr key={ct.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={ct.full_name} size="xs" />
                        <span className="nm">{ct.full_name}</span>
                        {ct.is_primary ? <span className="bdg acc">Primary</span> : null}
                      </div>
                    </td>
                    <td>{ct.job_title ?? "—"}</td>
                    <td>{ct.email ?? "—"}</td>
                    <td>{ct.phone ?? "—"}</td>
                    <td className="text-[12.5px] text-ink-3">{relativeDate(ct.last_contacted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === "opportunities" && (
        <Card bodyClassName="">
          {opportunities.isLoading ? (
            <TableSkeleton cols={5} />
          ) : (opportunities.data ?? []).length === 0 ? (
            <EmptyState title="No opportunities" body="No open or historical opportunities for this account." />
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Stage</th>
                  <th className="r">Value</th>
                  <th className="r">Probability</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {(opportunities.data ?? []).map((o) => (
                  <tr key={o.id}>
                    <td>
                      <span className="nm">{o.name}</span>
                      <span className="block text-[11.5px] text-ink-3">{o.next_step ?? "—"}</span>
                    </td>
                    <td>
                      <StatusBadge status={o.stage} />
                    </td>
                    <td className="r num">{money(o.value)}</td>
                    <td className="r num">{o.probability}%</td>
                    <td>{o.owner ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === "projects" && (
        <Card bodyClassName="">
          {projects.isLoading ? (
            <TableSkeleton cols={5} />
          ) : (projects.data ?? []).length === 0 ? (
            <EmptyState title="No projects" body="No delivery projects for this account." />
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th className="r">Budget</th>
                  <th className="r">Progress</th>
                  <th>Delivery manager</th>
                </tr>
              </thead>
              <tbody>
                {(projects.data ?? []).map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="nm">{p.name}</span>
                      <span className="block text-[11.5px] text-ink-3">{p.code ?? "—"}</span>
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="r num">{money(p.budget)}</td>
                    <td className="r num">{p.progress}%</td>
                    <td>{p.delivery_manager ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === "contracts" && (
        <Card bodyClassName="">
          {contracts.isLoading ? (
            <TableSkeleton cols={5} />
          ) : (contracts.data ?? []).length === 0 ? (
            <EmptyState title="No contracts" body="No contracts recorded for this account." />
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Contract</th>
                  <th>Status</th>
                  <th className="r">Value</th>
                  <th>End date</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {(contracts.data ?? []).map((ct) => (
                  <tr key={ct.id}>
                    <td>
                      <span className="nm">{ct.title}</span>
                      <span className="block text-[11.5px] text-ink-3">{ct.contract_type}</span>
                    </td>
                    <td>
                      <StatusBadge status={ct.status} />
                    </td>
                    <td className="r num">{money(ct.value, ct.currency)}</td>
                    <td className="text-[12.5px]">{shortDate(ct.end_date)}</td>
                    <td>{ct.owner ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {tab === "activity" && (
        <Card bodyClassName="p-4">
          {activities.isLoading ? (
            <TableSkeleton cols={3} />
          ) : (activities.data ?? []).length === 0 ? (
            <EmptyState title="No activity" body="No activity recorded for this account." />
          ) : (
            <ol className="flex flex-col gap-4">
              {(activities.data ?? []).map((a) => (
                <li key={a.id} className="flex gap-2.5">
                  <Avatar name={a.created_by ?? a.subject} size="xs" />
                  <div className="min-w-0">
                    <p className="text-[12.5px] text-ink">
                      <b className="font-medium">{a.subject}</b>
                    </p>
                    <p className="text-[11.5px] text-ink-3">
                      {a.activity_type} · {a.author ?? a.created_by ?? "—"} · {relativeDate(a.occurred_at)}
                    </p>
                    {a.body ? <p className="mt-1 text-[12px] text-ink-2">{a.body}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      )}
    </>
  );
}
