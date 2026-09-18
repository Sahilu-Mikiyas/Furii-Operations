import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAuditEvent } from "./audit-data";

export type FundItemCategory =
  | "visa"
  | "tuition"
  | "documents"
  | "travel"
  | "housing"
  | "setup"
  | "insurance"
  | "living"
  | "contingency";

export type FundItemRow = {
  id: string;
  user_id: string;
  category: FundItemCategory;
  label: string;
  amount: number;
  currency: string;
  note: string | null;
  due_month: string | null;
  funded: boolean;
  position: number;
  created_at: string;
};

export const FUND_CATEGORIES: {
  key: FundItemCategory;
  label: string;
  emoji: string;
  description: string;
}[] = [
  { key: "visa", label: "Visa & Consular", emoji: "🏛️", description: "Embassy fees, appointments, biometrics" },
  { key: "tuition", label: "University & Tuition", emoji: "🎓", description: "Application, tuition, enrollment fees" },
  { key: "documents", label: "Documents & Legalization", emoji: "📜", description: "Legalization, sworn translation, verification" },
  { key: "travel", label: "Flights & Travel", emoji: "✈️", description: "Tickets, baggage, transfers" },
  { key: "housing", label: "Housing in Poznań", emoji: "🏠", description: "Deposit, first rent, agency" },
  { key: "setup", label: "Arrival Setup", emoji: "🔌", description: "SIM, transport pass, furniture, tech" },
  { key: "insurance", label: "Insurance & Health", emoji: "🩺", description: "Schengen medical, NFZ, medical exams" },
  { key: "living", label: "Living Buffer", emoji: "🍲", description: "Months of food, transport, utilities" },
  { key: "contingency", label: "Contingency & Proof of Funds", emoji: "🛡️", description: "Emergency buffer & visa liquidity" },
];

