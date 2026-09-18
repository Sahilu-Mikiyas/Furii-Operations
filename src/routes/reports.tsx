import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  BarChart3,
  Download,
  Calendar,
  CheckCircle2,
  Layers,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Operational & Monthly Reports"
        description="Comprehensive periodic summaries of work completed, outputs delivered, metrics, and roadmap for the next sprint."
        actions={
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
          >
            <Download className="h-4 w-4" />
            Export Executive PDF
          </button>
        }
      />

      {/* Report Document Preview */}
      <div className="p-8 sm:p-10 rounded-2xl bg-card border border-border shadow-2xs space-y-8 max-w-4xl">
        {/* Document Header */}
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
              Furii Client Operations Report
            </span>
            <h2 className="text-2xl font-bold text-foreground">September 2026 Monthly Debrief</h2>
            <p className="text-xs text-muted-foreground font-mono">
              Client: Ersas Interiors • Project: Brand & Digital Foundation
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-foreground block">Reporting Period</span>
            <span className="text-xs text-muted-foreground font-mono">Sep 1 — Sep 30, 2026</span>
          </div>
        </div>

        {/* Work Completed Section (PRD §30) */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            1. Work Completed During Period
          </h3>
          <ul className="space-y-2 text-xs text-foreground/85 pl-6 list-disc leading-relaxed">
            <li>
              <strong>Brand Positioning & Guidelines:</strong> Finalized architectural visual moodboard, color palette hierarchy, and typography specifications.
            </li>
            <li>
              <strong>Logo Development:</strong> Iterated Concept 02 following client direction for geometric embroidery patch line-weight optimization.
            </li>
            <li>
              <strong>Homepage UI/UX Architecture:</strong> Implemented responsive hero layout, project filter showcase, and interactive prototype (Version 3).
            </li>
            <li>
              <strong>Local Search & Google Business Profile:</strong> Completed profile optimization, uploaded 12 high-resolution site photographs, verified operating hours.
            </li>
            <li>
              <strong>Social Strategy:</strong> Finalized September aesthetic editorial calendar; published 8 curated architectural posts.
            </li>
          </ul>
        </div>

        {/* Official Deliverables Handed Over */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            2. Deliverables Submitted & Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/80 space-y-1">
              <span className="text-xs font-bold text-foreground block">Homepage_v3_Final_Review.fig</span>
              <p className="text-[11px] text-muted-foreground">Interactive Figma Prototype • Awaiting Client Review</p>
            </div>
            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/80 space-y-1">
              <span className="text-xs font-bold text-foreground block">Logo_Concept_02_Refined.pdf</span>
              <p className="text-[11px] text-muted-foreground">Vector Identity Suite • Changes Requested & Iterated</p>
            </div>
            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/80 space-y-1">
              <span className="text-xs font-bold text-foreground block">Ersas_Brand_Guidelines_v1.pdf</span>
              <p className="text-[11px] text-muted-foreground">Brand Identity Guidelines • Approved ✓</p>
            </div>
          </div>
        </div>

        {/* Next Period Roadmap */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-600" />
            3. Target Roadmap for Next Period
          </h3>
          <ul className="space-y-2 text-xs text-foreground/85 pl-6 list-disc leading-relaxed">
            <li>Commence TanStack Start production frontend development upon homepage sign-off.</li>
            <li>On-site architectural photo & video shoot at Sarbet Penthouse duplex (Sep 22).</li>
            <li>Begin technical SEO schema markup and portfolio projects cataloging.</li>
            <li>Phase 2 milestone balance disbursement review (Sep 30).</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
