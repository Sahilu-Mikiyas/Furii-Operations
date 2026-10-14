import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownToLine, ArrowLeft, BarChart3, ExternalLink, Eye, Heart, Info, MessageCircle, MousePointer2, Share2, TrendingUp, Users, Video } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { toast } from "sonner";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, ReferenceLine } from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { SocialPlatformMark } from "@/components/social/SocialPlatformMark";
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
  const selectedMetricKey = definitions.some((m) => m.key === metricKey) ? metricKey : definitions.find((m) => m.primary)?.key || definitions[0]?.key || "";
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
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-1 rounded-xl border bg-background p-1">{SOCIAL_PLATFORMS.map((p) => <button key={p.id} onClick={() => { setPlatform(p.id); setMetricKey(""); }} className={`relative isolate inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${platform === p.id ? "text-white" : "text-muted-foreground hover:bg-secondary"}`} style={platform === p.id ? { color: "white" } : {}}>{platform === p.id && <motion.span layoutId="social-platform-tab" className="absolute inset-0 -z-10 rounded-lg" style={{ backgroundColor: p.color }} transition={{ type: "spring", stiffness: 420, damping: 34 }}/>}<SocialPlatformMark platform={p.id} size="sm"/><span className="relative">{p.label}</span></button>)}</div><div className="flex items-center gap-2"><label className="sr-only" htmlFor="social-range">Reporting range</label><select id="social-range" className="rounded-lg border bg-background px-3 py-2 text-xs" value={range} onChange={(e) => setRange(Number(e.target.value) as Range)}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select>{matchingAccounts.length > 1 && <select aria-label="Social account" className="max-w-56 rounded-lg border bg-background px-3 py-2 text-xs" value={currentAccountId} onChange={(e) => setAccountId(e.target.value)}>{matchingAccounts.map((a: any) => <option key={a.id} value={a.id}>{a.display_name} · @{a.handle}</option>)}</select>}</div></div>
      <AnimatePresence mode="wait" initial={false}>
      {accountsLoading ? <motion.p key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 text-center text-sm text-muted-foreground">Loading profiles…</motion.p> : !matchingAccounts.length ? <motion.div key={`empty-${platform}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}><Empty platform={platform}/></motion.div> : <motion.div key={`${platform}-${currentAccountId}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="space-y-4">
        <div className="relative isolate flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-2xl border p-4" style={{ borderColor: `${color}35`, background: `linear-gradient(115deg, ${color}12, transparent 62%)` }}><div className="pointer-events-none absolute -right-8 -top-12 -z-10 h-32 w-32 rounded-full blur-3xl" style={{ backgroundColor: `${color}22` }}/><div className="flex min-w-0 items-center gap-3"><SocialPlatformMark platform={platform} size="lg"/><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color }}>Connected profile</p><p className="truncate text-base font-bold">{selectedAccount?.display_name}</p><p className="text-xs text-muted-foreground">@{selectedAccount?.handle} · {SOCIAL_PLATFORMS.find((item) => item.id === platform)?.label}</p></div></div><div className="flex items-center gap-3">{selectedAccount?.profile_url && <a href={selectedAccount.profile_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border bg-background/80 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">View profile <ExternalLink className="h-3 w-3"/></a>}<div className="rounded-xl border bg-background/80 px-3 py-2 text-right"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Reporting period</p><p className="text-xs font-semibold">Last {range} days</p></div></div></div>
        {snapshotsLoading ? <p className="p-10 text-center text-sm text-muted-foreground">Loading reporting snapshots…</p> : error ? <p className="p-8 text-center text-sm text-rose-600">Analytics could not be loaded. Please refresh or contact the Furii team.</p> : !snapshots.length ? <div className="rounded-xl border border-dashed p-12 text-center"><BarChart3 className="mx-auto h-8 w-8 text-muted-foreground"/><h2 className="mt-3 font-semibold">Your analytics will appear here</h2><p className="mt-1 text-sm text-muted-foreground">The Furii team has not entered a snapshot for this profile yet.</p></div> : <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{definitions.filter((m) => m.primary || ["net_followers", "reach", "accounts_reached", "impressions", "video_views", "views", "engagement", "interactions"].includes(m.key)).slice(0, 4).map((m, index) => { const val = latestMetrics[m.key]; const old = priorMetrics[m.key]; const delta = typeof val === "number" && typeof old === "number" ? val - old : null; return <motion.button key={m.key} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 + index * 0.06, duration: 0.35 }} whileHover={{ y: -4, scale: 1.015, boxShadow: `0 12px 26px ${color}20` }} whileTap={{ scale: 0.985 }} onClick={() => setMetricKey(m.key)} className={`relative isolate overflow-hidden rounded-2xl border bg-background p-4 text-left transition-shadow ${selectedMetricKey === m.key ? "ring-1" : ""}`} style={selectedMetricKey === m.key ? { borderColor: color, boxShadow: `0 0 0 1px ${color}` } : {}}><div className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${color}, ${color}22)` }}/><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-muted-foreground">{m.label}</p><p className="mt-2 text-3xl font-bold tabular-nums tracking-tight"><AnimatedMetric value={val}/></p></div><span className="rounded-xl p-2.5" style={{ color, backgroundColor: `${color}13` }}><MetricGlyph metricKey={m.key}/></span></div><p className={`mt-2 text-[11px] ${delta == null ? "text-muted-foreground" : delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{delta == null ? "No previous snapshot to compare" : `${delta > 0 ? "+" : ""}${formatSocialNumber(delta)} since previous entry`}</p></motion.button>; })}</div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)]">
            <motion.section whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="overflow-hidden rounded-2xl border bg-background p-4"><div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color }}>Performance trend</p><h2 className="mt-1 font-semibold">{metric.label}</h2><p className="text-xs text-muted-foreground">Latest recorded value per day</p></div><div className="flex flex-wrap gap-1 rounded-xl bg-secondary/60 p-1">{definitions.map((m) => <button key={m.key} onClick={() => setMetricKey(m.key)} className={`rounded-lg px-2 py-1.5 text-[11px] transition-colors ${selectedMetricKey === m.key ? "text-white shadow-sm" : "text-muted-foreground hover:bg-background"}`} style={selectedMetricKey === m.key ? { background: color } : {}}>{m.label}</button>)}</div></div><div className="h-72 w-full">{chartRows.some((r) => r.value != null) ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartRows} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}><defs><linearGradient id="socialMetricFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.28}/><stop offset="95%" stopColor={color} stopOpacity={0.015}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))"/><XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={55} tickFormatter={(v) => new Intl.NumberFormat(undefined, { notation: "compact" }).format(v)}/><Tooltip labelFormatter={(_, data) => data?.[0]?.payload?.fullDate || ""} formatter={(value: number) => [formatSocialNumber(value), metric.label]}/><Area type="monotone" dataKey="value" stroke={color} strokeWidth={3} fill="url(#socialMetricFill)" dot={false} connectNulls activeDot={{ r: 5, strokeWidth: 0, fill: color }} isAnimationActive animationDuration={1100} animationEasing="ease-in-out"/></AreaChart></ResponsiveContainer> : <NoMetric/>}</div></motion.section>
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

function MetricGlyph({ metricKey }: { metricKey: string }) {
  const Icon = metricKey.includes("follower") ? Users
    : metricKey.includes("view") || metricKey.includes("reach") || metricKey.includes("impression") ? Eye
    : metricKey.includes("like") || metricKey.includes("reaction") ? Heart
    : metricKey.includes("comment") ? MessageCircle
    : metricKey.includes("share") || metricKey.includes("repost") ? Share2
    : metricKey.includes("click") ? MousePointer2
    : metricKey.includes("video") ? Video
    : TrendingUp;
  return <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={2.1}/>;
}

function Empty({ platform }: { platform: SocialPlatform }) { return <div className="rounded-xl border border-dashed p-12 text-center"><Users className="mx-auto h-8 w-8 text-muted-foreground"/><h2 className="mt-3 font-semibold">No {SOCIAL_PLATFORMS.find((p) => p.id === platform)?.label} profile connected</h2><p className="mt-1 text-sm text-muted-foreground">Ask your Furii contact to connect a profile to this workspace.</p></div>; }
function NoMetric() { return <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-center text-sm text-muted-foreground">No entries for this metric in the selected period.</div>; }

export default ClientSocialPage;