export const DEFAULT_FUND_ITEMS: Omit<FundItemRow, "id" | "user_id" | "created_at">[] = [
  // Visa & Consular
  { category: "visa", label: "Polish National D-Type Visa fee (per applicant)", amount: 90, currency: "USD", note: "€80 consular fee", due_month: "2026-11", funded: false, position: 1 },
  { category: "visa", label: "Second applicant visa fee (spouse)", amount: 90, currency: "USD", note: "If applying together", due_month: "2026-11", funded: false, position: 2 },
  { category: "visa", label: "e-Konsulat appointment travel & lodging (Addis)", amount: 120, currency: "USD", note: "Transport + one night if needed", due_month: "2026-11", funded: false, position: 3 },
  { category: "visa", label: "Biometric passport photos (visa spec 35x45mm)", amount: 25, currency: "USD", note: "2 sets per applicant", due_month: "2026-10", funded: false, position: 4 },
  { category: "visa", label: "Passport renewal / extra pages", amount: 80, currency: "USD", note: "Must be valid 3+ months past arrival", due_month: "2026-09", funded: false, position: 5 },
  { category: "visa", label: "Karta Pobytu (residence card) first application", amount: 130, currency: "USD", note: "340 PLN + 50 PLN card issuance", due_month: "2027-04", funded: false, position: 6 },

  // University & Tuition
  { category: "tuition", label: "University application fees (3 universities)", amount: 250, currency: "USD", note: "WSB Merito / AMU / PUT", due_month: "2026-09", funded: false, position: 10 },
  { category: "tuition", label: "First semester tuition transfer", amount: 2500, currency: "USD", note: "Required for visa proof of payment", due_month: "2026-11", funded: false, position: 11 },
  { category: "tuition", label: "Enrollment / registration fee (wpisowe)", amount: 200, currency: "USD", note: "One-time entry fee", due_month: "2026-12", funded: false, position: 12 },
  { category: "tuition", label: "Student ID (Legitymacja) & admin fees", amount: 40, currency: "USD", note: "Collected on enrollment", due_month: "2027-03", funded: false, position: 13 },
  { category: "tuition", label: "Books, software & study materials (1st semester)", amount: 200, currency: "USD", note: null, due_month: "2027-03", funded: false, position: 14 },

  // Documents & Legalization
  { category: "documents", label: "HERQA / Ministry of Education degree verification", amount: 60, currency: "USD", note: null, due_month: "2026-09", funded: false, position: 20 },
  { category: "documents", label: "MoFA Addis Ababa legalization stamps", amount: 80, currency: "USD", note: "Per document set", due_month: "2026-09", funded: false, position: 21 },
  { category: "documents", label: "Polish Embassy legalization / apostille", amount: 120, currency: "USD", note: null, due_month: "2026-10", funded: false, position: 22 },
  { category: "documents", label: "Sworn Polish translation (tłumacz przysięgły)", amount: 350, currency: "USD", note: "~25 USD per page, degree + transcripts + certificates", due_month: "2026-10", funded: false, position: 23 },
  { category: "documents", label: "Certified English translations (Amharic originals)", amount: 150, currency: "USD", note: null, due_month: "2026-09", funded: false, position: 24 },
  { category: "documents", label: "Federal police criminal record certificate", amount: 40, currency: "USD", note: "Both applicants", due_month: "2026-10", funded: false, position: 25 },
  { category: "documents", label: "Birth & marriage certificate copies + legalization", amount: 90, currency: "USD", note: null, due_month: "2026-10", funded: false, position: 26 },
  { category: "documents", label: "Courier & notary costs (DHL to Poland)", amount: 120, currency: "USD", note: null, due_month: "2026-12", funded: false, position: 27 },

  // Flights & Travel
  { category: "travel", label: "One-way flight Addis Ababa → Warsaw (per person)", amount: 700, currency: "USD", note: "Ethiopian / Turkish, booked early", due_month: "2027-01", funded: false, position: 30 },
  { category: "travel", label: "Second ticket (spouse)", amount: 700, currency: "USD", note: null, due_month: "2027-01", funded: false, position: 31 },
  { category: "travel", label: "Extra baggage allowance (2 x 23kg)", amount: 250, currency: "USD", note: null, due_month: "2027-02", funded: false, position: 32 },
  { category: "travel", label: "Warsaw Chopin → Poznań Główny train tickets", amount: 60, currency: "USD", note: null, due_month: "2027-02", funded: false, position: 33 },
  { category: "travel", label: "Airport transfer & first-night hotel", amount: 120, currency: "USD", note: null, due_month: "2027-02", funded: false, position: 34 },
  { category: "travel", label: "Shipping boxes / excess belongings", amount: 300, currency: "USD", note: "Optional sea/air freight", due_month: "2027-02", funded: false, position: 35 },

  // Housing
  { category: "housing", label: "Apartment security deposit (kaucja)", amount: 600, currency: "USD", note: "Usually 1 month rent", due_month: "2027-02", funded: false, position: 40 },
  { category: "housing", label: "First month rent in Poznań", amount: 600, currency: "USD", note: "2-room apartment estimate", due_month: "2027-02", funded: false, position: 41 },
  { category: "housing", label: "Second month rent buffer", amount: 600, currency: "USD", note: null, due_month: "2027-03", funded: false, position: 42 },
  { category: "housing", label: "Agency commission (pośrednik)", amount: 500, currency: "USD", note: "Often one month's rent", due_month: "2027-02", funded: false, position: 43 },
  { category: "housing", label: "Utilities setup & first bills (czynsz, prąd, internet)", amount: 250, currency: "USD", note: null, due_month: "2027-03", funded: false, position: 44 },
  { category: "housing", label: "Dormitory alternative deposit", amount: 200, currency: "USD", note: "If student housing chosen instead", due_month: "2027-01", funded: false, position: 45 },

  // Arrival Setup
  { category: "setup", label: "Polish SIM cards & first top-up (Play/Orange)", amount: 40, currency: "USD", note: null, due_month: "2027-02", funded: false, position: 50 },
  { category: "setup", label: "PEKA transport card & first pass", amount: 60, currency: "USD", note: "Student discount", due_month: "2027-03", funded: false, position: 51 },
  { category: "setup", label: "Kitchenware, bedding & household basics", amount: 350, currency: "USD", note: "IKEA / Pepco starter kit", due_month: "2027-02", funded: false, position: 52 },
  { category: "setup", label: "Winter clothing & boots (both)", amount: 400, currency: "USD", note: "Poznań winter −10°C", due_month: "2027-01", funded: false, position: 53 },
  { category: "setup", label: "Work laptop / production gear upgrade", amount: 900, currency: "USD", note: "Keeps YouTube + software income running", due_month: "2027-01", funded: false, position: 54 },
  { category: "setup", label: "PESEL & Zameldowanie admin costs", amount: 30, currency: "USD", note: null, due_month: "2027-03", funded: false, position: 55 },
  { category: "setup", label: "Polish bank account setup buffer", amount: 100, currency: "USD", note: "Initial deposit", due_month: "2027-03", funded: false, position: 56 },

  // Insurance & Health
  { category: "insurance", label: "Schengen travel medical insurance (€30,000)", amount: 180, currency: "USD", note: "Required for visa, per person", due_month: "2026-11", funded: false, position: 60 },
  { category: "insurance", label: "Spouse travel medical insurance", amount: 180, currency: "USD", note: null, due_month: "2026-11", funded: false, position: 61 },
  { category: "insurance", label: "NFZ voluntary health insurance (first 3 months)", amount: 160, currency: "USD", note: "~55 PLN/month student rate", due_month: "2027-03", funded: false, position: 62 },
  { category: "insurance", label: "Pre-departure medical checkups & vaccines", amount: 150, currency: "USD", note: null, due_month: "2027-01", funded: false, position: 63 },
  { category: "insurance", label: "Dental & optical work before leaving", amount: 300, currency: "USD", note: "Cheaper in Addis", due_month: "2026-12", funded: false, position: 64 },

  // Living Buffer
  { category: "living", label: "Month 1 living costs (food, transport, utilities)", amount: 800, currency: "USD", note: null, due_month: "2027-03", funded: false, position: 70 },
  { category: "living", label: "Month 2 living costs", amount: 800, currency: "USD", note: null, due_month: "2027-04", funded: false, position: 71 },
  { category: "living", label: "Month 3 living costs", amount: 800, currency: "USD", note: null, due_month: "2027-05", funded: false, position: 72 },
  { category: "living", label: "Month 4-6 living runway", amount: 2400, currency: "USD", note: "Until income stabilizes locally", due_month: "2027-06", funded: false, position: 73 },

  // Contingency
  { category: "contingency", label: "Visa proof-of-funds liquid reserve", amount: 2000, currency: "USD", note: "Must sit untouched in account", due_month: "2026-11", funded: false, position: 80 },
  { category: "contingency", label: "Emergency return ticket reserve", amount: 800, currency: "USD", note: null, due_month: "2027-02", funded: false, position: 81 },
  { category: "contingency", label: "Currency exchange & transfer fees", amount: 200, currency: "USD", note: "Wise / bank spread", due_month: "2027-02", funded: false, position: 82 },
  { category: "contingency", label: "Unexpected costs buffer (10%)", amount: 1000, currency: "USD", note: null, due_month: "2027-02", funded: false, position: 83 },
];

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

