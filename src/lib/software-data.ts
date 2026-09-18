import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAuditEvent } from "./audit-data";

export type DealRow = {
  id: string;
  user_id: string;
  company: string;
  contact: string;
  service: string;
  deal_value: number;
  probability: number;
  stage: "Prospect" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";
  next_action: string | null;
  deadline: string | null;
  payment_status: "unpaid" | "partial" | "collected";
  amount_collected: number;
  created_at: string;
};

export type SoftwareProjectRow = {
  id: string;
  user_id: string;
  client: string;
  title: string;
  requirements: string | null;
  features: string[];
  status: "Backlog" | "Building" | "Testing" | "Demo Ready" | "Deployed";
  demo_url: string | null;
  deadline: string | null;
  created_at: string;
};

export type OutreachRow = {
  id: string;
  user_id: string;
  company: string;
  contact: string;
  platform: string;
  email: string | null;
  phone: string | null;
  status: string;
  date_contacted: string;
  follow_up_date: string | null;
  notes: string | null;
  created_at: string;
};

export type PromoAssetRow = {
  id: string;
  user_id: string;
  product_name: string;
  asset_type: string;
  description: string | null;
  status: string;
  link: string | null;
  created_at: string;
};

const DEFAULT_DEALS: Omit<DealRow, "id" | "user_id" | "created_at">[] = [];

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

