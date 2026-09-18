import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAuditEvent } from "./audit-data";

export type BucketRow = {
  id: string;
  user_id: string;
  key: "proposal" | "marriage" | "poland" | "business";
  title: string;
  emoji: string;
  target_amount: number;
  current_amount: number;
  currency: "ETB" | "USD";
  created_at: string;
};

export type MarriageCategoryRow = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  created_at: string;
};

export type MilestoneRow = {
  id: string;
  user_id: string;
  title: string;
  financial_gate: string | null;
  status: "locked" | "unlocked" | "completed";
  position: number;
  created_at: string;
};

export type ContributionRow = {
  id: string;
  user_id: string;
  bucket_key: string;
  amount: number;
  note?: string | null;
  created_at: string;
};

const DEFAULT_BUCKETS: Omit<BucketRow, "id" | "user_id" | "created_at">[] = [
  { key: "proposal", title: "Proposal Fund", emoji: "💍", target_amount: 200000, current_amount: 0, currency: "ETB" },
  { key: "marriage", title: "Marriage Fund", emoji: "💒", target_amount: 1000000, current_amount: 0, currency: "ETB" },
  { key: "poland", title: "Poland Relocation Fund", emoji: "🇵🇱", target_amount: 10000, current_amount: 0, currency: "USD" },
  { key: "business", title: "Business Capital", emoji: "🏢", target_amount: 500000, current_amount: 0, currency: "ETB" },
];

const DEFAULT_MARRIAGE_CATEGORIES: Omit<MarriageCategoryRow, "id" | "user_id" | "created_at">[] = [
  { name: "Venue & Reception", target_amount: 300000, saved_amount: 0 },
  { name: "Clothing & Attire", target_amount: 150000, saved_amount: 0 },
  { name: "Food & Catering", target_amount: 250000, saved_amount: 0 },
  { name: "Photography & Film", target_amount: 100000, saved_amount: 0 },
  { name: "Church & Ceremony", target_amount: 80000, saved_amount: 0 },
  { name: "Rings & Jewelry", target_amount: 120000, saved_amount: 0 },
];

const DEFAULT_MILESTONES: Omit<MilestoneRow, "id" | "user_id" | "created_at">[] = [
  { title: "Proposal", financial_gate: "200,000 ETB", status: "locked", position: 1 },
  { title: "Engagement", financial_gate: "Engagement Planning", status: "locked", position: 2 },
  { title: "Marriage", financial_gate: "1,000,000 ETB", status: "locked", position: 3 },
  { title: "Poland Departure", financial_gate: "$10,000 USD", status: "locked", position: 4 },
];

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

export function useMoneyBuckets() {
  return useQuery({
    queryKey: ["money_buckets"],
    queryFn: async (): Promise<BucketRow[]> => {
      const { data: existing, error } = await (supabase.from as any)("money_buckets").select("*");
      if (error) throw error;
      if (existing && existing.length > 0) return existing as BucketRow[];

      // Seed default buckets if empty
      const userId = await requireUserId();
      const seedRows = DEFAULT_BUCKETS.map((b) => ({ ...b, user_id: userId }));
      const { data: inserted, error: insertErr } = await (supabase.from as any)("money_buckets")
        .insert(seedRows)
        .select("*");
      if (insertErr) {
        console.warn("Could not seed default money buckets:", insertErr);
        return DEFAULT_BUCKETS.map((b, idx) => ({ ...b, id: `seed-bucket-${idx}`, user_id: userId, created_at: new Date().toISOString() })) as BucketRow[];
      }
      return (inserted ?? []) as BucketRow[];
    },
  });
}