async function syncPolandBucketFromFunded() {
  // Recompute Poland bucket amount = manual deposits + funded checklist items
  const { data: items } = await (supabase.from as any)("relocation_fund_items")
    .select("amount, funded");
  const fundedTotal = (items ?? [])
    .filter((i: any) => i.funded)
    .reduce((acc: number, i: any) => acc + Number(i.amount || 0), 0);

  const { data: contribs } = await (supabase.from as any)("fund_contributions")
    .select("amount, bucket_key, note");
  const manualTotal = (contribs ?? [])
    .filter((c: any) => c.bucket_key === "poland" && !String(c.note || "").startsWith("[checklist]"))
    .reduce((acc: number, c: any) => acc + Number(c.amount || 0), 0);

  const total = fundedTotal + manualTotal;

  await (supabase.from as any)("money_buckets")
    .update({ current_amount: total })
    .eq("key", "poland");
  await (supabase.from as any)("pillars")
    .update({ current_value: total })
    .eq("key", "relocation");

  return total;
}

export function useRelocationFundItems() {
  return useQuery({
    queryKey: ["relocation_fund_items"],
    queryFn: async (): Promise<FundItemRow[]> => {
      const { data: existing, error } = await (supabase.from as any)("relocation_fund_items")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      if (existing && existing.length > 0) return existing as FundItemRow[];

      const userId = await requireUserId();
      const seed = DEFAULT_FUND_ITEMS.map((i) => ({ ...i, user_id: userId }));
      const { data: inserted, error: insertErr } = await (supabase.from as any)("relocation_fund_items")
        .insert(seed)
        .select("*")
        .order("position", { ascending: true });
      if (insertErr) {
        console.warn("Could not seed relocation fund items:", insertErr);
        return seed.map((i, idx) => ({
          ...i,
          id: `seed-fund-${idx}`,
          created_at: new Date().toISOString(),
        })) as FundItemRow[];
      }
      return (inserted ?? []) as FundItemRow[];
    },
  });
}

