import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Moon, Plus, Search, Sun } from "lucide-react";
import { Avatar } from "@/components/app/Avatar";
import { CommandPalette } from "@/components/app/CommandPalette";
import { QuickCreate } from "@/components/app/QuickCreate";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

const LABELS: Record<string, string> = {
  "": "Dashboard",
  workspace: "My Workspace",
  companies: "Companies",
  contacts: "Contacts",
  "client-health": "Client Health",
  opportunities: "Opportunities",
  pipeline: "Pipeline",
  projects: "Projects",
  recruitment: "Recruitment",
  skills: "Skills & Availability",
  contracts: "Contracts",
  management: "Management",
  admin: "Roles & Audit Log",
};

export function Topbar() {
  const [search, setSearch] = useState(false);
  const [create, setCreate] = useState(false);
  const { profile, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const segments = pathname.split("/").filter(Boolean);
  const current = LABELS[segments[0] ?? ""] ?? "Detail";

  return (
    <header className="hdr">
      <div className="crumb">
        <span>Semos CRM</span>
        <span className="sep-c">/</span>
        <b>{current}</b>
      </div>

      <button className="srch ml-auto max-w-[360px] flex-1" onClick={() => setSearch(true)}>
        <Search className="h-4 w-4 text-ink-3" />
        <span className="text-ink-3">Search everything…</span>
        <span className="kbd ml-auto">⌘K</span>
      </button>

      <button className="btn sm pri" onClick={() => setCreate(true)}>
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Quick create</span>
      </button>

      <button className="btn sm ico" onClick={toggle} aria-label="Toggle dark mode">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <Link to="/workspace" className="btn sm ico" aria-label="Notifications">
        <Bell className="h-4 w-4" />
      </Link>

      <div className="vsep" />

      <div className="flex items-center gap-2">
        <Avatar name={profile?.full_name ?? profile?.email ?? "Semos User"} />
        <div className="hidden flex-col leading-tight md:flex">
          <span className="text-[12.5px] font-medium">{profile?.full_name ?? "Semos User"}</span>
          <span className="text-[11px] text-ink-3">{profile?.job_title ?? "Team member"}</span>
        </div>
        <button className="btn sm" onClick={() => void signOut()}>
          Sign out
        </button>
      </div>

      <CommandPalette open={search} onClose={() => setSearch(false)} />
      <QuickCreate open={create} onClose={() => setCreate(false)} />
    </header>
  );
}
