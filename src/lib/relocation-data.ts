import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAuditEvent } from "./audit-data";

export type RelocationChecklistRow = {
  id: string;
  user_id: string;
  category: "academic" | "documents" | "visa" | "travel";
  task_name: string;
  status: "pending" | "in_progress" | "completed";
  position: number;
  created_at: string;
};

export type DocumentRow = {
  id: string;
  user_id: string;
  title: string;
  doc_type: string;
  status: "missing" | "in_progress" | "verified";
  expiry_date: string | null;
  file_url: string | null;
  notes: string | null;
  created_at: string;
};

export type ContactRow = {
  id: string;
  user_id: string;
  name: string;
  role_type: string;
  organization: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
};

const DEFAULT_CHECKLIST: Omit<RelocationChecklistRow, "id" | "user_id" | "created_at">[] = [
  // 🎓 Academic & University (11 items)
  { category: "academic", task_name: "University Research & Program Selection (Poznań: WSB, AMU, PUT)", status: "completed", position: 1 },
  { category: "academic", task_name: "Bachelor's Degree Certificates & Transcripts Gathering", status: "completed", position: 2 },
  { category: "academic", task_name: "Medium of Instruction (MOI) Certificate / English Proficiency (IELTS/Duolingo)", status: "completed", position: 3 },
  { category: "academic", task_name: "Certified Curriculum & Syllabus Breakdown Course Descriptions", status: "in_progress", position: 4 },
  { category: "academic", task_name: "Statement of Purpose (SOP) & Academic Motivation Letters", status: "in_progress", position: 5 },
  { category: "academic", task_name: "Academic & Professional Reference Letters (2 Referees)", status: "in_progress", position: 6 },
  { category: "academic", task_name: "Updated Europass Academic CV / Technical Resume", status: "in_progress", position: 7 },
  { category: "academic", task_name: "University Online Admissions Portal Application Submission", status: "in_progress", position: 8 },
  { category: "academic", task_name: "Official University Acceptance Letter Received (Zaświadczenie o przyjęciu)", status: "pending", position: 9 },
  { category: "academic", task_name: "1st Semester / Annual Tuition Fee Bank Transfer & Receipt", status: "pending", position: 10 },
  { category: "academic", task_name: "Eligibility Declaration (Confirmation of Higher Education Access)", status: "pending", position: 11 },

  // 📜 Legalization & Documents (8 items)
  { category: "documents", task_name: "Ministry of Education (HERQA) Degree Verification", status: "in_progress", position: 12 },
  { category: "documents", task_name: "Ministry of Foreign Affairs (MoFA Addis Ababa) Legalization Stamp", status: "in_progress", position: 13 },
  { category: "documents", task_name: "Polish Embassy Legalization / Apostille Stamp in Addis Ababa", status: "pending", position: 14 },
  { category: "documents", task_name: "Official Sworn Polish Translation (Tłumacz Przysięgły)", status: "pending", position: 15 },
  { category: "documents", task_name: "Legalized Marriage Certificate (Spousal Residency & Legal Dossier)", status: "in_progress", position: 16 },
  { category: "documents", task_name: "Certified & Legalized Birth Certificates (English & Polish)", status: "pending", position: 17 },
  { category: "documents", task_name: "Ethiopian Federal Police Clean Criminal Record Certificate", status: "pending", position: 18 },
  { category: "documents", task_name: "Ethiopian Driving License Verification & International Driving Permit", status: "completed", position: 19 },

  // 🏛️ Visa & Financial Proof (10 items)
  { category: "visa", task_name: "e-Konsulat Polish National Student Visa (Type D) Form Registration", status: "pending", position: 20 },
  { category: "visa", task_name: "Polish Embassy Visa Interview Appointment Slot Booking", status: "pending", position: 21 },
  { category: "visa", task_name: "Bank Financial Proof ($10,000+ Liquid Funds with 3-6 Mo Statements)", status: "in_progress", position: 22 },
  { category: "visa", task_name: "Sponsor Affidavit of Support & Notarized Income Guarantee", status: "pending", position: 23 },
  { category: "visa", task_name: "Tuition Fee Wire Transfer Confirmation & University Stamp", status: "pending", position: 24 },
  { category: "visa", task_name: "Schengen Travel Medical Insurance (€30,000 / 120,000 PLN Coverage)", status: "pending", position: 25 },
  { category: "visa", task_name: "Proof of Accommodation in Poznań (Dormitory Certificate / Lease)", status: "pending", position: 26 },
  { category: "visa", task_name: "Flight Reservation & Travel Itinerary (Addis Ababa → Warsaw/Poznań)", status: "pending", position: 27 },
  { category: "visa", task_name: "Biometric Passport Photos (Polish Visa Specs: 35x45mm white background)", status: "completed", position: 28 },
  { category: "visa", task_name: "Embassy Visa Dossier Submission & Consular Interview Prep", status: "pending", position: 29 },

  // ✈️ Travel & Housing (9 items)
  { category: "travel", task_name: "Flight Ticket Purchase & Baggage Allowance Confirmation", status: "pending", position: 30 },
  { category: "travel", task_name: "Poznań Student Dormitory or Private Apartment Lease Finalization", status: "pending", position: 31 },
  { category: "travel", task_name: "Airport Transfer & Train Booking (Warsaw Chopin Airport → Poznań Główny)", status: "pending", position: 32 },
  { category: "travel", task_name: "Polish SIM Card Acquisition (Play / Orange / Plus mobile carrier)", status: "pending", position: 33 },
  { category: "travel", task_name: "PESEL Identification Number & Zameldowanie (Address Registration at Urząd Miasta)", status: "pending", position: 34 },
  { category: "travel", task_name: "Polish Bank Account Setup (Santander / mBank / Millennium with EUR/PLN cards)", status: "pending", position: 35 },
  { category: "travel", task_name: "Poznań PEKA Public Transport Student Pass Card Acquisition", status: "pending", position: 36 },
  { category: "travel", task_name: "University Student ID (Legitymacja Studencka) Collection & Final Enrollment", status: "pending", position: 37 },
  { category: "travel", task_name: "First-Year Temporary Residence Permit (Karta Pobytu / TRC) Pack Preparation", status: "pending", position: 38 },
];

