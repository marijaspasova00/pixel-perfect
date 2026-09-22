import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/app/Avatar";
import { Card, EmptyState, FilterSelect, Filters, TableSkeleton } from "@/components/app/Bits";
import { supabase } from "@/integrations/supabase/client";
import { companiesQuery, contactsQuery } from "@/lib/queries";
import { relativeDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/contacts")({
  head: () => ({
    meta: [
      { title: "Contacts — Semos CRM" },
      { name: "description", content: "Directory of all client contacts across the portfolio." },
      { property: "og:title", content: "Contacts — Semos CRM" },
      { property: "og:description", content: "Directory of all client contacts across the portfolio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  const queryClient = useQueryClient();
  const contacts = useQuery(contactsQuery());
  const companies = useQuery(companiesQuery());

  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("All");
  const [primaryOnly, setPrimaryOnly] = useState(false);

  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyId, setCompanyId] = useState("");

  const companyMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of companies.data ?? []) m.set(c.id, c.name);
    return m;
  }, [companies.data]);

  const companyNames = useMemo(
    () => Array.from(new Set((companies.data ?? []).map((c) => c.name))),
    [companies.data],
  );

  const addContact = useMutation({
    mutationFn: async () => {
      if (!fullName.trim()) throw new Error("Full name is required");
      const { error } = await supabase.from("contacts").insert({
        full_name: fullName.trim(),
        job_title: jobTitle.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        company_id: companyId || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Contact added");
      setFullName("");
      setJobTitle("");
      setEmail("");
      setPhone("");
      setCompanyId("");
      void queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  let rows = contacts.data ?? [];
  if (company !== "All") {
    rows = rows.filter((c) => companyMap.get(c.company_id ?? "") === company);
  }
  if (primaryOnly) rows = rows.filter((c) => c.is_primary);
  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter(
      (c) =>
        c.full_name.toLowerCase().includes(s) ||
        (c.email ?? "").toLowerCase().includes(s) ||
        (companyMap.get(c.company_id ?? "") ?? "").toLowerCase().includes(s),
    );
  }

  return (
    <>
      <div>
        <h1 className="text-[22px]">Contacts</h1>
        <p className="mt-1 text-[12.5px] text-ink-3">
          Every contact across the client portfolio, {contacts.data?.length ?? 0} total.
        </p>
      </div>

      <Card title="Add contact" subtitle="Insert a new contact and link it to a company">
        <form
          className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5"
          onSubmit={(e) => {
            e.preventDefault();
            addContact.mutate();
          }}
        >
          <input
            className="field"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            className="field"
            placeholder="Job title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
          <input
            className="field"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="field"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <select className="field" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
            <option value="">No company</option>
            {(companies.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="sm:col-span-2 xl:col-span-5">
            <button className="btn sm pri" type="submit" disabled={addContact.isPending}>
              {addContact.isPending ? "Adding…" : "Add contact"}
            </button>
          </div>
        </form>
      </Card>

      <Filters>
        <div className="btn sm gap-1.5">
          <Search className="h-3.5 w-3.5 text-ink-3" />
          <input
            className="w-40 bg-transparent outline-none placeholder:text-ink-3"
            placeholder="Search contacts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <FilterSelect label="Company" value={company} options={companyNames} onChange={setCompany} />
        <button
          type="button"
          className={`tab ${primaryOnly ? "on" : ""}`}
          onClick={() => setPrimaryOnly((v) => !v)}
        >
          Primary only
        </button>
      </Filters>

      <Card bodyClassName="">
        {contacts.isLoading ? (
          <TableSkeleton cols={6} />
        ) : rows.length === 0 ? (
          <EmptyState title="No contacts found" body="Try adjusting filters or search." />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Job title</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Last contacted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.full_name} size="xs" />
                      <span className="nm">{c.full_name}</span>
                      {c.is_primary ? <span className="bdg acc">Primary</span> : null}
                    </div>
                  </td>
                  <td>{c.job_title ?? "—"}</td>
                  <td>
                    {c.company_id ? (
                      <Link to="/companies/$id" params={{ id: c.company_id }} className="nm">
                        {companyMap.get(c.company_id) ?? "—"}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{c.email ?? "—"}</td>
                  <td>{c.phone ?? "—"}</td>
                  <td className="text-[12.5px] text-ink-3">{relativeDate(c.last_contacted_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
