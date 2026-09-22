import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  ClipboardList,
  Contact,
  FileText,
  GraduationCap,
  KanbanSquare,
  LayoutGrid,
  Layers,
  LineChart,
  ShieldCheck,
  Target,
  UserPlus,
} from "lucide-react";
import type { ComponentType } from "react";
import {
  candidatesQuery,
  companiesQuery,
  contactsQuery,
  contractsQuery,
  opportunitiesQuery,
  projectsQuery,
} from "@/lib/queries";

type Item = { to: string; label: string; icon: ComponentType<{ className?: string }>; count?: number };

export function Sidebar() {
  const companies = useQuery(companiesQuery());
  const contacts = useQuery(contactsQuery());
  const opportunities = useQuery(opportunitiesQuery());
  const projects = useQuery(projectsQuery());
  const candidates = useQuery(candidatesQuery());
  const contracts = useQuery(contractsQuery());

  const groups: { label: string; items: Item[] }[] = [
    {
      label: "Overview",
      items: [
        { to: "/", label: "Dashboard", icon: LayoutGrid },
        { to: "/workspace", label: "My Workspace", icon: Layers },
        { to: "/management", label: "Management", icon: LineChart },
      ],
    },
    {
      label: "Clients",
      items: [
        { to: "/companies", label: "Companies", icon: Building2, count: companies.data?.length },
        { to: "/contacts", label: "Contacts", icon: Contact, count: contacts.data?.length },
        { to: "/client-health", label: "Client Health", icon: LineChart },
      ],
    },
    {
      label: "Sales",
      items: [
        {
          to: "/opportunities",
          label: "Opportunities",
          icon: Target,
          count: opportunities.data?.length,
        },
        { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
      ],
    },
    {
      label: "Projects",
      items: [{ to: "/projects", label: "Projects", icon: ClipboardList, count: projects.data?.length }],
    },
    {
      label: "People",
      items: [
        { to: "/recruitment", label: "Recruitment", icon: UserPlus, count: candidates.data?.length },
        { to: "/skills", label: "Skills & Availability", icon: GraduationCap },
      ],
    },
    {
      label: "Documents",
      items: [{ to: "/contracts", label: "Contracts", icon: FileText, count: contracts.data?.length }],
    },
    {
      label: "Admin",
      items: [{ to: "/admin", label: "Roles & Audit Log", icon: ShieldCheck }],
    },
  ];

  return (
    <nav className="side hidden lg:flex" aria-label="Main">
      <div
        className="flex h-14 flex-shrink-0 items-center gap-2.5 px-[18px]"
        style={{ borderBottom: "1px solid var(--side-line)" }}
      >
        <div
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[7px]"
          style={{ background: "linear-gradient(160deg, var(--s5), var(--s7))" }}
        >
          <span className="display text-[14px] font-bold text-white">S</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="display text-[13px] font-bold tracking-[0.09em] text-white">SEMOS</span>
          <span className="text-[9px] tracking-[0.17em] text-side-ink-2">IT GROUP</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1.5">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="sgrp">{g.label}</div>
            <div className="snav">
              {g.items.map((it) => (
                <Link
                  key={it.to}
                  to={it.to}
                  activeOptions={{ exact: it.to === "/" }}
                  className="sitem"
                  activeProps={{ className: "sitem on" }}
                >
                  <it.icon />
                  <span>{it.label}</span>
                  {typeof it.count === "number" ? <span className="scount">{it.count}</span> : null}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