const DEFAULT_DOCUMENTS: Omit<DocumentRow, "id" | "user_id" | "created_at">[] = [
  // Group 1: Academic & University Admissions Documents (Months 1 & 2)
  { title: "Original Bachelor’s Degree Diplomas & Transcripts", doc_type: "Academic", status: "in_progress", expiry_date: null, file_url: null, notes: "Physical graduation certificates from universities in Ethiopia" },
  { title: "Ministry of Foreign Affairs Legalization Stamp", doc_type: "Legalization", status: "missing", expiry_date: null, file_url: null, notes: "Both diplomas and transcripts stamped by MFA in Addis Ababa" },
  { title: "Certified Sworn English Translations", doc_type: "Translation", status: "missing", expiry_date: null, file_url: null, notes: "All Amharic academic documents translated by certified translator" },
  { title: "English Proficiency Certificates", doc_type: "Language", status: "verified", expiry_date: "2028-12-31", file_url: null, notes: "IELTS, TOEFL, Duolingo, or 100% English instruction confirmation" },
  { title: "Passport-Sized Digital Photos", doc_type: "Photo", status: "verified", expiry_date: null, file_url: null, notes: "3.5 x 4.5 cm biometric photos matching Polish academic registry criteria" },
  { title: "Academic Motivation Letters & CVs", doc_type: "CV", status: "in_progress", expiry_date: null, file_url: null, notes: "Software engineering and international relations profiles" },

  // Group 2: The Polish Student Visa Application Bundle
  { title: "National D-Type Visa Application Forms", doc_type: "Visa", status: "missing", expiry_date: null, file_url: null, notes: "Filled online via e-Konsulat system and printed for embassy" },
  { title: "Valid International Passports", doc_type: "Passport", status: "verified", expiry_date: "2030-05-15", file_url: null, notes: "Valid for at least 3 months after departure, min 2 blank pages" },
  { title: "Official University Letters of Acceptance", doc_type: "Admission", status: "in_progress", expiry_date: null, file_url: null, notes: "Formal Admission Certificates from WSB Merito, AMU, or PUT" },
  { title: "Proof of Tuition Payment", doc_type: "Financial", status: "missing", expiry_date: null, file_url: null, notes: "Official bank wire receipts proving 1st semester tuition paid in full" },
  { title: "The Income Shield (Financial Proof)", doc_type: "Bank Statement", status: "verified", expiry_date: "2027-03-01", file_url: null, notes: "3 to 6 months Wise/Revolut statements showing $10k-$20k/mo YouTube payouts" },
  { title: "Travel Medical Insurance Policy", doc_type: "Insurance", status: "in_progress", expiry_date: "2028-03-01", file_url: null, notes: "Min €30,000 / 130,000 zł Schengen coverage including emergency medical repatriation" },
  { title: "Proof of Temporary Accommodation", doc_type: "Housing", status: "missing", expiry_date: null, file_url: null, notes: "Hotel booking, dormitory confirmation, or rental agreement in Poznań" },

  // Group 3: Essential Documents to Bring from Ethiopia
  { title: "Valid Ethiopian Driving Licenses", doc_type: "License", status: "verified", expiry_date: "2029-08-20", file_url: null, notes: "Bypasses 60-hr driving school / proves record to Poznań instructors" },
  { title: "Certificates of No Criminal Record", doc_type: "Background Check", status: "missing", expiry_date: "2027-02-01", file_url: null, notes: "Clean background check from Ethiopian federal police for compliance" },
  { title: "Marriage Certificate (Legalized & Translated)", doc_type: "Legal", status: "in_progress", expiry_date: null, file_url: null, notes: "Critical for Spółka z o.o. spousal residency & corporate asset inclusion" },
  { title: "Certified Copy of Birth Certificates", doc_type: "Legal", status: "missing", expiry_date: null, file_url: null, notes: "Legalized and translated into English/Polish" },
];

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

