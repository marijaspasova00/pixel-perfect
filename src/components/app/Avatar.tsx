import { initialsOf, toneClass } from "@/lib/format";

export function Avatar({
  name,
  size,
  className = "",
}: {
  name: string | null | undefined;
  size?: "xs" | "lg" | "xl";
  className?: string;
}) {
  return (
    <span
      className={["av", toneClass(name), size ?? "", className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  );
}
