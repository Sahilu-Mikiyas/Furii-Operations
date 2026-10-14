import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownToLine, AtSign, BarChart3, Check, Clock3, History, Plus, Save, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/lib/auth";
import { useClients } from "@/hooks/useClients";
import { useServices } from "@/hooks/useServices";
import { addisDate, formatSocialNumber, isActiveSocialService, SOCIAL_METRICS, SOCIAL_PLATFORMS, type SocialMetric, type SocialPlatform } from "@/lib/socialAnalytics";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;
type Tab = "entry" | "accounts" | "history" | "reports";

export function AdminSocialPage() {
  const { organizationId } = useAuth();
  const { services } = useServices();
  const { clients } = useClients();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("entry");
  const [accountId, setAccountId] = useState("");
  const [slotDate, setSlotDate] = useState(addisDate());
  const [slot, setSlot] = useState<"am" | "pm">(new Date().toLocaleString("en-GB", { timeZone: "Africa/Addis_Ababa", hour: "2-digit", hour12: false }).startsWith("0") ? "am" : "pm");
  const [metricValues, setMetricValues] = useState<Record<string, string>>({});
  const [metricDirections, setMetricDirections] = useState<Record<string, "increase" | "decrease">>({});
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editAccount, setEditAccount] = useState<any>(null);
  const [accountForm, setAccountForm] = useState({ service_id: "", platform: "instagram" as SocialPlatform, handle: "", display_name: "", profile_url: "" });
  const [reportServiceId, setReportServiceId] = useState("");
  const [reportStart, setReportStart] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString("en-CA"));
  const [reportEnd, setReportEnd] = useState(new Date().toLocaleDateString("en-CA"));
  const [reportCommentary, setReportCommentary] = useState("");
  const [reportEditingId, setReportEditingId] = useState<string | null>(null);
  const [reportSaving, setReportSaving] = useState(false);
  const [csvPreview, setCsvPreview] = useState<Record<string, string>[]>([]);
  const [csvResults, setCsvResults] = useState<string[]>([]);
  const [csvSaving, setCsvSaving] = useState(false);

  const eligibleServices = useMemo(() => services.filter((s) => isActiveSocialService(s.service_type, s.status)), [services]);
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["social-accounts", organizationId],
    queryFn: async () => {
      const { data, error } = await db.from("social_accounts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!organizationId,
  });
  const { data: snapshots = [] } = useQuery({
    queryKey: ["social-snapshots", accountId],
    queryFn: async () => {
      const { data, error } = await db.from("social_snapshots").select("*").eq("account_id", accountId).order("slot_date", { ascending: false }).order("revision", { ascending: false }).limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!accountId,
  });
  const { data: priorSlots = [], isLoading: priorLoading } = useQuery({
    queryKey: ["social-prior-slot", accountId, slotDate, slot],
    queryFn: async () => {
      const { data, error } = await db.from("social_snapshots").select("id,slot_date,slot,revision,metrics")
        .eq("account_id", accountId)
        .or(`slot_date.lt.${slotDate},and(slot_date.eq.${slotDate},slot.lt.${slot})`)
        .order("slot_date", { ascending: false }).order("slot", { ascending: false }).order("revision", { ascending: false }).limit(1);
      if (error) throw error;
      return data || [];
    },
    enabled: !!accountId && !!slotDate,
  });
  const { data: reports = [] } = useQuery({
    queryKey: ["social-reports", organizationId],
    queryFn: async () => {
      const { data, error } = await db.from("social_reports").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    }, enabled: !!organizationId,
  });
  const { data: reportAccounts = [] } = useQuery({
    queryKey: ["social-report-accounts", reportServiceId],
    queryFn: async () => {
      const { data, error } = await db.from("social_accounts").select("*").eq("service_id", reportServiceId).eq("is_active", true);
      if (error) throw error;
      return data || [];
    }, enabled: !!reportServiceId,
  });
  const { data: reportSnapshots = [] } = useQuery({
    queryKey: ["social-report-snapshots", reportServiceId, reportStart, reportEnd],
    queryFn: async () => {
      const ids = reportAccounts.map((a: any) => a.id);
      if (!ids.length) return [];
      const { data, error } = await db.from("social_snapshots_latest").select("*").in("account_id", ids).gte("slot_date", reportStart).lte("slot_date", reportEnd).order("slot_date", { ascending: true });
      if (error) throw error;
      return data || [];
    }, enabled: !!reportServiceId && reportAccounts.length > 0,
  });

  const selectedAccount = accounts.find((a: any) => a.id === accountId);
  const platform = (selectedAccount?.platform || "instagram") as SocialPlatform;
  const metricCatalog = SOCIAL_METRICS[platform];
  const latestForSlot = snapshots.find((s: any) => s.slot_date === slotDate && s.slot === slot);
  const previousSnapshot = priorSlots[0];
  const followerMetric = metricCatalog.find((metric) => metric.primary);
  const followerKey = followerMetric?.key;
  const hasPriorFollowerTotal = followerKey && typeof previousSnapshot?.metrics?.[followerKey] === "number";
  const serviceName = (id: string) => eligibleServices.find((s) => s.id === id)?.name || "Service workspace";
  const clientName = (id: string) => clients.find((c) => c.id === id)?.name || "Client";

  useEffect(() => {
    if (latestForSlot) {
      const changes: Record<string, string> = {};
      const directions: Record<string, "increase" | "decrease"> = {};
      for (const metric of metricCatalog.filter((item) => item.key !== "net_followers")) {
        const current = latestForSlot.metrics?.[metric.key];
        if (typeof current !== "number") continue;
        const prior = previousSnapshot?.metrics?.[metric.key];
        if (typeof prior === "number") {
          const difference = current - prior;
          changes[metric.key] = String(Math.abs(difference));
          directions[metric.key] = difference < 0 ? "decrease" : "increase";
        } else {
          changes[metric.key] = String(current);
          directions[metric.key] = "increase";
        }
      }
      setMetricValues(changes);
      setMetricDirections(directions);
      setNote("");
    } else {
      setMetricValues({});
      setMetricDirections({});
      setNote("");
    }
  }, [accountId, slotDate, slot, latestForSlot?.id, previousSnapshot?.id, platform]);

  const previewTotals = useMemo(() => {
    const totals: Record<string, number | undefined> = {};
    for (const metric of metricCatalog.filter((item) => item.key !== "net_followers")) {
      const prior = previousSnapshot?.metrics?.[metric.key];
      const raw = metricValues[metric.key]?.trim();
      if (!raw) {
        if (typeof prior === "number") totals[metric.key] = prior;
        continue;
      }
      const amount = Number(raw);
      totals[metric.key] = typeof prior !== "number" ? amount : prior + (metricDirections[metric.key] === "decrease" ? -amount : amount);
    }
    const previousFollowers = followerKey ? previousSnapshot?.metrics?.[followerKey] : undefined;
    const currentFollowers = followerKey ? totals[followerKey] ?? previousFollowers : undefined;
    if (typeof currentFollowers === "number") {
      totals["net_followers"] = typeof previousFollowers === "number" ? currentFollowers - previousFollowers : currentFollowers;
    }
    return totals;
  }, [metricCatalog, metricValues, metricDirections, previousSnapshot?.id, followerKey]);

  const loadAccountForEdit = (account: any) => {
    setEditAccount(account);
    setAccountForm({ service_id: account.service_id, platform: account.platform, handle: account.handle, display_name: account.display_name, profile_url: account.profile_url || "" });
    setShowAccountForm(true);
  };

  const saveAccount = async () => {
    const service = eligibleServices.find((s) => s.id === accountForm.service_id);
    if (!organizationId || !service || !accountForm.handle.trim() || !accountForm.display_name.trim()) {
      toast.error("Choose a service and enter the account name and handle.");
      return;
    }
    if (accountForm.profile_url && !/^https?:\/\//i.test(accountForm.profile_url.trim())) { toast.error("Profile URL must begin with https:// or http://."); return; }
    const payload = { organization_id: organizationId, client_id: service.client_id, service_id: service.id, platform: accountForm.platform, handle: accountForm.handle.trim().replace(/^@/, ""), display_name: accountForm.display_name.trim(), profile_url: accountForm.profile_url.trim() || null, updated_at: new Date().toISOString() };
    const query = editAccount ? db.from("social_accounts").update(payload).eq("id", editAccount.id) : db.from("social_accounts").insert(payload);
    const { error } = await query;
    if (error) { toast.error(error.message); return; }
    toast.success(editAccount ? "Social account updated" : "Social account connected");
    setShowAccountForm(false); setEditAccount(null);
    await qc.invalidateQueries({ queryKey: ["social-accounts"] });
  };

  const saveSnapshot = async () => {
    if (!selectedAccount) { toast.error("Select a social account first."); return; }
    if (latestForSlot && !note.trim()) { toast.error("Add a correction note when replacing a saved entry."); return; }
    const metrics: Record<string, number> = {};
    let enteredMetric = false;
    for (const metric of metricCatalog.filter((item) => item.key !== "net_followers")) {
      const raw = metricValues[metric.key]?.trim() || "";
      const previousTotal = previousSnapshot?.metrics?.[metric.key];
      if (!raw) {
        if (typeof previousTotal === "number") metrics[metric.key] = previousTotal;
        continue;
      }
      enteredMetric = true;
      const amount = Number(raw);
      if (!Number.isSafeInteger(amount) || amount < 0) { toast.error("Enter non-negative whole-number changes."); return; }
      const total = typeof previousTotal !== "number"
        ? amount
        : previousTotal + (metricDirections[metric.key] === "decrease" ? -amount : amount);
      if (total < 0) { toast.error(`${metric.label} cannot go below zero.`); return; }
      metrics[metric.key] = total;
    }
    if (!enteredMetric) { toast.error("Enter a starting total or at least one metric change."); return; }
    const previous = previousSnapshot;
    if (followerKey && typeof metrics[followerKey] === "number") {
      const before = previous?.metrics?.[followerKey];
      metrics["net_followers"] = typeof before === "number" ? metrics[followerKey] - before : metrics[followerKey];
    }
    const warnings: string[] = [];
    for (const key of ["followers", "page_followers"]) {
      const before = Number(previous?.metrics?.[key]); const after = metrics[key];
      if (after != null && previous?.metrics?.[key] != null && after < before) {
        if (!note.trim()) { toast.error(`Add a note explaining the ${key.replaceAll("_", " ")} decrease.`); return; }
        warnings.push(`${key.replaceAll("_", " ")} drops from ${formatSocialNumber(before)} to ${formatSocialNumber(after)}.`);
      } else if (after != null && before > 0 && after > before * 1.15) {
        warnings.push(`${key.replaceAll("_", " ")} increased by more than 15%.`);
      }
    }
    for (const key of ["video_views", "views", "accounts_reached", "reach", "page_views", "impressions", "profile_views", "profile_visits"]) {
      const before = Number(previous?.metrics?.[key]); const after = metrics[key];
      if (after != null && before > 0 && (after > before * 3 || after < before / 3)) warnings.push(`${key.replaceAll("_", " ")} changed by more than 3×.`);
    }
    const captureTime = Date.parse(`${slotDate}T${slot === "am" ? "09" : "21"}:00:00+03:00`);
    if (Date.now() - captureTime > 36 * 60 * 60 * 1000) warnings.push("This is a backfill more than 36 hours after the capture slot.");
    if (warnings.length && !window.confirm(`${warnings.join("\n")}\n\nSave this snapshot anyway?`)) return;
    setSaving(true);
    const { error } = await db.rpc("save_social_snapshot", { p_account_id: accountId, p_slot_date: slotDate, p_slot: slot, p_metrics: metrics, p_note: note.trim() || null, p_source: "manual", p_screenshot_path: null });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(latestForSlot ? "Correction saved as a new revision" : "Analytics snapshot saved");
    setMetricValues({}); setNote("");
    await qc.invalidateQueries({ queryKey: ["social-snapshots", accountId] });
    await qc.invalidateQueries({ queryKey: ["social-snapshots"] });
  };

  const downloadCsvTemplate = () => {
    const csvMetrics = metricCatalog.filter((metric) => metric.key !== "net_followers");
    const rows = [["account_handle", "platform", "slot_date", "slot", ...csvMetrics.map((m) => m.key), "note"], [selectedAccount?.handle || "", platform, slotDate, slot, ...csvMetrics.map(() => ""), ""]];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = `social-${platform}-template.csv`; a.click(); URL.revokeObjectURL(a.href);
  };

  const loadCsv = async (file?: File) => {
    if (!file) return;
    try {
      const rows = parseCsv(await file.text());
      if (rows.length < 2) throw new Error("CSV needs a header and at least one data row.");
      const headers = (rows[0] || []).map((h) => h.trim().toLowerCase());
      const required = ["account_handle", "platform", "slot_date", "slot"];
      if (required.some((key) => !headers.includes(key))) throw new Error(`CSV must include: ${required.join(", ")}.`);
      setCsvPreview(rows.slice(1).filter((row) => row.some((v) => v.trim())).map((row) => Object.fromEntries(headers.map((key, index) => [key, row[index] || ""]))));
      setCsvResults([]);
    } catch (err: any) { toast.error(err?.message || "Could not read this CSV file."); setCsvPreview([]); }
  };

  const importCsv = async () => {
    if (!csvPreview.length) return;
    setCsvSaving(true); setCsvResults([]);
    const results: string[] = [];
    for (const [index, row] of csvPreview.entries()) {
      const account = accounts.find((a: any) => a.handle.toLowerCase() === (row["account_handle"] || "").replace(/^@/, "").toLowerCase() && a.platform === (row["platform"] || "").toLowerCase());
      if (!account) { results.push(`Row ${index + 2}: account not found for ${row["platform"]} ${row["account_handle"]}.`); continue; }
      const rowDate = row["slot_date"] || "";
      const rowSlot = (row["slot"] || "").toLowerCase();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(rowDate) || !["am", "pm"].includes(rowSlot)) { results.push(`Row ${index + 2}: use YYYY-MM-DD and am or pm.`); continue; }
      const metrics: Record<string, number> = {};
      let invalid = false;
      for (const [key, raw] of Object.entries(row)) {
        if (["account_handle", "platform", "slot_date", "slot", "note"].includes(key) || raw.trim() === "") continue;
        if (!/^\d+$/.test(raw.trim())) { invalid = true; break; }
        metrics[key] = Number(raw);
      }
      if (invalid || !Object.keys(metrics).length) { results.push(`Row ${index + 2}: metrics must be non-negative whole numbers, with at least one metric.`); continue; }
      const noteValue = row["note"]?.trim() || null;
      const { data: old, error: oldError } = await db.from("social_snapshots").select("id").eq("account_id", account.id).eq("slot_date", rowDate).eq("slot", rowSlot).limit(1);
      if (oldError) { results.push(`Row ${index + 2}: ${oldError.message}`); continue; }
      if (old?.length && !noteValue) { results.push(`Row ${index + 2}: correction needs a note.`); continue; }
      const { error } = await db.rpc("save_social_snapshot", { p_account_id: account.id, p_slot_date: rowDate, p_slot: rowSlot, p_metrics: metrics, p_note: noteValue, p_source: "csv", p_screenshot_path: null });
      results.push(error ? `Row ${index + 2}: ${error.message}` : `Row ${index + 2}: imported.`);
    }
    setCsvResults(results); setCsvSaving(false);
    const succeeded = results.filter((line) => line.endsWith("imported.")).length;
    toast.success(`${succeeded} of ${results.length} CSV rows imported`);
    await qc.invalidateQueries({ queryKey: ["social-snapshots"] });
  };

  const createReport = async () => {
    const service = eligibleServices.find((s) => s.id === reportServiceId);
    if (!organizationId || !service || reportEnd < reportStart) { toast.error("Choose a service and a valid reporting period."); return; }
    if (!reportSnapshots.length) { toast.error("No analytics snapshots are available for this period yet."); return; }
    setReportSaving(true);
    try {
      const reportId = reportEditingId || crypto.randomUUID();
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      doc.setFillColor(17, 24, 39); doc.rect(0, 0, 210, 35, "F");
      doc.setTextColor(255, 255, 255); doc.setFontSize(19); doc.setFont("helvetica", "bold"); doc.text("FURII · SOCIAL ANALYTICS", 14, 17);
      doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.text(`${clientName(service.client_id)}  /  ${service.name}`, 14, 26);
      doc.setTextColor(17, 24, 39); doc.setFontSize(11); doc.text(`Reporting period: ${reportStart} to ${reportEnd}`, 14, 45);
      const rows: string[][] = [];
      for (const acct of reportAccounts) {
        const catalog = SOCIAL_METRICS[acct.platform as SocialPlatform];
        const items = reportSnapshots.filter((snap: any) => snap.account_id === acct.id);
        if (!items.length) continue;
        for (const m of catalog) {
          const first = items.find((snap: any) => snap.metrics?.[m.key] != null);
          const last = [...items].reverse().find((snap: any) => snap.metrics?.[m.key] != null);
          if (!first || !last) continue;
          const initial = Number(first.metrics[m.key]); const final = Number(last.metrics[m.key]);
          rows.push([acct.platform[0].toUpperCase() + acct.platform.slice(1), `@${acct.handle}`, m.label, formatSocialNumber(initial), formatSocialNumber(final), `${final - initial > 0 ? "+" : ""}${formatSocialNumber(final - initial)}`]);
        }
      }
      autoTable(doc, { startY: 52, head: [["Platform", "Profile", "Metric", "Period start", "Period end", "Change"]], body: rows, theme: "grid", styles: { fontSize: 8 }, headStyles: { fillColor: [40, 88, 201] } });
      const finalY = (doc as any).lastAutoTable?.finalY || 65;
      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.text("Furii team notes", 14, finalY + 12);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      const noteLines = doc.splitTextToSize(reportCommentary || "No additional commentary provided.", 180);
      doc.text(noteLines, 14, finalY + 19);
      const path = `${organizationId}/${service.id}/${reportId}/${crypto.randomUUID()}.pdf`;
      const { error: uploadError } = await supabase.storage.from("social-reports").upload(path, doc.output("blob"), { contentType: "application/pdf", upsert: true });
      if (uploadError) throw uploadError;
      const reportPayload = { organization_id: organizationId, client_id: service.client_id, service_id: service.id, period_start: reportStart, period_end: reportEnd, status: "draft", commentary: reportCommentary, file_path: path, generated_by: (await supabase.auth.getUser()).data.user?.id, published_at: null, updated_at: new Date().toISOString() };
      const { error } = reportEditingId
        ? await db.from("social_reports").update(reportPayload).eq("id", reportId)
        : await db.from("social_reports").insert({ id: reportId, ...reportPayload });
      if (error) { if (!reportEditingId) await supabase.storage.from("social-reports").remove([path]); throw error; }
      toast.success(reportEditingId ? "Report updated and returned to draft for review" : "Draft report generated"); setReportCommentary(""); setReportEditingId(null);
      await qc.invalidateQueries({ queryKey: ["social-reports"] });
    } catch (err: any) { toast.error(err?.message || "Could not generate the report."); }
    finally { setReportSaving(false); }
  };

  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="space-y-6">
    <PageHeader title="Social Analytics" description="Manage connected profiles, enter the twice-daily metrics, and keep a clear correction history." actions={<button onClick={() => { setEditAccount(null); setAccountForm({ service_id: eligibleServices[0]?.id || "", platform: "instagram", handle: "", display_name: "", profile_url: "" }); setShowAccountForm(true); }} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4"/>Add account</button>} />
    <div className="grid gap-3 sm:grid-cols-3">
      <Summary icon={<AtSign/>} label="Active profiles" value={accounts.filter((a: any) => a.is_active).length}/>
      <Summary icon={<Clock3/>} label="Accounts in this workspace" value={accounts.filter((a: any) => a.service_id === accountId).length}/>
      <Summary icon={<History/>} label="Saved snapshots" value={snapshots.length}/>
    </div>
    <div className="flex flex-wrap gap-2 border-b border-border pb-3">
      {([["entry", "Daily entry", BarChart3], ["accounts", "Accounts", Users], ["history", "Revision history", History], ["reports", "Client reports", ArrowDownToLine]] as const).map(([id, label, Icon]) => <button key={id} onClick={() => setTab(id)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${tab === id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary"}`}><Icon className="h-4 w-4"/>{label}</button>)}
    </div>

    {tab === "entry" && <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">Enter channel metrics</h2><p className="text-sm text-muted-foreground">The form records increases and decreases; CSV imports use absolute totals. Net followers is always calculated automatically.</p></div><div className="flex gap-2"><button onClick={downloadCsvTemplate} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><ArrowDownToLine className="h-4 w-4"/>CSV template</button><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm">Import CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { void loadCsv(e.target.files?.[0]); e.currentTarget.value = ""; }}/></label></div></div>
      {csvPreview.length > 0 && <div className="space-y-3 rounded-xl border bg-secondary/20 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">CSV preview · {csvPreview.length} row(s)</p><p className="text-xs text-muted-foreground">Rows are checked and saved individually; invalid rows will be reported below.</p></div><button disabled={csvSaving} onClick={importCsv} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">{csvSaving ? "Importing…" : "Import rows"}</button></div><div className="max-h-44 overflow-auto rounded-lg border bg-background"><table className="w-full text-left text-xs"><thead className="sticky top-0 bg-secondary"><tr>{Object.keys(csvPreview[0] || {}).slice(0, 8).map((key) => <th key={key} className="p-2 font-semibold">{key}</th>)}</tr></thead><tbody>{csvPreview.slice(0, 10).map((row, i) => <tr key={i} className="border-t">{Object.keys(csvPreview[0] || {}).slice(0, 8).map((key) => <td key={key} className="p-2">{row[key]}</td>)}</tr>)}</tbody></table></div>{csvResults.length > 0 && <div className="max-h-28 overflow-auto space-y-1 text-xs">{csvResults.map((line) => <p key={line} className={line.endsWith("imported.") ? "text-emerald-700" : "text-rose-700"}>{line}</p>)}</div>}</div>}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-medium">Account<select className="mt-1 block w-full rounded-lg border bg-background p-2.5 text-sm" value={accountId} onChange={(e) => { setAccountId(e.target.value); setMetricValues({}); }}><option value="">Choose a profile</option>{accounts.map((a: any) => <option key={a.id} value={a.id}>{clientName(a.client_id)} · {a.display_name} (@{a.handle})</option>)}</select></label>
        <label className="text-xs font-medium">Snapshot date<input type="date" className="mt-1 block w-full rounded-lg border bg-background p-2.5 text-sm" value={slotDate} onChange={(e) => setSlotDate(e.target.value)}/></label>
        <label className="text-xs font-medium">Capture slot<select className="mt-1 block w-full rounded-lg border bg-background p-2.5 text-sm" value={slot} onChange={(e) => setSlot(e.target.value as "am" | "pm")}><option value="am">Morning · 09:00</option><option value="pm">Evening · 21:00</option></select></label>
      </div>
      {selectedAccount && <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SOCIAL_PLATFORMS.find(p => p.id === platform)?.color }}/><b>{selectedAccount.display_name}</b><span className="text-muted-foreground">@{selectedAccount.handle} · {serviceName(selectedAccount.service_id)}</span>{latestForSlot && <span className="ml-auto rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">Revision {latestForSlot.revision} exists</span>}</div>}
      {!accounts.length && !isLoading ? <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Add a platform account to begin entering analytics.</p> : <>
        <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4"><div className="rounded-lg bg-primary/10 p-2 text-primary"><BarChart3 className="h-4 w-4"/></div><div><p className="text-sm font-semibold">{previousSnapshot ? "Enter changes since the last snapshot" : "Set the starting totals"}</p><p className="mt-0.5 text-xs text-muted-foreground">{previousSnapshot ? "Choose increase or decrease for each metric. New totals and net follower change are calculated automatically." : "The first follower count becomes the starting net followers value. Later net follower values are calculated from increases or decreases."}</p></div></div>
        {priorLoading ? <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Loading the previous totals…</p> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{metricCatalog.filter((metric) => metric.key !== "net_followers").map((metric) => <MetricEntryField key={metric.key} metric={metric} previousTotal={previousSnapshot?.metrics?.[metric.key]} amount={metricValues[metric.key] || ""} direction={metricDirections[metric.key] || "increase"} total={previewTotals[metric.key]} onAmountChange={(value) => setMetricValues((old) => ({ ...old, [metric.key]: value }))} onDirectionChange={(value) => setMetricDirections((old) => ({ ...old, [metric.key]: value }))}/>)}</div>}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net followers</p><p className="mt-1 text-sm text-muted-foreground">Starts at the initial follower count, then tracks each increase or decrease automatically.</p></div><div className={`rounded-lg px-3 py-2 text-sm font-bold tabular-nums ${typeof previewTotals["net_followers"] === "number" && previewTotals["net_followers"] < 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{typeof previewTotals["net_followers"] === "number" ? `${hasPriorFollowerTotal && previewTotals["net_followers"] > 0 ? "+" : ""}${formatSocialNumber(previewTotals["net_followers"])}` : "Enter follower count"}</div></div>
        {latestForSlot && <label className="block text-xs font-medium">Correction note (required for a saved slot)<textarea className="mt-1 block min-h-20 w-full rounded-lg border bg-background p-3 text-sm" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Explain the correction for the audit trail"/></label>}
        <div className="flex justify-end"><button disabled={saving || priorLoading || !selectedAccount} onClick={saveSnapshot} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"><Save className="h-4 w-4"/>{saving ? "Saving…" : latestForSlot ? "Save correction" : "Save snapshot"}</button></div>
      </>}
    </section>}

    {tab === "accounts" && <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b p-4"><h2 className="font-semibold">Managed social profiles</h2><p className="text-sm text-muted-foreground">Only active Social Media Management and Content Production workspaces can be connected.</p></div>
      <div className="divide-y">{accounts.map((a: any) => <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: SOCIAL_PLATFORMS.find(p => p.id === a.platform)?.soft, color: SOCIAL_PLATFORMS.find(p => p.id === a.platform)?.color }}><AtSign className="h-4 w-4"/></span><div><p className="font-semibold">{a.display_name} <span className="font-normal text-muted-foreground">@{a.handle}</span></p><p className="text-xs text-muted-foreground">{clientName(a.client_id)} · {serviceName(a.service_id)} · {a.platform}</p></div></div><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-xs ${a.is_active ? "bg-emerald-50 text-emerald-700" : "bg-secondary text-muted-foreground"}`}>{a.is_active ? "Active" : "Paused"}</span><button onClick={() => loadAccountForEdit(a)} className="rounded-lg border px-3 py-1.5 text-xs font-medium">Edit</button><button onClick={async () => { const { error } = await db.from("social_accounts").update({ is_active: !a.is_active }).eq("id", a.id); if (error) toast.error(error.message); else { toast.success(a.is_active ? "Profile paused" : "Profile activated"); qc.invalidateQueries({ queryKey: ["social-accounts"] }); } }} className="rounded-lg border px-3 py-1.5 text-xs font-medium">{a.is_active ? "Pause" : "Activate"}</button></div></div>)}{!accounts.length && <p className="p-10 text-center text-sm text-muted-foreground">No social profiles yet. Add an account to start building the dashboard.</p>}</div>
    </section>}

    {tab === "history" && <section className="overflow-hidden rounded-2xl border border-border bg-card"><div className="border-b p-4"><h2 className="font-semibold">Snapshot audit trail</h2><p className="text-sm text-muted-foreground">Each row is retained. The latest revision for each account, date, and slot powers the client dashboard.</p></div>{!accountId ? <p className="p-8 text-center text-sm text-muted-foreground">Select an account on Daily entry to see its history.</p> : <div className="divide-y">{snapshots.map((s: any) => <div key={s.id} className="grid gap-2 p-4 sm:grid-cols-[1fr_auto]"><div><p className="font-medium">{s.slot_date} · {s.slot === "am" ? "Morning" : "Evening"} · Revision {s.revision}</p><p className="text-xs text-muted-foreground">Entered {new Date(s.created_at).toLocaleString()} {s.note ? `· ${s.note}` : ""}</p></div><div className="flex flex-wrap gap-2">{Object.entries(s.metrics || {}).map(([key, value]) => <span key={key} className="rounded-md bg-secondary px-2 py-1 text-xs">{key.replaceAll("_", " ")}: {formatSocialNumber(Number(value))}</span>)}</div></div>)}{!snapshots.length && <p className="p-8 text-center text-sm text-muted-foreground">No snapshots have been saved for this profile.</p>}</div>}</section>}

    {tab === "reports" && <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div><h2 className="font-semibold">{reportEditingId ? "Revise client report" : "Build a client report"}</h2><p className="text-sm text-muted-foreground">Create a PDF from entered analytics, add Furii commentary, review it, then publish it to the client portal.</p></div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs font-medium">Service workspace<select className="mt-1 block w-full rounded-lg border bg-background p-2.5 text-sm" value={reportServiceId} onChange={(e) => setReportServiceId(e.target.value)}><option value="">Choose service</option>{eligibleServices.map((s) => <option key={s.id} value={s.id}>{clientName(s.client_id)} · {s.name}</option>)}</select></label>
          <label className="text-xs font-medium">Period start<input type="date" className="mt-1 block w-full rounded-lg border bg-background p-2.5 text-sm" value={reportStart} onChange={(e) => setReportStart(e.target.value)}/></label>
          <label className="text-xs font-medium">Period end<input type="date" className="mt-1 block w-full rounded-lg border bg-background p-2.5 text-sm" value={reportEnd} onChange={(e) => setReportEnd(e.target.value)}/></label>
        </div>
        <label className="block text-xs font-medium">Client-facing commentary<textarea className="mt-1 block min-h-24 w-full rounded-lg border bg-background p-3 text-sm" value={reportCommentary} onChange={(e) => setReportCommentary(e.target.value)} placeholder="Summarize progress, notable changes, and recommended next steps."/></label>
        <div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{reportSnapshots.length} snapshots from {reportAccounts.length} active profile(s) in the period</span><div className="flex gap-2">{reportEditingId && <button onClick={() => { setReportEditingId(null); setReportCommentary(""); }} className="rounded-lg border px-3 py-2 text-sm">Cancel edit</button>}<button disabled={reportSaving || !reportServiceId} onClick={createReport} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"><ArrowDownToLine className="h-4 w-4"/>{reportSaving ? "Generating…" : reportEditingId ? "Update report PDF" : "Generate draft PDF"}</button></div></div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-border bg-card"><div className="border-b p-4"><h2 className="font-semibold">Report library</h2><p className="text-sm text-muted-foreground">Drafts remain staff-only. Published PDFs appear in the matching client social dashboard.</p></div><div className="divide-y">{reports.map((report: any) => <div key={report.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-semibold">{clientName(report.client_id)} · {serviceName(report.service_id)}</p><p className="text-xs text-muted-foreground">{report.period_start} — {report.period_end} · Created {new Date(report.created_at).toLocaleDateString()}</p></div><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-xs ${report.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-secondary text-muted-foreground"}`}>{report.status}</span><button onClick={() => { setReportEditingId(report.id); setReportServiceId(report.service_id); setReportStart(report.period_start); setReportEnd(report.period_end); setReportCommentary(report.commentary || ""); }} className="rounded-lg border px-3 py-1.5 text-xs">Edit</button><button onClick={async () => { const preview = window.open("", "_blank"); const { data, error } = await supabase.storage.from("social-reports").createSignedUrl(report.file_path, 60); if (error) { preview?.close(); toast.error(error.message); } else if (preview) preview.location.href = data.signedUrl; }} className="rounded-lg border px-3 py-1.5 text-xs">Preview PDF</button><button onClick={async () => { const next = report.status === "published" ? "draft" : "published"; const { error } = await db.from("social_reports").update({ status: next, published_at: next === "published" ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("id", report.id); if (error) toast.error(error.message); else { toast.success(next === "published" ? "Report published to client portal" : "Report moved back to draft"); qc.invalidateQueries({ queryKey: ["social-reports"] }); } }} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${report.status === "published" ? "border" : "bg-primary text-primary-foreground"}`}>{report.status === "published" ? "Unpublish" : "Publish"}</button></div></div>)}{!reports.length && <p className="p-8 text-center text-sm text-muted-foreground">No reports generated yet.</p>}</div></section>
    </div>}

    {showAccountForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowAccountForm(false); }}><div className="w-full max-w-lg space-y-4 rounded-2xl bg-card p-6 shadow-xl"><div><h2 className="text-lg font-semibold">{editAccount ? "Edit social profile" : "Connect social profile"}</h2><p className="text-sm text-muted-foreground">Profile details are maintained by the Furii team.</p></div><label className="block text-xs font-medium">Service workspace<select className="mt-1 w-full rounded-lg border bg-background p-2.5 text-sm" value={accountForm.service_id} onChange={(e) => setAccountForm((v) => ({ ...v, service_id: e.target.value }))}><option value="">Choose service</option>{eligibleServices.map((s) => <option key={s.id} value={s.id}>{clientName(s.client_id)} · {s.name}</option>)}</select></label><label className="block text-xs font-medium">Platform<select disabled={!!editAccount} className="mt-1 w-full rounded-lg border bg-background p-2.5 text-sm" value={accountForm.platform} onChange={(e) => setAccountForm((v) => ({ ...v, platform: e.target.value as SocialPlatform }))}>{SOCIAL_PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</select></label><label className="block text-xs font-medium">Display name<input className="mt-1 w-full rounded-lg border bg-background p-2.5 text-sm" value={accountForm.display_name} onChange={(e) => setAccountForm((v) => ({ ...v, display_name: e.target.value }))} placeholder="Brand account"/></label><label className="block text-xs font-medium">Handle<input className="mt-1 w-full rounded-lg border bg-background p-2.5 text-sm" value={accountForm.handle} onChange={(e) => setAccountForm((v) => ({ ...v, handle: e.target.value }))} placeholder="brandhandle"/></label><label className="block text-xs font-medium">Profile URL (optional)<input type="url" className="mt-1 w-full rounded-lg border bg-background p-2.5 text-sm" value={accountForm.profile_url} onChange={(e) => setAccountForm((v) => ({ ...v, profile_url: e.target.value }))} placeholder="https://"/></label><div className="flex justify-end gap-2"><button onClick={() => setShowAccountForm(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button><button onClick={saveAccount} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><Check className="h-4 w-4"/>Save profile</button></div></div></div>}
  </motion.div>;
}

function Summary({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.25 }} className="flex items-center gap-3 rounded-xl border bg-card p-4"><span className="text-primary">{icon}</span><div><p className="text-xs text-muted-foreground">{label}</p><motion.p key={value} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-bold tabular-nums">{value}</motion.p></div></motion.div>;
}

function MetricEntryField({
  metric,
  previousTotal,
  amount,
  direction,
  total,
  onAmountChange,
  onDirectionChange,
}: {
  metric: SocialMetric;
  previousTotal: number | undefined;
  amount: string;
  direction: "increase" | "decrease";
  total: number | undefined;
  onAmountChange: (value: string) => void;
  onDirectionChange: (value: "increase" | "decrease") => void;
}) {
  const isBaseline = typeof previousTotal !== "number";
  return (
    <div className="rounded-xl border bg-card p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{metric.label}</p>
          {metric.hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{metric.hint}</p>}
        </div>
        <span className="rounded-md bg-secondary px-2 py-1 text-[10px] font-medium text-muted-foreground">{isBaseline ? "Starting total" : `Current ${formatSocialNumber(previousTotal)}`}</span>
      </div>
      {!isBaseline && <div className="mt-3 grid grid-cols-2 rounded-lg bg-secondary/70 p-1">
        {(["increase", "decrease"] as const).map((value) => <button key={value} type="button" onClick={() => onDirectionChange(value)} className={`rounded-md px-2 py-1.5 text-xs font-semibold capitalize transition-colors ${direction === value ? value === "increase" ? "bg-emerald-600 text-white shadow-sm" : "bg-rose-600 text-white shadow-sm" : "text-muted-foreground hover:bg-background"}`}>{value}</button>)}
      </div>}
      <label className="mt-3 block text-[11px] font-medium text-muted-foreground">{isBaseline ? "Initial count" : `${direction === "increase" ? "Add" : "Subtract"} this update`}
        <input inputMode="numeric" min="0" step="1" type="number" className="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground" placeholder={isBaseline ? "Enter starting total" : "Enter change amount"} value={amount} onChange={(event) => onAmountChange(event.target.value)}/>
      </label>
      <p className="mt-2 text-[11px] text-muted-foreground">{typeof total === "number" ? `${isBaseline ? "Baseline" : "Updated total"}: ${formatSocialNumber(total)}` : "Total will appear here"}</p>
    </div>
  );
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = []; let cell = ""; let quoted = false;
  const input = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '"' && quoted && input[i + 1] === '"') { cell += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && input[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += char;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

export default AdminSocialPage;
