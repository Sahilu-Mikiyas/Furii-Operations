import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownToLine, ArrowLeft, ExternalLink, Info, TrendingUp, Users } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { toast } from "sonner";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, ReferenceLine } from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/lib/auth";
import { useServices } from "@/hooks/useServices";
import { freshnessLabel, formatSocialNumber, isActiveSocialService, SOCIAL_METRICS, SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/socialAnalytics";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;
type Range = 7 | 30 | 90;

export function ClientSocialPage() {
  const { serviceId = "" } = useParams();
  const { currentClient } = useAuth();
  const { services, isLoading: servicesLoading } = useServices(undefined, currentClient?.id);
  const service = services.find((s) => s.id === serviceId);
  const [platform, setPlatform] = useState<SocialPlatform>("instagram");
  const [accountId, setAccountId] = useState("");
  const [range, setRange] = useState<Range>(30);
  const [metricKey, setMetricKey] = useState("");

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["client-social-accounts", serviceId],
    queryFn: async () => {
      const { data, error } = await db.from("social_accounts").select("*").eq("service_id", serviceId).eq("is_active", true).order("created_at");
      if (error) throw error;
      return data || [];
    }, enabled: !!service && isActiveSocialService(service.service_type, service.status),
  });
  const matchingAccounts = accounts.filter((a: any) => a.platform === platform);
  const currentAccountId = matchingAccounts.some((a: any) => a.id === accountId) ? accountId : matchingAccounts[0]?.id || "";
  const { data: snapshots = [], isLoading: snapshotsLoading, error } = useQuery({
    queryKey: ["client-social-snapshots", currentAccountId],
    queryFn: async () => {
      const { data, error } = await db.from("social_snapshots_latest").select("*").eq("account_id", currentAccountId).order("slot_date", { ascending: true }).order("slot", { ascending: true });
      if (error) throw error;
      return data || [];
    }, enabled: !!currentAccountId,
  });
  const { data: reports = [] } = useQuery({
    queryKey: ["client-social-reports", serviceId],
    queryFn: async () => {
      const { data, error } = await db.from("social_reports").select("*").eq("service_id", serviceId).eq("status", "published").order("period_end", { ascending: false });
      if (error) throw error;
      return data || [];
    }, enabled: !!service && isActiveSocialService(service.service_type, service.status),
  });

  const definitions = SOCIAL_METRICS[platform];
  const selectedMetricKey = definitions.some((m) => m.key === metricKey) ? metricKey : definitions.find((m) => m.primary)?.key || definitions[0].key;
  const metric = definitions.find((m) => m.key === selectedMetricKey)!;
  const latest = snapshots.at(-1);
  const previous = snapshots.length > 1 ? snapshots.at(-2) : undefined;
  const latestMetrics = latest?.metrics || {};
  const priorMetrics = previous?.metrics || {};
  const latestValue = latestMetrics[selectedMetricKey];
  const priorValue = priorMetrics[selectedMetricKey];
  const difference = typeof latestValue === "number" && typeof priorValue === "number" ? latestValue - priorValue : null;
  const fresh = freshnessLabel(latest?.captured_at);

  const chartRows = useMemo(() => {
    const latestByDay = new Map<string, any>();
    for (const snap of snapshots) {
      const existing = latestByDay.get(snap.slot_date);
      if (!existing || snap.slot === "pm") latestByDay.set(snap.slot_date, snap);
    }
    return [...latestByDay.values()].slice(-range).map((s) => ({ date: s.slot_date.slice(5), fullDate: s.slot_date, value: s.metrics?.[selectedMetricKey] ?? null }));
  }, [snapshots, range, selectedMetricKey]);

  const netFollowerKey = definitions.find((m) => m.key === "net_followers")?.key;
  const followerBars = useMemo(() => {
    if (!netFollowerKey) return [];
    const latestByDay = new Map<string, any>();
    for (const snap of snapshots) {
      const existing = latestByDay.get(snap.slot_date);
      if (!existing || snap.slot === "pm") latestByDay.set(snap.slot_date, snap);
    }
    return [...latestByDay.values()].slice(-range).map((s) => ({ date: s.slot_date.slice(5), value: s.metrics?.[netFollowerKey] ?? 0 }));
  }, [snapshots, range, netFollowerKey]);

  if (servicesLoading || (service && accountsLoading)) return <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">Loading social analytics…</div>;
  if (!service || !isActiveSocialService(service.service_type, service.status)) return <div className="space-y-4"><Link to="/portal/services" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4"/>Back to services</Link><div className="rounded-2xl border bg-card p-10 text-center"><h1 className="text-lg font-semibold">Social analytics unavailable</h1><p className="mt-2 text-sm text-muted-foreground">This service does not include an active social media analytics workspace.</p></div></div>;

  const selectedAccount = matchingAccounts.find((a: any) => a.id === currentAccountId);
  const color = SOCIAL_PLATFORMS.find((p) => p.id === platform)?.color || "#2858c9";

  return <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: "easeOut" }} className="space-y-6">
    <Link to="/portal/services" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5"/>Services & Production Hub</Link>
    <PageHeader title="My Socials" description={`${service.name} · Manually recorded analytics from the Furii team.`} actions={<div className="flex items-center gap-2 text-xs"><span className={`rounded-full px-2.5 py-1 ${fresh.tone === "good" ? "bg-emerald-50 text-emerald-700" : fresh.tone === "warn" ? "bg-amber-50 text-amber-700" : fresh.tone === "stale" ? "bg-rose-50 text-rose-700" : "bg-secondary text-muted-foreground"}`}>● {fresh.text}</span><span className="text-muted-foreground">· Recorded by the Furii team</span></div>}/>
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.45 }} className="space-y-4 rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-1 rounded-lg border bg-background p-1">{SOCIAL_PLATFORMS.map((p) => <button key={p.id} onClick={() => { setPlatform(p.id); setMetricKey(""); }} className={`relative isolate rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${platform === p.id ? "text-white" : "text-muted-foreground hover:bg-secondary"}`} style={platform === p.id ? { color: "white" } : {}}>{platform === p.id && <motion.span layoutId="social-platform-tab" className="absolute inset-0 -z-10 rounded-md" style={{ backgroundColor: p.color }} transition={{ type: "spring", stiffness: 420, damping: 34 }}/>}<span className="relative">{p.label}</span></button>)}</div><div className="flex items-center gap-2"><label className="sr-only" htmlFor="social-range">Reporting range</label><select id="social-range" className="rounded-lg border bg-background px-3 py-2 text-xs" value={range} onChange={(e) => setRange(Number(e.target.value) as Range)}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select>{matchingAccounts.length > 1 && <select aria-label="Social account" className="max-w-56 rounded-lg border bg-background px-3 py-2 text-xs" value={currentAccountId} onChange={(e) => setAccountId(e.target.value)}>{matchingAccounts.map((a: any) => <option key={a.id} value={a.id}>{a.display_name} · @{a.handle}</option>)}</select>}</div></div>
      <AnimatePresence mode="wait" initial={false}>
      {accountsLoading ? <motion.p key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 text-center text-sm text-muted-foreground">Loading profiles…</motion.p> : !matchingAccounts.length ? <motion.div key={`empty-${platform}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}><Empty platform={platform}/></motion.div> : <motion.div key={`${platform}-${currentAccountId}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/40 px-3 py-2.5"><div className="flex items-center gap-2 text-sm font-semibold"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }}/>{selectedAccount?.display_name}<span className="font-normal text-muted-foreground">@{selectedAccount?.handle}</span></div>{selectedAccount?.profile_url && <a href={selectedAccount.profile_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">View profile <ExternalLink className="h-3 w-3"/></a>}</div>
        {snapshotsLoading ? <p className="p-10 text-center text-sm text-muted-foreground">Loading reporting snapshots…</p> : error ? <p className="p-8 text-center text-sm text-rose-600">Analytics could not be loaded. Please refresh or contact the Furii team.</p> : !snapshots.length ? <div className="rounded-xl border border-dashed p-12 text-center"><BarChart3 className="mx-auto h-8 w-8 text-muted-foreground"/><h2 className="mt-3 font-semibold">Your analytics will appear here</h2><p className="mt-1 text-sm text-muted-foreground">The Furii team has not entered a snapshot for this profile yet.</p></div> : <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{definitions.filter((m) => m.primary || ["net_followers", "reach", "accounts_reached", "impressions", "video_views", "views", "engagement", "interactions"].includes(m.key)).slice(0, 4).map((m, index) => { const val = latestMetrics[m.key]; const old = priorMetrics[m.key]; const delta = typeof val === "number" && typeof old === "number" ? val - old : null; return <motion.button key={m.key} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 + index * 0.06, duration: 0.35 }} whileHover={{ y: -4, scale: 1.01, boxShadow: "0 12px 26px rgba(15, 23, 42, 0.08)" }} whileTap={{ scale: 0.985 }} onClick={() => setMetricKey(m.key)} className={`rounded-xl border bg-background p-4 text-left transition-shadow ${selectedMetricKey === m.key ? "ring-1" : ""}`} style={selectedMetricKey === m.key ? { borderColor: color, boxShadow: `0 0 0 1px ${color}` } : {}}><p className="text-xs text-muted-foreground">{m.label}</p><p className="mt-1 text-2xl font-bold tabular-nums"><AnimatedMetric value={val}/></p><p className={`mt-1 text-[11px] ${delta == null ? "text-muted-foreground" : delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{delta == null ? "No previous snapshot to compare" : `${delta > 0 ? "+" : ""}${formatSocialNumber(delta)} since previous entry`}</p></motion.button>; })}</div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)]">
            <motion.section whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="rounded-xl border bg-background p-4"><div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><h2 className="font-semibold">Channel growth and reach</h2><p className="text-xs text-muted-foreground">{metric.label} · latest recorded value per day</p></div><div className="flex flex-wrap gap-1">{definitions.map((m) => <button key={m.key} onClick={() => setMetricKey(m.key)} className={`rounded-md px-2 py-1 text-[11px] transition-colors ${selectedMetricKey === m.key ? "text-white" : "bg-secondary text-muted-foreground"}`} style={selectedMetricKey === m.key ? { background: color } : {}}>{m.label}</button>)}</div></div><div className="h-64 w-full">{chartRows.some((r) => r.value != null) ? <ResponsiveContainer width="100%" height="100%"><LineChart data={chartRows} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))"/><XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={55} tickFormatter={(v) => new Intl.NumberFormat(undefined, { notation: "compact" }).format(v)}/><Tooltip labelFormatter={(_, data) => data?.[0]?.payload?.fullDate || ""} formatter={(value: number) => [formatSocialNumber(value), metric.label]}/><Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={false} connectNulls activeDot={{ r: 5 }} isAnimationActive animationDuration={950} animationEasing="ease-in-out"/></LineChart></ResponsiveContainer> : <NoMetric/>}</div></motion.section>
            <section className="rounded-xl border bg-background p-4"><div className="mb-4"><h2 className="font-semibold">Latest snapshot</h2><p className="text-xs text-muted-foreground">{latest?.slot_date} · {latest?.slot === "am" ? "Morning" : "Evening"} capture</p></div><div className="space-y-2">{definitions.map((m) => <button key={m.key} onClick={() => setMetricKey(m.key)} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-secondary/60"><span className="text-muted-foreground">{m.label}</span><span className="font-semibold tabular-nums">{formatSocialNumber(latestMetrics[m.key])}</span></button>)}</div><div className="mt-3 flex items-start gap-2 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground"><Info className="mt-0.5 h-4 w-4 shrink-0"/>Values are entered by the Furii team from platform analytics. Totals and reporting-window metrics use the definitions noted by the platform.</div></section>
          </div>
          {netFollowerKey && <motion.section whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="rounded-xl border bg-background p-4"><div className="mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4" style={{ color }}/><div><h2 className="font-semibold">Net follower change</h2><p className="text-xs text-muted-foreground">Gained followers minus lost followers</p></div></div><div className="h-40">{followerBars.some((r) => r.value !== 0) ? <ResponsiveContainer width="100%" height="100%"><BarChart data={followerBars}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))"/><XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false}/><YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={45}/><ReferenceLine y={0} stroke="hsl(var(--muted-foreground))"/><Tooltip formatter={(v: number) => [formatSocialNumber(v), "Net followers"]}/><Bar dataKey="value" fill={color} radius={[4,4,0,0]} isAnimationActive animationDuration={850} animationEasing="ease-out"/></BarChart></ResponsiveContainer> : <NoMetric/>}</div></motion.section>}
          {reports.length > 0 && <section className="rounded-xl border bg-background p-4"><h2 className="font-semibold">Social reports</h2><p className="mb-3 text-xs text-muted-foreground">Reviewed updates prepared by the Furii team.</p><div className="divide-y">{reports.map((report: any) => <div key={report.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-sm font-semibold">{new Date(`${report.period_start}T00:00:00`).toLocaleDateString()} – {new Date(`${report.period_end}T00:00:00`).toLocaleDateString()}</p>{report.commentary && <p className="mt-1 max-w-2xl text-xs text-muted-foreground">{report.commentary}</p>}</div><button onClick={async () => { const preview = window.open("", "_blank"); const { data, error } = await supabase.storage.from("social-reports").createSignedUrl(report.file_path, 60); if (error) { preview?.close(); toast.error(error.message); } else if (preview) preview.location.href = data.signedUrl; }} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"><ArrowDownToLine className="h-3.5 w-3.5"/>Download PDF</button></div>)}</div></section>}
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Users className="h-3.5 w-3.5"/>Metrics updated twice daily by the Furii team. Values are manually recorded, and corrections are retained in the service history.</p>
        </>}
      </motion.div>}
      </AnimatePresence>
    </motion.section>
  </motion.div>;
}

function AnimatedMetric({ value }: { value: unknown }) {
  const numeric = typeof value === "number" ? value : null;
  const motionValue = useMotionValue(numeric ?? 0);
  const spring = useSpring(motionValue, { stiffness: 90, damping: 22, mass: 0.7 });
  const display = useTransform(spring, (current) => formatSocialNumber(Math.round(current)));
  useEffect(() => { motionValue.set(numeric ?? 0); }, [motionValue, numeric]);
  return numeric == null ? <>—</> : <motion.span>{display}</motion.span>;
}

function Empty({ platform }: { platform: SocialPlatform }) { return <div className="rounded-xl border border-dashed p-12 text-center"><Users className="mx-auto h-8 w-8 text-muted-foreground"/><h2 className="mt-3 font-semibold">No {SOCIAL_PLATFORMS.find((p) => p.id === platform)?.label} profile connected</h2><p className="mt-1 text-sm text-muted-foreground">Ask your Furii contact to connect a profile to this workspace.</p></div>; }
function NoMetric() { return <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-center text-sm text-muted-foreground">No entries for this metric in the selected period.</div>; }

export default ClientSocialPage;