function useFundItemsInvalidator() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["relocation_fund_items"] });
    qc.invalidateQueries({ queryKey: ["money_buckets"] });
    qc.invalidateQueries({ queryKey: ["fund_contributions"] });
    qc.invalidateQueries({ queryKey: ["pillars"] });
    qc.invalidateQueries({ queryKey: ["audit_logs"] });
  };
}

export function useToggleFundItem() {
  const invalidate = useFundItemsInvalidator();
  return useMutation({
    mutationFn: async (input: { item: FundItemRow; funded: boolean }) => {
      const { item, funded } = input;
      const { error } = await (supabase.from as any)("relocation_fund_items")
        .update({ funded })
        .eq("id", item.id);
      if (error) throw error;

      const total = await syncPolandBucketFromFunded();

      logAuditEvent({
        entity_type: "contribution",
        action: funded ? "CREATE" : "DELETE",
        title: `Relocation cost ${funded ? "funded" : "unfunded"}: ${item.label}`,
        details: `${funded ? "+" : "-"}$${Number(item.amount).toLocaleString()} USD · Poland fund now $${total.toLocaleString()}`,
      });
    },
    onSuccess: invalidate,
  });
}

export function useUpsertFundItem() {
  const invalidate = useFundItemsInvalidator();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      category: FundItemCategory;
      label: string;
      amount: number;
      note?: string | null;
      due_month?: string | null;
      funded?: boolean;
    }) => {
      const userId = await requireUserId();
      const payload = {
        category: input.category,
        label: input.label.trim(),
        amount: input.amount,
        note: input.note || null,
        due_month: input.due_month || null,
      };

      if (input.id) {
        const { error } = await (supabase.from as any)("relocation_fund_items")
          .update(payload)
          .eq("id", input.id);
        if (error) throw error;
        logAuditEvent({
          entity_type: "contribution",
          action: "UPDATE",
          title: `Relocation cost updated: ${payload.label}`,
          details: `$${input.amount.toLocaleString()} USD · ${input.category}`,
        });
      } else {
        const { error } = await (supabase.from as any)("relocation_fund_items").insert({
          ...payload,
          user_id: userId,
          currency: "USD",
          funded: input.funded ?? false,
          position: 900 + (Date.now() % 1000),
        });
        if (error) throw error;
        logAuditEvent({
          entity_type: "contribution",
          action: "CREATE",
          title: `Relocation cost added: ${payload.label}`,
          details: `$${input.amount.toLocaleString()} USD · ${input.category}`,
        });
      }

      await syncPolandBucketFromFunded();
    },
    onSuccess: invalidate,
  });
}

export function useDeleteFundItem() {
  const invalidate = useFundItemsInvalidator();
  return useMutation({
    mutationFn: async (item: FundItemRow) => {
      const { error } = await (supabase.from as any)("relocation_fund_items")
        .delete()
        .eq("id", item.id);
      if (error) throw error;
      await syncPolandBucketFromFunded();
      logAuditEvent({
        entity_type: "contribution",
        action: "DELETE",
        title: `Relocation cost removed: ${item.label}`,
        details: `$${Number(item.amount).toLocaleString()} USD`,
      });
    },
    onSuccess: invalidate,
  });
}