const CHECKLIST_STORAGE_KEY = "mission_poland_checklist_v4";

function getLocalChecklist(): RelocationChecklistRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalChecklist(list: RelocationChecklistRow[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn("Error saving local checklist:", err);
  }
}

function getInitialChecklist(): RelocationChecklistRow[] {
  const local = getLocalChecklist();
  if (local.length >= DEFAULT_CHECKLIST.length) {
    return local;
  }

  // If local is empty or partially populated, merge with DEFAULT_CHECKLIST
  const existingNames = new Set(local.map((l) => l.task_name));
  const merged: RelocationChecklistRow[] = [...local];

  DEFAULT_CHECKLIST.forEach((item, idx) => {
    if (!existingNames.has(item.task_name)) {
      merged.push({
        id: `chk-seed-${idx + 1}-${item.category}`,
        user_id: "user",
        category: item.category,
        task_name: item.task_name,
        status: item.status,
        position: item.position,
        created_at: new Date().toISOString(),
      });
    }
  });

  saveLocalChecklist(merged);
  return merged;
}

export function useRelocationChecklist() {
  return useQuery({
    queryKey: ["relocation_checklist"],
    queryFn: async (): Promise<RelocationChecklistRow[]> => {
      try {
        const { data: existing, error } = await (supabase.from as any)("relocation_checklist")
          .select("*")
          .order("position", { ascending: true });

        if (!error && existing && existing.length >= DEFAULT_CHECKLIST.length) {
          saveLocalChecklist(existing as RelocationChecklistRow[]);
          return existing as RelocationChecklistRow[];
        }
      } catch (err) {
        // Table doesn't exist or offline - fallback to local storage
      }

      return getInitialChecklist();
    },
  });
}

