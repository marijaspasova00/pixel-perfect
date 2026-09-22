import type { ReactNode } from "react";
import { healthTone, statusTone } from "@/lib/format";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[22px]">{title}</h1>
        {subtitle ? <p className="mt-1 text-[12.5px] text-ink-3">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "ok" | "warn" | "bad";
}) {
  const color = tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : tone === "bad" ? "text-bad" : "";
  return (
    <div className="card lift flex flex-col gap-1 px-4 py-3">
      <span className="kv">{label}</span>
      <span className={`display text-[21px] font-semibold ${color}`}>{value}</span>
      {hint ? <span className="text-[11.5px] text-ink-3">{hint}</span> : null}
    </div>
  );
}

export function Badge({
  children,
  tone,
  outline,
}: {
  children: ReactNode;
  tone?: "" | "ok" | "warn" | "bad" | "acc";
  outline?: boolean;
}) {
  return <span className={["bdg", outline ? "out" : (tone ?? "")].join(" ")}>{children}</span>;
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const tone = statusTone(status) as "" | "ok" | "warn" | "bad";
  return <Badge tone={tone}>{status ?? "—"}</Badge>;
}

export function HealthBadge({ score, label }: { score: number; label?: string | null }) {
  const tone = healthTone(score) as "ok" | "warn" | "bad";
  return (
    <span className={`bdg ${tone}`}>
      <span className="dot" />
      {label ?? (tone === "ok" ? "Healthy" : tone === "warn" ? "Needs attention" : "At risk")}
      <b className="font-semibold">{score}</b>
    </span>
  );
}

export function Bar({ value, tone }: { value: number; tone?: "ok" | "warn" | "bad" }) {
  const bg =
    tone === "ok"
      ? "var(--ok)"
      : tone === "warn"
        ? "var(--warn)"
        : tone === "bad"
          ? "var(--bad)"
          : "var(--accent-2)";
  return (
    <div className="bar">
      <i style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: bg }} />
    </div>
  );
}

export function Card({
  title,
  subtitle,
  actions,
  children,
  className = "",
  bodyClassName = "p-4",
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`card ${className}`}>
      {title ? (
        <div className="ch">
          <div>
            <div className="ct">{title}</div>
            {subtitle ? <div className="cs">{subtitle}</div> : null}
          </div>
          {actions ? <div className="ml-auto flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <p className="display text-[14px] font-semibold">{title}</p>
      {body ? <p className="max-w-sm text-[12.5px] text-ink-3">{body}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="flex flex-col gap-2 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((__, c) => (
            <div key={c} className="skel h-4 animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Filters({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="btn sm gap-1.5">
      <span className="text-ink-3">{label}</span>
      <select
        className="bg-transparent font-medium outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="All">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