export function useDeals() {
  return useQuery({
    queryKey: ["software_deals"],
    queryFn: async (): Promise<DealRow[]> => {
      const { data: existing, error } = await (supabase.from as any)("software_deals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (existing && existing.length > 0) return existing as DealRow[];

      // Seed default deals if empty
      const userId = await requireUserId();
      const seedRows = DEFAULT_DEALS.map((d) => ({ ...d, user_id: userId }));
      const { data: inserted, error: insertErr } = await (supabase.from as any)("software_deals")
        .insert(seedRows)
        .select("*");
      if (insertErr) {
        console.warn("Could not seed default deals:", insertErr);
        return DEFAULT_DEALS.map((d, idx) => ({ ...d, id: `seed-deal-${idx}`, user_id: userId, created_at: new Date().toISOString() })) as DealRow[];
      }
      return (inserted ?? []) as DealRow[];
    },
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { company: string; contact: string; deal_value: number; stage?: string; service?: string }) => {
      const userId = await requireUserId();
      const payload: any = {
        user_id: userId,
        company: input.company,
        contact: input.contact,
        deal_value: input.deal_value,
        stage: input.stage || "Prospect",
        service: input.service || "Software Development",
      };
      const { data, error } = await (supabase.from as any)("software_deals")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;

      // Sync software pillar
      const { data: wonDeals } = await (supabase.from as any)("software_deals")
        .select("deal_value")
        .eq("stage", "Won");
      if (wonDeals) {
        const totalWon = wonDeals.reduce((sum: number, d: any) => sum + Number(d.deal_value || 0), 0);
        await (supabase.from as any)("pillars").update({ current_value: totalWon }).eq("key", "software");
      }

      logAuditEvent({
        entity_type: "deal",
        action: "CREATE",
        title: `New Deal: ${input.company}`,
        details: `Created deal with ${input.contact} for ${input.deal_value.toLocaleString()} ETB (${input.stage || "Prospect"})`,
      });

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["software_deals"] });
      qc.invalidateQueries({ queryKey: ["pillars"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; [key: string]: any }) => {
      const { id, ...updates } = input;
      const { error } = await (supabase.from as any)("software_deals").update(updates).eq("id", id);
      if (error) throw error;

      // Sync software pillar
      const { data: wonDeals } = await (supabase.from as any)("software_deals")
        .select("deal_value")
        .eq("stage", "Won");
      if (wonDeals) {
        const totalWon = wonDeals.reduce((sum: number, d: any) => sum + Number(d.deal_value || 0), 0);
        await (supabase.from as any)("pillars").update({ current_value: totalWon }).eq("key", "software");
      }

      logAuditEvent({
        entity_type: "deal",
        action: "UPDATE",
        title: `Deal Updated: ${updates["company"] || "Software Deal"}`,
        details: updates["stage"] ? `Stage updated to ${updates["stage"]}` : `Telemetry updated`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["software_deals"] });
      qc.invalidateQueries({ queryKey: ["pillars"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useSoftwareProjects() {
  return useQuery({
    queryKey: ["software_projects"],
    queryFn: async (): Promise<SoftwareProjectRow[]> => {
      const { data, error } = await (supabase.from as any)("software_projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("Error loading software projects:", error);
        return [];
      }
      return (data ?? []) as SoftwareProjectRow[];
    },
  });
}

export function useCreateSoftwareProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { client: string; title: string; requirements?: string; demo_url?: string }) => {
      const userId = await requireUserId();
      const payload: any = {
        user_id: userId,
        client: input.client,
        title: input.title,
        status: "Building",
      };
      if (input.requirements) payload.requirements = input.requirements;
      if (input.demo_url) payload.demo_url = input.demo_url;

      const { error } = await (supabase.from as any)("software_projects").insert(payload);
      if (error) throw error;

      logAuditEvent({
        entity_type: "project",
        action: "CREATE",
        title: `Project: ${input.title}`,
        details: `Created build project for ${input.client}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["software_projects"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useOutreach() {
  return useQuery({
    queryKey: ["software_outreach"],
    queryFn: async (): Promise<OutreachRow[]> => {
      const { data, error } = await (supabase.from as any)("software_outreach")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("Error loading outreach:", error);
        return [];
      }
      return (data ?? []) as OutreachRow[];
    },
  });
}

export function useCreateOutreach() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { company: string; contact: string; email?: string; platform?: string; follow_up_date?: string }) => {
      const userId = await requireUserId();
      const payload: any = {
        user_id: userId,
        company: input.company,
        contact: input.contact,
        platform: input.platform || "Email",
        status: "contacted",
      };
      if (input.email) payload.email = input.email;
      if (input.follow_up_date) payload.follow_up_date = input.follow_up_date;

      const { error } = await (supabase.from as any)("software_outreach").insert(payload);
      if (error) throw error;

      logAuditEvent({
        entity_type: "contact",
        action: "CREATE",
        title: `Outreach Logged: ${input.company}`,
        details: `Contact: ${input.contact} via ${payload.platform}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["software_outreach"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function usePromoAssets() {
  return useQuery({
    queryKey: ["software_promo"],
    queryFn: async (): Promise<PromoAssetRow[]> => {
      const { data, error } = await (supabase.from as any)("software_promo")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("Error loading promo assets:", error);
        return [];
      }
      return (data ?? []) as PromoAssetRow[];
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; [key: string]: any }) => {
      const { id, ...updates } = input;
      const { error } = await (supabase.from as any)("software_projects").update(updates).eq("id", id);
      if (error) throw error;

      logAuditEvent({
        entity_type: "project",
        action: "UPDATE",
        title: `Project Updated: ${updates["title"] || "Build Project"}`,
        details: updates["status"] ? `Status changed to ${updates["status"]}` : "Details updated",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["software_projects"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from as any)("software_projects").delete().eq("id", id);
      if (error) throw error;

      logAuditEvent({
        entity_type: "project",
        action: "DELETE",
        title: "Project Deleted",
        details: `Deleted project ${id}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["software_projects"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useCreatePromoAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { product_name: string; asset_type: string; description?: string; link?: string; status?: string }) => {
      const userId = await requireUserId();
      const payload: any = {
        user_id: userId,
        product_name: input.product_name,
        asset_type: input.asset_type,
        status: input.status || "Draft",
      };
      if (input.description) payload.description = input.description;
      if (input.link) payload.link = input.link;

      const { error } = await (supabase.from as any)("software_promo").insert(payload);
      if (error) throw error;

      logAuditEvent({
        entity_type: "project",
        action: "CREATE",
        title: `Promo Asset: ${input.product_name}`,
        details: `Type: ${input.asset_type}, Status: ${payload.status}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["software_promo"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useUpdatePromoAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; [key: string]: any }) => {
      const { id, ...updates } = input;
      const { error } = await (supabase.from as any)("software_promo").update(updates).eq("id", id);
      if (error) throw error;

      logAuditEvent({
        entity_type: "project",
        action: "UPDATE",
        title: `Promo Asset Updated: ${updates["product_name"] || "Asset"}`,
        details: updates["status"] ? `Status changed to ${updates["status"]}` : "Details updated",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["software_promo"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}
