import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useApprovals } from "@/hooks/useApprovals";
import { useProjects } from "@/hooks/useProjects";
import { useServices } from "@/hooks/useServices";
import { useTasks } from "@/hooks/useTasks";
import { useInvoices } from "@/hooks/useInvoices";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { CircularProgress } from "@/components/shared/CircularProgress";
import { useFinancialSummary } from "@/hooks/useFinancialSummary";
import { ProductionCalendarView } from "@/components/calendar/ProductionCalendarView";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Sparkles,
  ArrowRight,
  Calendar,
  Building2,
  CheckCircle2,
  FileCheck2,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { formatSocialNumber, isActiveSocialService, SOCIAL_METRICS, SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/socialAnalytics";

export function ClientOverviewPage() {
  const { currentClient, currency, role } = useAuth();

  const clientId = currentClient?.id;
  const { approvals } = useApprovals(clientId);
  const { projects } = useProjects(clientId);
  const { services } = useServices(undefined, clientId);
  const { tasks } = useTasks();
  const { invoices } = useInvoices(clientId);
  const { events } = useCalendarEvents(clientId);

  const isClientOwner = role === "client" || role === "client_owner";
  const socialServices = useMemo(
    () => services.filter((service) => isActiveSocialService(service.service_type, service.status)),
    [services]
  );
  const [socialServiceId, setSocialServiceId] = useState("");
  const socialService = socialServices.find((service) => service.id === socialServiceId) || socialServices[0];
  const socialDb = supabase as any;
  const { data: socialAccounts = [], isLoading: socialAccountsLoading } = useQuery({
    queryKey: ["overview-social-accounts", socialService?.id],
    queryFn: async () => {
      if (!socialService) return [];
      const { data, error } = await socialDb.from("social_accounts").select("*").eq("service_id", socialService.id).eq("is_active", true).order("created_at");
      if (error) throw error;
      return data || [];
    },
    enabled: !!socialService,
  });
  const socialAccountIds = socialAccounts.map((account: any) => account.id);
  const { data: socialSnapshots = [], isLoading: socialSnapshotsLoading } = useQuery({
    queryKey: ["overview-social-snapshots", socialService?.id, socialAccountIds],
    queryFn: async () => {
      if (!socialAccountIds.length) return [];
      const { data, error } = await socialDb.from("social_snapshots_latest").select("*").in("account_id", socialAccountIds).order("slot_date", { ascending: true }).order("slot", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: socialAccountIds.length > 0,
  });

  const socialSummary = useMemo(() => {
    const byAccount = new Map<string, any[]>();
    for (const snapshot of socialSnapshots) {
      const list = byAccount.get(snapshot.account_id) || [];
      list.push(snapshot);
      byAccount.set(snapshot.account_id, list);
    }
    let followers = 0;
    let followersCounted = 0;
    let netChange = 0;
    let netCounted = 0;
    const perAccountDaily = new Map<string, Map<string, any>>();
    for (const account of socialAccounts) {
      const rows = byAccount.get(account.id) || [];
      const metricDefs = SOCIAL_METRICS[account.platform as SocialPlatform];
      const followerKey = metricDefs.find((metric) => metric.primary)?.key;
      const daily = new Map<string, any>();
      for (const row of rows) {
        const prior = daily.get(row.slot_date);
        if (!prior || row.slot === "pm") daily.set(row.slot_date, row);
      }
      perAccountDaily.set(account.id, daily);
      const ordered = [...daily.values()].sort((a, b) => a.slot_date.localeCompare(b.slot_date));
      const latest = ordered.at(-1);
      const previous = ordered.at(-2);
      const latestFollowers = followerKey ? latest?.metrics?.[followerKey] : undefined;
      const previousFollowers = followerKey ? previous?.metrics?.[followerKey] : undefined;
      if (typeof latestFollowers === "number") { followers += latestFollowers; followersCounted += 1; }
      const capturedChange = latest?.metrics?.net_followers;
      if (typeof capturedChange === "number") { netChange += capturedChange; netCounted += 1; }
      else if (typeof latestFollowers === "number" && typeof previousFollowers === "number") { netChange += latestFollowers - previousFollowers; netCounted += 1; }
    }
    const dates = [...new Set(socialSnapshots.map((snapshot: any) => snapshot.slot_date as string))].slice(-30);
    const trend = dates.map((date) => {
      let value = 0; let count = 0;
      for (const account of socialAccounts) {
        const key = SOCIAL_METRICS[account.platform as SocialPlatform].find((metric) => metric.primary)?.key;
        const daily = perAccountDaily.get(account.id);
        const candidateDate = [...(daily?.keys() || [])].filter((day) => day <= date).at(-1);
        const snapshot = candidateDate ? daily?.get(candidateDate) : undefined;
        const metricValue = key ? snapshot?.metrics?.[key] : undefined;
        if (typeof metricValue === "number") { value += metricValue; count += 1; }
      }
      return { date: date.slice(5), fullDate: date, followers: count ? value : null };
    });
    const latestAt = socialSnapshots.at(-1)?.captured_at as string | undefined;
    return { followers, followersCounted, netChange, netCounted, trend, latestAt };
  }, [socialAccounts, socialSnapshots]);


  const pendingApprovals = approvals.filter(
    (a) => a.status === "awaiting_review" || a.status === "pending"
  );

  const {
    totalPaid: paidTotal,
    totalOutstanding: remainingTotal,
    overallDeliveryPct,
  } = useFinancialSummary(clientId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Header with Client Identity */}
      <div className="p-5 sm:p-7 rounded-2xl bg-card border border-border shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">
              Client Portal
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-medium">
              {currentClient?.industry || "Enterprise Partner"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight truncate">
            {currentClient?.name || "Corporate Workspace"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {currentClient?.description ||
              "Your dedicated operations center for deliverables, formal sign-offs, and service progress."}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-secondary/50 border border-border/80 shrink-0 sm:min-w-64 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-semibold">Overall Delivery</span>
            <span className="font-mono font-bold text-foreground text-sm">{overallDeliveryPct}%</span>
          </div>
          <ProgressBar value={overallDeliveryPct} showValue={false} />
        </div>
      </div>

      {/* Action Required Banner for Client Owner */}
      {pendingApprovals.length > 0 && isClientOwner && (
        <div className="p-4 sm:p-5 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold shrink-0">
              <Sparkles className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-950">
                Action Required: Deliverables Awaiting Sign-Off
              </h2>
              <p className="text-xs text-amber-800 mt-0.5">
                {pendingApprovals.length} deliverable(s) are awaiting your executive sign-off or requested modifications.
              </p>
            </div>
          </div>
          <Link
            to="/portal/approvals"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-900 text-amber-50 hover:bg-amber-800 font-semibold text-xs transition-colors shadow-2xs text-center shrink-0"
          >
            Review Deliverables ({pendingApprovals.length}) →
          </Link>
        </div>
      )}

      {/* Active Service Streams */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Active Service Streams</h2>
            <p className="text-xs text-muted-foreground">
              Production progress and technical outputs across your retained services.
            </p>
          </div>
          <Link
            to="/portal/services"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            All Services <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => {
            const serviceTasks = tasks.filter(
              (task) => task.service_id === srv.id || task.project_id === srv.project_id
            );
            const completedTasksCount = serviceTasks.filter((task) => task.status === "completed").length;
            const progress = serviceTasks.length > 0
              ? Math.round((completedTasksCount / serviceTasks.length) * 100)
              : srv.progress || 0;

            return (
            <Link
              key={srv.id}
              to="/portal/services"
              className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/70 border border-border/80 transition-all space-y-3 group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">
                    {srv.service_type}
                  </span>
                  <StatusBadge status={srv.status} />
                </div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {srv.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {srv.summary || srv.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3 min-w-0">
                <CircularProgress
                  value={progress}
                  size={38}
                  strokeWidth={3.5}
                  label="Phase Progress"
                  sublabel={srv.current_phase || (progress === 100 ? "Completed" : "Active")}
                  className="min-w-0 flex-1"
                />
                <span className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0">
                  Track →
                </span>
              </div>
            </Link>
            );
          })}
        </div>
      </div>

      {/* Social analytics spotlight */}
      {socialService && (
        <section className="relative isolate overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-fuchsia-500 via-55% to-amber-500" />
          <div className="pointer-events-none absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full bg-fuchsia-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 -z-10 h-64 w-64 rounded-full bg-teal-200/30 blur-3xl" />
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.9fr)] lg:items-center">
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/15 via-fuchsia-500/15 to-amber-500/20 text-primary">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Social studio</p>
                    <h2 className="text-lg font-bold tracking-tight">Your social performance</h2>
                  </div>
                </div>
                {socialServices.length > 1 && (
                  <select
                    aria-label="Social service workspace"
                    className="max-w-52 rounded-lg border border-border bg-background/90 px-3 py-2 text-xs font-medium"
                    value={socialService.id}
                    onChange={(event) => setSocialServiceId(event.target.value)}
                  >
                    {socialServices.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
                  </select>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">{socialService.name}</span>
                <span className="text-muted-foreground/50">·</span>
                {socialAccounts.map((account: any) => {
                  const info = SOCIAL_PLATFORMS.find((item) => item.id === account.platform);
                  return <span key={account.id} className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold" style={{ borderColor: `${info?.color}35`, backgroundColor: `${info?.color}0D`, color: info?.color }}><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: info?.color }} />{info?.label}</span>;
                })}
                {!socialAccounts.length && !socialAccountsLoading && <span className="text-xs text-muted-foreground">Profiles are being set up by the Furii team</span>}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border/80 bg-background/75 p-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total followers</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">{socialAccountsLoading || socialSnapshotsLoading ? "···" : socialSummary.followersCounted ? formatSocialNumber(socialSummary.followers) : "—"}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">Combined across tracked profiles</p>
                </div>
                <div className="rounded-xl border border-border/80 bg-background/75 p-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Net follower change</p>
                  <p className={`mt-1 flex items-center gap-1 text-2xl font-bold tabular-nums tracking-tight ${socialSummary.netCounted && socialSummary.netChange < 0 ? "text-rose-600" : "text-emerald-700"}`}>
                    {socialAccountsLoading || socialSnapshotsLoading ? "···" : socialSummary.netCounted ? <><TrendingUp className="h-4 w-4" />{socialSummary.netChange > 0 ? "+" : ""}{formatSocialNumber(socialSummary.netChange)}</> : "—"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">Since previous recorded update</p>
                </div>
                <div className="col-span-2 rounded-xl border border-border/80 bg-background/75 p-3.5 sm:col-span-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Profiles tracked</p>
                  <p className="mt-1 flex items-center gap-2 text-2xl font-bold tabular-nums tracking-tight"><Users className="h-4 w-4 text-primary" />{socialAccountsLoading ? "···" : socialAccounts.length}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">Managed by the Furii team</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] text-muted-foreground">{socialSummary.latestAt ? `Updated ${new Date(socialSummary.latestAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} · recorded by Furii` : "Your analytics will appear after the first update."}</p>
                <Link to={`/portal/services/${socialService.id}/social`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90">
                  See your socials <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="relative min-h-56 overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-secondary/60 via-background/95 to-fuchsia-50/60 p-4 sm:p-5">
              <div className="relative z-10 flex items-start justify-between">
                <div><p className="text-xs font-semibold">Follower trend</p><p className="mt-0.5 text-[10px] text-muted-foreground">Combined followers · daily snapshots</p></div>
                <span className="rounded-full bg-background/80 px-2 py-1 text-[10px] text-muted-foreground">Last 30 updates</span>
              </div>
              <div className="mt-4 h-36 w-full">
                {socialSummary.trend.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={socialSummary.trend} margin={{ top: 4, right: 3, bottom: 0, left: 3 }}>
                      <defs><linearGradient id="socialAudienceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b21f67" stopOpacity={0.25} /><stop offset="100%" stopColor="#0f8b88" stopOpacity={0.02} /></linearGradient></defs>
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} minTickGap={24} />
                      <Tooltip labelFormatter={(_, rows) => rows?.[0]?.payload?.fullDate || ""} formatter={(value: number) => [formatSocialNumber(value), "Followers"]} />
                      <Area type="monotone" dataKey="followers" stroke="#a42a70" strokeWidth={2.5} fill="url(#socialAudienceFill)" connectNulls activeDot={{ r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col justify-end gap-3 pb-2">
                    <div className="flex h-24 items-end gap-2 opacity-50" aria-hidden="true">
                      {[38, 56, 45, 71, 62, 83, 74, 96, 88, 100].map((height, index) => <div key={index} className="flex-1 rounded-t-md bg-gradient-to-t from-teal-500/50 via-fuchsia-500/45 to-amber-400/40" style={{ height: `${height}%` }} />)}
                    </div>
                    <p className="text-center text-[11px] text-muted-foreground">A trend line appears as your analytics history builds.</p>
                  </div>
                )}
              </div>
              <div className="pointer-events-none absolute -bottom-16 -right-12 h-36 w-36 rounded-full border-[22px] border-fuchsia-300/10" aria-hidden="true" />
            </div>
          </div>
        </section>
      )}

      {/* Statement & Billing Summary (Client Owner) */}
      {isClientOwner && (
        <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Statement & Billing</h2>
              <p className="text-xs text-muted-foreground">
                Consolidated financials across approved service contracts and active milestones.
              </p>
            </div>
            <Link
              to="/portal/financials"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Full statement →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800 space-y-1">
              <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-400 uppercase font-mono">
                Paid to Date
              </span>
              <p className="text-2xl font-bold font-mono text-emerald-950 dark:text-emerald-300">
                {formatCurrency(paidTotal, currency)}
              </p>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Verified Milestone Deposits</span>
            </div>

            <div className="p-4 rounded-xl bg-secondary/60 border border-border space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase font-mono">
                Remaining Balance
              </span>
              <p className="text-2xl font-bold font-mono text-foreground">
                {formatCurrency(remainingTotal, currency)}
              </p>
              <span className="text-[10px] text-muted-foreground">Due at Final Delivery</span>
            </div>
          </div>
        </div>
      )}

      {/* Production Timeline & Shoots (Detailed Monthly Calendar & Comment Box) */}
      <ProductionCalendarView
        clientId={clientId}
        title="Production Timeline & Shoots"
        subtitle="Detailed monthly production calendar with call sheets, shoot logistics, and dedicated client feedback."
      />
    </motion.div>
  );
}
