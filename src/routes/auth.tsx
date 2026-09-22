import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import "@lovable.dev/cloud-auth-js/styles.css";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search["next"] === "string" ? (search["next"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Semos CRM" },
      {
        name: "description",
        content: "Sign in to the Semos IT Group CRM to manage clients, pipeline and projects.",
      },
      { property: "og:title", content: "Sign in — Semos CRM" },
      {
        property: "og:description",
        content: "Sign in to the Semos IT Group CRM to manage clients, pipeline and projects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function safeNext(next: string | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();
  const { next } = useSearch({ from: "/auth" });
  const target = safeNext(next);

  useEffect(() => {
    if (session) void navigate({ to: target, replace: true });
  }, [session, target, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${target}`,
            data: { full_name: fullName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          toast.success("Check your inbox to confirm your address.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth?next=${encodeURIComponent(target)}`,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section
        className="relative hidden flex-col justify-between p-12 lg:flex"
        style={{ background: "linear-gradient(165deg, var(--side), var(--s7))" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-[9px]"
            style={{ background: "linear-gradient(160deg, var(--s5), var(--s7))" }}
          >
            <span className="display text-[17px] font-bold text-white">S</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="display text-[15px] font-bold tracking-[0.1em] text-white">SEMOS</span>
            <span className="text-[10px] tracking-[0.2em] text-side-ink-2">IT GROUP</span>
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="display text-[34px] leading-[1.15] font-semibold text-white">
            One workspace for clients, pipeline and delivery.
          </h1>
          <p className="mt-4 text-[13.5px] leading-relaxed text-side-ink">
            Account health, opportunities, projects, consultants and contracts — together, with the
            numbers your team actually reports on.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              ["128", "Clients"],
              ["€21.4M", "Managed revenue"],
              ["96", "Healthy accounts"],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="display text-[20px] font-semibold text-white">{v}</div>
                <div className="text-[11px] tracking-wide text-side-ink-2 uppercase">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11.5px] text-side-ink-2">
          Semos IT Group · Internal client relationship platform
        </p>
      </section>

      <section className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="display text-[22px] font-semibold">
            {mode === "signin" ? "Sign in" : "Create your account"}
          </h2>
          <p className="mt-1 text-[12.5px] text-ink-3">
            {mode === "signin"
              ? "Use your Semos work account."
              : "Register with your work email to get started."}
          </p>

          {sent ? (
            <div className="card mt-6 p-4 text-[12.5px] text-ink-2">
              We sent a confirmation link to <b>{email}</b>. Open it to activate your account, then
              sign in.
            </div>
          ) : null}

          <button type="button" className="lovable-auth-button mt-6 w-full" onClick={() => void google()}>
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] text-ink-3 uppercase">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form className="flex flex-col gap-3.5" onSubmit={(e) => void submit(e)}>
            {mode === "signup" ? (
              <label className="block">
                <span className="lbl">Full name</span>
                <input
                  className="field"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ana Marković"
                />
              </label>
            ) : null}
            <label className="block">
              <span className="lbl">Work email</span>
              <input
                className="field"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@semos.com"
              />
            </label>
            <label className="block">
              <span className="lbl">Password</span>
              <input
                className="field"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>
            <button className="btn pri mt-1 w-full justify-center" disabled={busy}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-[12.5px] text-ink-3">
            {mode === "signin" ? "New to Semos CRM? " : "Already have an account? "}
            <button
              className="font-medium text-accent-ink underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