export function useAddContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { bucket_key: string; amount: number; note?: string }) => {
      const userId = await requireUserId();
      // Insert contribution
      const { error: contribErr } = await (supabase.from as any)("fund_contributions").insert({
        user_id: userId,
        bucket_key: input.bucket_key,
        amount: input.amount,
        note: input.note || null,
      });
      if (contribErr) throw contribErr;

      // Increment bucket current_amount
      const { data: bucket } = await (supabase.from as any)("money_buckets")
        .select("current_amount")
        .eq("key", input.bucket_key)
        .single();

      if (bucket) {
        const newTotal = Number(bucket.current_amount || 0) + input.amount;
        await (supabase.from as any)("money_buckets")
          .update({ current_amount: newTotal })
          .eq("key", input.bucket_key);
      }

      // Sync life and relocation pillars
      const { data: allBuckets } = await (supabase.from as any)("money_buckets").select("key, current_amount");
      if (allBuckets) {
        const proposalAmt = Number(allBuckets.find((b: any) => b.key === "proposal")?.current_amount || 0);
        const marriageAmt = Number(allBuckets.find((b: any) => b.key === "marriage")?.current_amount || 0);
        const polandAmt = Number(allBuckets.find((b: any) => b.key === "poland")?.current_amount || 0);

        await (supabase.from as any)("pillars").update({ current_value: proposalAmt + marriageAmt }).eq("key", "life");
        await (supabase.from as any)("pillars").update({ current_value: polandAmt }).eq("key", "relocation");
      }

      // Log to system audit trail
      const curr = input.bucket_key === "poland" ? "USD" : "ETB";
      logAuditEvent({
        entity_type: "contribution",
        action: "CREATE",
        title: `Contribution: ${input.bucket_key.toUpperCase()} Fund`,
        details: `Deposited ${input.amount.toLocaleString()} ${curr}${input.note ? ` · Note: ${input.note}` : ""}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["money_buckets"] });
      qc.invalidateQueries({ queryKey: ["fund_contributions"] });
      qc.invalidateQueries({ queryKey: ["pillars"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useContributions() {
  return useQuery({
    queryKey: ["fund_contributions"],
    queryFn: async (): Promise<any[]> => {
      const { data, error } = await (supabase.from as any)("fund_contributions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("Error fetching contributions:", error);
        return [];
      }
      return data ?? [];
    },
  });
}

export function useMarriageCategories() {
  return useQuery({
    queryKey: ["marriage_categories"],
    queryFn: async (): Promise<MarriageCategoryRow[]> => {
      const { data: existing, error } = await (supabase.from as any)("marriage_categories").select("*");
      if (error) throw error;
      if (existing && existing.length > 0) return existing as MarriageCategoryRow[];

      const userId = await requireUserId();
      const seedRows = DEFAULT_MARRIAGE_CATEGORIES.map((c) => ({ ...c, user_id: userId }));
      const { data: inserted, error: insertErr } = await (supabase.from as any)("marriage_categories")
        .insert(seedRows)
        .select("*");
      if (insertErr) {
        console.warn("Could not seed marriage categories:", insertErr);
        return DEFAULT_MARRIAGE_CATEGORIES.map((c, idx) => ({ ...c, id: `seed-cat-${idx}`, user_id: userId, created_at: new Date().toISOString() })) as MarriageCategoryRow[];
      }
      return (inserted ?? []) as MarriageCategoryRow[];
    },
  });
}

export function useRelationshipMilestones() {
  return useQuery({
    queryKey: ["relationship_milestones"],
    queryFn: async (): Promise<MilestoneRow[]> => {
      const { data: existing, error } = await (supabase.from as any)("relationship_milestones")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      if (existing && existing.length > 0) return existing as MilestoneRow[];

      const userId = await requireUserId();
      const seedRows = DEFAULT_MILESTONES.map((m) => ({ ...m, user_id: userId }));
      const { data: inserted, error: insertErr } = await (supabase.from as any)("relationship_milestones")
        .insert(seedRows)
        .select("*");
      if (insertErr) {
        console.warn("Could not seed milestones:", insertErr);
        return DEFAULT_MILESTONES.map((m, idx) => ({ ...m, id: `seed-ms-${idx}`, user_id: userId, created_at: new Date().toISOString() })) as MilestoneRow[];
      }
      return (inserted ?? []) as MilestoneRow[];
    },
  });
}

export function useUpdateMarriageCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; saved_amount: number }) => {
      const userId = await requireUserId();
      // Update the category
      const { error: catErr } = await (supabase.from as any)("marriage_categories")
        .update({ saved_amount: input.saved_amount })
        .eq("id", input.id);
      
      if (catErr) throw catErr;

      // Recalculate total
      const { data: allCats, error: fetchErr } = await (supabase.from as any)("marriage_categories")
        .select("saved_amount");
      
      if (fetchErr) throw fetchErr;

      const totalSaved = allCats?.reduce((acc: number, curr: any) => acc + (Number(curr.saved_amount) || 0), 0) || 0;

      // Update money_buckets for marriage
      const { error: bucketErr } = await (supabase.from as any)("money_buckets")
        .update({ current_amount: totalSaved })
        .eq("key", "marriage");

      // Log to system audit trail
      logAuditEvent({
        entity_type: "contribution",
        action: "ALLOCATE",
        title: "Marriage Fund Category Allocated",
        details: `Updated category allocation to ${input.saved_amount.toLocaleString()} ETB (Marriage Total: ${totalSaved.toLocaleString()} ETB)`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marriage_categories"] });
      qc.invalidateQueries({ queryKey: ["money_buckets"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}