export function useUpdateChecklistTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: "pending" | "in_progress" | "completed"; task_name?: string }) => {
      // 1. Immediately update Local Storage
      const currentList = getInitialChecklist();
      const updatedList = currentList.map((item) => {
        if (item.id === input.id || (input.task_name && item.task_name === input.task_name)) {
          return { ...item, status: input.status };
        }
        return item;
      });
      saveLocalChecklist(updatedList);

      // 2. Try updating Supabase in background
      try {
        await (supabase.from as any)("relocation_checklist")
          .update({ status: input.status })
          .eq("id", input.id);
      } catch (err) {
        // Ignore Supabase table missing errors
      }

      // 3. Log Audit Event
      logAuditEvent({
        entity_type: "milestone",
        action: "STATUS_CHANGE",
        title: input.task_name ? `Relocation Task: ${input.task_name}` : "Relocation Task Toggled",
        details: `Status set to ${input.status.toUpperCase().replace("_", " ")}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["relocation_checklist"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useCreateChecklistTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { category: "academic" | "documents" | "visa" | "travel"; task_name: string; status?: "pending" | "in_progress" | "completed" }) => {
      const newItem: RelocationChecklistRow = {
        id: `chk-custom-${Date.now()}`,
        user_id: "user",
        category: input.category,
        task_name: input.task_name.trim(),
        status: input.status || "pending",
        position: 100 + (Date.now() % 1000),
        created_at: new Date().toISOString(),
      };

      // 1. Save to Local Storage
      const currentList = getInitialChecklist();
      const updatedList = [...currentList, newItem];
      saveLocalChecklist(updatedList);

      // 2. Try inserting into Supabase
      try {
        const userId = await requireUserId();
        await (supabase.from as any)("relocation_checklist").insert({
          ...newItem,
          user_id: userId,
        });
      } catch (err) {
        // Ignore Supabase table missing errors
      }

      // 3. Log Audit Event
      logAuditEvent({
        entity_type: "milestone",
        action: "CREATE",
        title: `Relocation Task Added: "${input.task_name}"`,
        details: `Added new step under ${input.category.toUpperCase()}`,
      });

      return newItem;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["relocation_checklist"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useDeleteChecklistTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; task_name: string }) => {
      // 1. Remove from Local Storage
      const currentList = getInitialChecklist();
      const updatedList = currentList.filter(
        (item) => item.id !== input.id && item.task_name !== input.task_name
      );
      saveLocalChecklist(updatedList);

      // 2. Try deleting from Supabase
      try {
        await (supabase.from as any)("relocation_checklist").delete().eq("id", input.id);
      } catch (err) {
        // Ignore Supabase table missing errors
      }

      // 3. Log Audit Event
      logAuditEvent({
        entity_type: "milestone",
        action: "DELETE",
        title: `Relocation Task Deleted: "${input.task_name}"`,
        details: `Removed checklist milestone`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["relocation_checklist"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useDocumentVault() {
  return useQuery({
    queryKey: ["document_vault"],
    queryFn: async (): Promise<DocumentRow[]> => {
      try {
        const { data: existing, error } = await (supabase.from as any)("document_vault").select("*");
        if (!error && existing && existing.length > 0) return existing as DocumentRow[];

        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id || "guest-user";
        const seedRows = DEFAULT_DOCUMENTS.map((d) => ({ ...d, user_id: userId }));
        const { data: inserted } = await (supabase.from as any)("document_vault")
          .insert(seedRows)
          .select("*");
        if (inserted && inserted.length > 0) return inserted as DocumentRow[];

        return DEFAULT_DOCUMENTS.map((d, idx) => ({ ...d, id: `seed-doc-${idx}`, user_id: userId, created_at: new Date().toISOString() })) as DocumentRow[];
      } catch (err) {
        console.warn("Document vault query fallback:", err);
        return DEFAULT_DOCUMENTS.map((d, idx) => ({ ...d, id: `seed-doc-${idx}`, user_id: "guest", created_at: new Date().toISOString() })) as DocumentRow[];
      }
    },
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; doc_type: string; notes?: string; expiry_date?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || "guest-user";
      const payload: any = {
        user_id: userId,
        title: input.title,
        doc_type: input.doc_type,
        status: "in_progress",
      };
      if (input.notes) payload.notes = input.notes;
      if (input.expiry_date) payload.expiry_date = input.expiry_date;

      await (supabase.from as any)("document_vault").insert(payload);

      logAuditEvent({
        entity_type: "document",
        action: "CREATE",
        title: `Document Registered: ${input.title}`,
        details: `Type: ${input.doc_type}, Status: in_progress`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["document_vault"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async (): Promise<ContactRow[]> => {
      const { data, error } = await (supabase.from as any)("contacts").select("*").order("created_at", { ascending: false });
      if (error) {
        console.warn("Error loading contacts:", error);
        return [];
      }
      return (data ?? []) as ContactRow[];
    },
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; role_type: string; organization?: string; email?: string; phone?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || "guest-user";
      const payload: any = {
        user_id: userId,
        name: input.name,
        role_type: input.role_type,
      };
      if (input.organization) payload.organization = input.organization;
      if (input.email) payload.email = input.email;
      if (input.phone) payload.phone = input.phone;

      await (supabase.from as any)("contacts").insert(payload);

      logAuditEvent({
        entity_type: "contact",
        action: "CREATE",
        title: `Contact Added: ${input.name}`,
        details: `Role: ${input.role_type}${input.organization ? ` (${input.organization})` : ""}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useUpdateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; [key: string]: any }) => {
      const { id, ...updates } = input;
      await (supabase.from as any)("document_vault")
        .update(updates)
        .eq("id", id);

      logAuditEvent({
        entity_type: "document",
        action: "UPDATE",
        title: `Document Updated: ${updates["title"] || "Document"}`,
        details: updates["status"] ? `Status: ${updates["status"]}` : "Details updated",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["document_vault"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string }) => {
      await (supabase.from as any)("document_vault")
        .delete()
        .eq("id", input.id);

      logAuditEvent({
        entity_type: "document",
        action: "DELETE",
        title: "Document Removed",
        details: `Deleted document ${input.id}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["document_vault"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; [key: string]: any }) => {
      const { id, ...updates } = input;
      await (supabase.from as any)("contacts")
        .update(updates)
        .eq("id", id);

      logAuditEvent({
        entity_type: "contact",
        action: "UPDATE",
        title: `Contact Updated: ${updates["name"] || "Contact"}`,
        details: updates["role_type"] ? `Role: ${updates["role_type"]}` : "Details updated",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string }) => {
      await (supabase.from as any)("contacts")
        .delete()
        .eq("id", input.id);

      logAuditEvent({
        entity_type: "contact",
        action: "DELETE",
        title: "Contact Removed",
        details: `Deleted contact ${input.id}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}
