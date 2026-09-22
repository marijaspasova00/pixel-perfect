import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Company = Tables<"companies">;
export type Contact = Tables<"contacts">;
export type Opportunity = Tables<"opportunities">;
export type Project = Tables<"projects">;
export type Consultant = Tables<"consultants">;
export type Skill = Tables<"skills">;
export type ConsultantSkill = Tables<"consultant_skills">;
export type Candidate = Tables<"candidates">;
export type Contract = Tables<"contracts">;
export type Activity = Tables<"activities">;
export type Task = Tables<"tasks">;
export type AuditEntry = Tables<"audit_log">;

async function unwrap<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

export const companiesQuery = () =>
  queryOptions({
    queryKey: ["companies"],
    queryFn: () =>
      unwrap<Company[]>(supabase.from("companies").select("*").order("revenue_12m", { ascending: false })),
  });

export const companyQuery = (id: string) =>
  queryOptions({
    queryKey: ["company", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("companies").select("*").eq("id", id).maybeSingle();
      if (error) throw new Error(error.message);
      return data as Company | null;
    },
  });

export const contactsQuery = (companyId?: string) =>
  queryOptions({
    queryKey: ["contacts", companyId ?? "all"],
    queryFn: () => {
      let q = supabase.from("contacts").select("*").order("full_name");
      if (companyId) q = q.eq("company_id", companyId);
      return unwrap<Contact[]>(q);
    },
  });

export const opportunitiesQuery = (companyId?: string) =>
  queryOptions({
    queryKey: ["opportunities", companyId ?? "all"],
    queryFn: () => {
      let q = supabase.from("opportunities").select("*").order("value", { ascending: false });
      if (companyId) q = q.eq("company_id", companyId);
      return unwrap<Opportunity[]>(q);
    },
  });

export const opportunityQuery = (id: string) =>
  queryOptions({
    queryKey: ["opportunity", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as Opportunity | null;
    },
  });

export const projectsQuery = (companyId?: string) =>
  queryOptions({
    queryKey: ["projects", companyId ?? "all"],
    queryFn: () => {
      let q = supabase.from("projects").select("*").order("end_date");
      if (companyId) q = q.eq("company_id", companyId);
      return unwrap<Project[]>(q);
    },
  });

export const projectQuery = (id: string) =>
  queryOptions({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
      if (error) throw new Error(error.message);
      return data as Project | null;
    },
  });

export const consultantsQuery = () =>
  queryOptions({
    queryKey: ["consultants"],
    queryFn: () => unwrap<Consultant[]>(supabase.from("consultants").select("*").order("full_name")),
  });

export const skillsQuery = () =>
  queryOptions({
    queryKey: ["skills"],
    queryFn: () => unwrap<Skill[]>(supabase.from("skills").select("*").order("category")),
  });

export const consultantSkillsQuery = () =>
  queryOptions({
    queryKey: ["consultant_skills"],
    queryFn: () => unwrap<ConsultantSkill[]>(supabase.from("consultant_skills").select("*")),
  });

export const candidatesQuery = () =>
  queryOptions({
    queryKey: ["candidates"],
    queryFn: () =>
      unwrap<Candidate[]>(supabase.from("candidates").select("*").order("applied_at", { ascending: false })),
  });

export const contractsQuery = (companyId?: string) =>
  queryOptions({
    queryKey: ["contracts", companyId ?? "all"],
    queryFn: () => {
      let q = supabase.from("contracts").select("*").order("end_date");
      if (companyId) q = q.eq("company_id", companyId);
      return unwrap<Contract[]>(q);
    },
  });

export const activitiesQuery = (companyId?: string) =>
  queryOptions({
    queryKey: ["activities", companyId ?? "all"],
    queryFn: () => {
      let q = supabase.from("activities").select("*").order("occurred_at", { ascending: false });
      if (companyId) q = q.eq("company_id", companyId);
      return unwrap<Activity[]>(q);
    },
  });

export const tasksQuery = () =>
  queryOptions({
    queryKey: ["tasks"],
    queryFn: () => unwrap<Task[]>(supabase.from("tasks").select("*").order("due_date")),
  });

export const auditQuery = () =>
  queryOptions({
    queryKey: ["audit_log"],
    queryFn: () =>
      unwrap<AuditEntry[]>(
        supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(50),
      ),
  });

export const teamQuery = () =>
  queryOptions({
    queryKey: ["team"],
    queryFn: () =>
      unwrap<Tables<"profiles">[]>(supabase.from("profiles").select("*").order("full_name")),
  });

export const rolesQuery = () =>
  queryOptions({
    queryKey: ["user_roles"],
    queryFn: () => unwrap<Tables<"user_roles">[]>(supabase.from("user_roles").select("*")),
  });
