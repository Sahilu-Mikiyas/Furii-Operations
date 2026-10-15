import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useServiceRequests } from "@/hooks/useServiceRequests";
import { useInstallmentPlans } from "@/hooks/useInstallmentPlans";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatCurrency } from "@/lib/utils";
import {
  CURATED_PACKAGES,
  BASE_WEBSITE_DEVELOPMENT,
  DEVELOPMENT_ADDONS,
  BRANDING_TIERS,
  CONTENT_PRODUCTION,
  A_LA_CARTE_CATALOG,
} from "@/data/catalog";
import {
  Package,
  Code2,
  Palette,
  Video,
  Wrench,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Plus,
  ArrowLeft,
  Receipt,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function ClientCatalogPage() {
  const navigate = useNavigate();
  const { currentClient, currency } = useAuth();
  const { createRequest, isCreating } = useServiceRequests();
  const { submitRequest: submitInstallmentRequest, isSaving: isSavingPlan } = useInstallmentPlans();

  const [activeTab, setActiveTab] = useState<"packages" | "development" | "branding" | "production" | "build_myself">("packages");
  const [expandedPackage, setExpandedPackage] = useState<string | null>("pkg-real-estate");

  // Development Tab State
  const [selectedDevAddons, setSelectedDevAddons] = useState<string[]>(["dev-g-business", "dev-seo"]);

  // Build Myself State
  const [customDescription, setCustomDescription] = useState("");
  const [selectedAlcItems, setSelectedAlcItems] = useState<string[]>([]);
  const [customTitle, setCustomTitle] = useState("");
  const [urgency, setUrgency] = useState<"low" | "normal" | "high" | "urgent">("normal");

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    type: "package" | "development" | "branding" | "production" | "custom";
    estimatedTotal: number;
    items: any[];
    description?: string;
    paymentPlan?: boolean;
    downPayment?: number;
    installmentCount?: number;
  } | null>(null);

  // Success Confirmation State
  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    requestId: string;
    title: string;
    total: number;
    paymentPlan?: boolean;
  } | null>(null);

  // Toggle Dev Addons
  const toggleDevAddon = (id: string) => {
    setSelectedDevAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const calculateDevTotal = () => {
    const addonsTotal = selectedDevAddons.reduce((acc, id) => {
      const addon = DEVELOPMENT_ADDONS.find((a) => a.id === id);
      return acc + (addon ? addon.price : 0);
    }, 0);
    return BASE_WEBSITE_DEVELOPMENT.price + addonsTotal;
  };

  // Toggle À la carte items
  const toggleAlcItem = (id: string) => {
    setSelectedAlcItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const calculateAlcTotal = () => {
    return selectedAlcItems.reduce((acc, id) => {
      const item = A_LA_CARTE_CATALOG.find((a) => a.id === id);
      return acc + (item ? item.price : 0);
    }, 0);
  };

  const minimumDown = Math.ceil((confirmModal?.estimatedTotal || 0) * 0.4);
  const selectedDown = confirmModal?.downPayment ?? minimumDown;
  const remainingAfterDown = Math.max((confirmModal?.estimatedTotal || 0) - selectedDown, 0);
  const maxInstallments = Math.min(24, Math.floor(remainingAfterDown / 15000));
  const selectedInstallments = confirmModal?.installmentCount ?? 1;
  const monthlyBase = selectedInstallments ? Math.floor((remainingAfterDown / selectedInstallments) * 100) / 100 : 0;
  const monthlyLast = Math.round((remainingAfterDown - monthlyBase * Math.max(selectedInstallments - 1, 0)) * 100) / 100;

  // Handle Submit Request
  const handleConfirmRequest = async () => {
    if (!confirmModal) return;

    try {
      const res = confirmModal.paymentPlan
        ? { id: String(await submitInstallmentRequest({
            title: confirmModal.title,
            description: confirmModal.description || "",
            requestType: confirmModal.type,
            items: confirmModal.items,
            total: confirmModal.estimatedTotal,
            down: confirmModal.downPayment || confirmModal.estimatedTotal,
            count: confirmModal.installmentCount || 1,
          })) }
        : await createRequest({
        request_type: confirmModal.type,
        title: confirmModal.title,
        description: confirmModal.description || "",
        catalog_items: confirmModal.items,
        estimated_total: confirmModal.estimatedTotal,
        currency: currency || "ETB",
        urgency: urgency,
      });

      toast.success(confirmModal.paymentPlan ? "Installment request sent for review." : "Service request submitted successfully!");
      setConfirmModal(null);
      setSuccessModal({
        open: true,
        requestId: res.id,
        title: confirmModal.title,
        total: confirmModal.estimatedTotal,
        paymentPlan: Boolean(confirmModal.paymentPlan),
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit service request");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Services & Solutions Catalog"
        description="Select turnkey curated packages, configure modular development upgrades, or build a tailored engagement."
        actions={
          <button
            onClick={() => navigate("/portal/services")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Services Dashboard
          </button>
        }
      />

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-secondary/50 rounded-xl border border-border/80 w-fit overflow-x-auto no-scrollbar">
        {[
          { id: "packages", label: "Curated Packages", icon: Package, badge: "Bundles" },
          { id: "development", label: "Development", icon: Code2, badge: "Modular" },
          { id: "branding", label: "Branding", icon: Palette, badge: "4 Tiers" },
          { id: "production", label: "Production", icon: Video, badge: "Retainers" },
          { id: "build_myself", label: "Build Myself", icon: Wrench, badge: "Custom" },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                active
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: PACKAGES                                      */}
      {/* ======================================================== */}
      {activeTab === "packages" && (
        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                Turnkey Bundles
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">Turnkey Solution Suites</h2>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Heavily discounted comprehensive packages combining web platform architecture, Google Business verification, and local search discoverability.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {CURATED_PACKAGES.map((pkg) => {
              const isExpanded = expandedPackage === pkg.id;
              return (
                <div
                  key={pkg.id}
                  className="rounded-2xl bg-card border border-border hover:border-primary/40 transition-all shadow-2xs overflow-hidden"
                >
                  <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-border/80">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-secondary text-muted-foreground font-semibold border border-border/80">
                          Package {pkg.number}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          Save {formatCurrency(pkg.savings, currency)} ({pkg.savingsPercent}% OFF)
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-foreground">{pkg.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{pkg.tagline}</p>
                      <p className="text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">Goal:</span> {pkg.coreGoal}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/80">
                      <div>
                        <span className="text-[10px] text-muted-foreground line-through block font-mono">
                          Value: {formatCurrency(pkg.originalValue, currency)}
                        </span>
                        <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                          {formatCurrency(pkg.price, currency)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() =>
                            setConfirmModal({
                              open: true,
                              type: "package",
                              title: `${pkg.name} (Pkg ${pkg.number})`,
                              estimatedTotal: pkg.price,
                              items: pkg.includedServices,
                              description: `${pkg.tagline} Goal: ${pkg.coreGoal}`,
                            })
                          }
                          className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer w-full sm:w-auto"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Request Package
                        </button>

                        <button
                          onClick={() => setExpandedPackage(isExpanded ? null : pkg.id)}
                          className="p-1.5 rounded-lg border border-border bg-secondary/40 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Included Services Details */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 bg-secondary/15 space-y-4 animate-in fade-in duration-200">
                      <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block">
                        Included Deliverables & Services
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pkg.includedServices.map((srv, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-card border border-border shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                              <span>{srv.name}</span>
                              <span className="font-mono text-muted-foreground text-[11px]">
                                {formatCurrency(srv.value, currency)}
                              </span>
                            </div>
                            <ul className="space-y-1 text-[11px] text-muted-foreground">
                              {srv.description.map((line, lIdx) => (
                                <li key={lIdx} className="flex items-start gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                                  <span>{line}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {pkg.addons && pkg.addons.length > 0 && (
                        <div className="pt-3 border-t border-border/60">
                          <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold block mb-2">
                            Optional Add-ons
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {pkg.addons.map((add, aIdx) => (
                              <span
                                key={aIdx}
                                className="px-2.5 py-1 bg-card border border-border rounded-lg text-xs text-foreground font-medium flex items-center gap-1.5"
                              >
                                <span>{add.name}</span>
                                <span className="font-mono text-muted-foreground text-[11px]">
                                  +{formatCurrency(add.price, currency)}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: DEVELOPMENT                                   */}
      {/* ======================================================== */}
      {activeTab === "development" && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-2xl">
              <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                Base Architecture
              </span>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {BASE_WEBSITE_DEVELOPMENT.name}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Foundational web engineering platform engineered for speed, custom responsive UI, contact routing, and deployment.
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  1 Free Admin User Account
                </span>
                <span className="flex items-center gap-1 font-mono">
                  Delivery: {BASE_WEBSITE_DEVELOPMENT.deliveryTime}
                </span>
              </div>
            </div>

            <div className="p-4 bg-secondary/40 rounded-xl border border-border text-left md:text-right shrink-0">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">Base Investment</span>
              <span className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(BASE_WEBSITE_DEVELOPMENT.price, currency)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Modular Features & Add-ons
              </h4>
              <div className="text-xs font-mono font-bold text-foreground">
                Configured Total: {formatCurrency(calculateDevTotal(), currency)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {DEVELOPMENT_ADDONS.map((addon) => {
                const isChecked = selectedDevAddons.includes(addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleDevAddon(addon.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                      isChecked
                        ? "bg-primary/5 border-primary shadow-2xs"
                        : "bg-card border-border hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h5 className="font-semibold text-xs text-foreground">{addon.name}</h5>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {addon.description}
                        </p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          isChecked
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border bg-secondary"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/60 text-right text-xs font-mono font-semibold text-foreground">
                      +{formatCurrency(addon.price, currency)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-card border border-border shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <div className="text-xs text-muted-foreground">
                Base Architecture + {selectedDevAddons.length} Modular Upgrades
              </div>
              <button
                onClick={() =>
                  setConfirmModal({
                    open: true,
                    type: "development",
                    title: "Custom Website Architecture & Engineering",
                    estimatedTotal: calculateDevTotal(),
                    items: [
                      BASE_WEBSITE_DEVELOPMENT,
                      ...selectedDevAddons.map((id) => DEVELOPMENT_ADDONS.find((a) => a.id === id)),
                    ].filter(Boolean),
                    description: `Includes base website with ${selectedDevAddons.length} modular upgrades.`,
                  })
                }
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer w-full sm:w-auto justify-center"
              >
                <Code2 className="w-3.5 h-3.5" />
                Request Development ({formatCurrency(calculateDevTotal(), currency)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: BRANDING                                      */}
      {/* ======================================================== */}
      {activeTab === "branding" && (
        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
              Brand Positioning
            </span>
            <h3 className="text-base sm:text-lg font-bold text-foreground">4 Strategic Engagement Tiers</h3>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              From essential startup identity systems to complete enterprise brand bibles and multi-channel style manuals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {BRANDING_TIERS.map((tier) => (
              <div
                key={tier.id}
                className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all shadow-2xs flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-secondary text-muted-foreground font-semibold">
                      Tier {tier.tier}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">{tier.deliveryTime}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-foreground">{tier.name}</h4>
                    <span className="text-lg font-bold font-mono text-foreground block mt-1">
                      {formatCurrency(tier.price, currency)}
                    </span>
                  </div>

                  <ul className="space-y-1.5 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                    {tier.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() =>
                    setConfirmModal({
                      open: true,
                      type: "branding",
                      title: `${tier.name} (Tier ${tier.tier})`,
                      estimatedTotal: tier.price,
                      items: tier.deliverables,
                      description: `Branding tier: ${tier.name}. Timeframe: ${tier.deliveryTime}.`,
                    })
                  }
                  className="w-full py-1.5 bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Palette className="w-3 h-3" />
                  Request Tier {tier.tier}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: PRODUCTION                                    */}
      {/* ======================================================== */}
      {activeTab === "production" && (
        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
              Production Retainers
            </span>
            <h3 className="text-base sm:text-lg font-bold text-foreground">Content & Event Media Coverage</h3>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Studio multi-camera video shoots, vertical social reels, drone cinematography, and event coverage.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {CONTENT_PRODUCTION.map((prod) => (
              <div
                key={prod.id}
                className="p-5 sm:p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all shadow-2xs flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-secondary text-muted-foreground font-semibold">
                    {prod.billingType === "monthly" ? "Monthly Retainer" : "Per Campaign"}
                  </span>

                  <div>
                    <h4 className="text-base font-bold text-foreground">{prod.name}</h4>
                    <span className="text-xl font-bold font-mono text-foreground block mt-1">
                      {formatCurrency(prod.price, currency)}
                      {prod.billingType === "monthly" && (
                        <span className="text-xs text-muted-foreground font-normal ml-1">/ mo</span>
                      )}
                    </span>
                  </div>

                  <ul className="space-y-1.5 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                    {prod.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() =>
                    setConfirmModal({
                      open: true,
                      type: "production",
                      title: prod.name,
                      estimatedTotal: prod.price,
                      items: prod.features,
                      description: `Content production engagement (${prod.billingType}).`,
                    })
                  }
                  className="w-full py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5" />
                  Request Production
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 5: BUILD MYSELF (CUSTOM)                         */}
      {/* ======================================================== */}
      {activeTab === "build_myself" && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
              Tailored Architecture
            </span>
            <h3 className="text-base sm:text-lg font-bold text-foreground">Build Myself — À La Carte</h3>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Select specific capabilities across development, branding, and content, or describe your project requirements directly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select Individual Modules
                </h4>
                <span className="text-xs text-muted-foreground font-mono">
                  {selectedAlcItems.length} selected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {A_LA_CARTE_CATALOG.map((item) => {
                  const isSelected = selectedAlcItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleAlcItem(item.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                        isSelected
                          ? "bg-primary/5 border-primary shadow-2xs"
                          : "bg-card border-border hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono uppercase text-muted-foreground">
                            {item.category}
                          </span>
                          <h5 className="font-semibold text-xs text-foreground">{item.name}</h5>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{item.description}</p>
                        </div>
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-border bg-secondary"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-border/60 text-right text-xs font-mono font-semibold text-foreground">
                        {formatCurrency(item.price, currency)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom brief & submission */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-4 h-fit">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Project Scope Brief
              </h4>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mobile App Redesign"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Describe What You Need
                </label>
                <textarea
                  rows={3}
                  placeholder="Details regarding your goals, deliverables, or specifications..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-lg border border-border bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Urgency Level
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["low", "normal", "high", "urgent"] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUrgency(u)}
                      className={`py-1 text-[10px] uppercase font-semibold rounded-md border transition-colors cursor-pointer ${
                        urgency === u
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary/40 text-muted-foreground border-border hover:bg-secondary"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-border space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Selected Modules ({selectedAlcItems.length})</span>
                  <span className="font-mono">{formatCurrency(calculateAlcTotal(), currency)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t border-border/60">
                  <span>Estimated Total</span>
                  <span className="font-mono">{formatCurrency(calculateAlcTotal(), currency)}</span>
                </div>
              </div>

              <button
                disabled={!customTitle.trim() && selectedAlcItems.length === 0}
                onClick={() =>
                  setConfirmModal({
                    open: true,
                    type: "custom",
                    title: customTitle.trim() || "Custom Tailored Service Suite",
                    estimatedTotal: calculateAlcTotal(),
                    items: selectedAlcItems
                      .map((id) => A_LA_CARTE_CATALOG.find((a) => a.id === id))
                      .filter(Boolean),
                    description: customDescription,
                  })
                }
                className="w-full py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                Submit Custom Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONFIRMATION MODAL                                        */}
      {/* ======================================================== */}
      {confirmModal && confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase text-primary font-bold">
                Confirm Service Request
              </span>
              <h3 className="text-base font-bold text-foreground">{confirmModal.title}</h3>
            </div>

            <div className="p-3 bg-secondary/30 rounded-xl border border-border text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-sans">Type:</span>
                <span className="font-bold text-foreground capitalize font-sans">{confirmModal.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-sans">Estimated Total:</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(confirmModal.estimatedTotal, currency)}
                </span>
              </div>
            </div>

            {currency === "ETB" && confirmModal.type !== "production" && confirmModal.estimatedTotal >= 25000 && <div className="space-y-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-emerald-50/50 p-4">
              <div><p className="text-sm font-bold">Choose how you’d like to pay</p><p className="mt-1 text-xs text-muted-foreground">Request full payment or propose a flexible installment plan. Furii confirms the final terms.</p></div>
              <div className="grid grid-cols-2 gap-2"><button onClick={()=>setConfirmModal({...confirmModal,paymentPlan:false})} className={`rounded-xl border p-3 text-left text-sm font-semibold ${!confirmModal.paymentPlan?"border-primary bg-primary/5":"bg-background"}`}>Pay in full<span className="mt-1 block text-xs font-normal text-muted-foreground">{formatCurrency(confirmModal.estimatedTotal,currency)}</span></button><button onClick={()=>setConfirmModal({...confirmModal,paymentPlan:true,downPayment:confirmModal.downPayment??minimumDown,installmentCount:confirmModal.installmentCount??1})} className={`rounded-xl border p-3 text-left text-sm font-semibold ${confirmModal.paymentPlan?"border-primary bg-primary/5":"bg-background"}`}>Installments<span className="mt-1 block text-xs font-normal text-muted-foreground">40% minimum down · 15k minimum monthly</span></button></div>
              {confirmModal.paymentPlan && <>
                <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-muted-foreground">Initial down payment <span className="font-normal">(minimum {formatCurrency(minimumDown,currency)})</span><input type="number" min={minimumDown} max={confirmModal.estimatedTotal-15000} step="1000" value={selectedDown} onChange={(event)=>{const down=Math.min(Math.max(Number(event.target.value)||minimumDown,minimumDown),confirmModal.estimatedTotal-15000);const max=Math.min(24,Math.floor((confirmModal.estimatedTotal-down)/15000));setConfirmModal({...confirmModal, paymentPlan:true, downPayment:down, installmentCount:Math.min(confirmModal.installmentCount||1,Math.max(max,1))});}} className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm font-semibold text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">Monthly installments<select value={Math.min(selectedInstallments,Math.max(maxInstallments,1))} onChange={(event)=>setConfirmModal({...confirmModal,installmentCount:Number(event.target.value)})} className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm font-semibold text-foreground">{Array.from({length:Math.max(maxInstallments,1)},(_,index)=>index+1).map((count)=><option key={count} value={count}>{count} {count===1?"month":"months"} · {formatCurrency(remainingAfterDown/count,currency)}/mo</option>)}</select></label></div>
                <div className="rounded-xl border bg-background p-4"><div className="mb-3 flex items-center justify-between"><div><p className="text-sm font-bold">Your estimated payment schedule</p><p className="text-[11px] text-muted-foreground">Final due dates begin after the initial payment is verified.</p></div><Receipt className="h-5 w-5 text-primary"/></div><div className="space-y-2 text-sm"><div className="flex justify-between rounded-lg bg-emerald-50 px-3 py-2 text-emerald-950"><span>Initial payment</span><strong className="font-mono">{formatCurrency(selectedDown,currency)}</strong></div>{Array.from({length:selectedInstallments},(_,index)=><div key={index} className="flex justify-between border-b py-2 last:border-0"><span>Month {index+1}</span><strong className="font-mono">{formatCurrency(index===selectedInstallments-1?monthlyLast:monthlyBase,currency)}</strong></div>)}<div className="flex justify-between border-t pt-2 font-bold"><span>Total</span><span className="font-mono">{formatCurrency(confirmModal.estimatedTotal,currency)}</span></div></div></div>
              </>}
            </div>}

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {confirmModal.paymentPlan ? "This sends your proposal to the Furii team for approval. Your installment bills are created only after you accept the approved terms." : "Submitting registers this request with Furii Operations. You can attach a payment receipt directly to initiate kickoff."}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-secondary/40 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isCreating || isSavingPlan || (confirmModal.paymentPlan && (maxInstallments < 1 || selectedInstallments < 1 || selectedInstallments > maxInstallments || selectedDown >= confirmModal.estimatedTotal))}
                onClick={handleConfirmRequest}
                className="px-4 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                {isCreating || isSavingPlan ? "Submitting..." : confirmModal.paymentPlan ? "Send installment proposal" : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUCCESS MODAL                                             */}
      {/* ======================================================== */}
      {successModal && successModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Request Submitted!</h3>
              <p className="text-xs text-muted-foreground">{successModal.title}</p>
              <span className="text-base font-bold font-mono text-foreground block">
                {formatCurrency(successModal.total, currency)}
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => navigate(successModal.paymentPlan ? "/portal/installments" : `/portal/payment?requestId=${successModal.requestId}`)}
                className="w-full py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5" />
                {successModal.paymentPlan ? "View payment plan" : "Attach Receipt & Pay"}
              </button>
              <button
                onClick={() => navigate("/portal/services?tab=requested")}
                className="w-full py-2 bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                View in Requested Tab
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
export default ClientCatalogPage;
