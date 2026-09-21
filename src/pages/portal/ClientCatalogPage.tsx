import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useServiceRequests } from "@/hooks/useServiceRequests";
import {
  CURATED_PACKAGES,
  BASE_WEBSITE_DEVELOPMENT,
  DEVELOPMENT_ADDONS,
  BRANDING_TIERS,
  CONTENT_PRODUCTION,
  A_LA_CARTE_CATALOG,
  CuratedPackage,
  BrandingTier,
  ContentProductionItem,
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
import { toast } from "sonner";

export function ClientCatalogPage() {
  const navigate = useNavigate();
  const { currentClient, currency } = useAuth();
  const { createRequest, isCreating } = useServiceRequests();

  const [activeTab, setActiveTab] = useState<"packages" | "development" | "branding" | "production" | "build_myself">("packages");
  const [expandedPackage, setExpandedPackage] = useState<string | null>("pkg-real-estate");

  // Development Tab State
  const [selectedDevAddons, setSelectedDevAddons] = useState<string[]>(["dev-g-business", "dev-seo"]);

  // Build Myself State
  const [customDescription, setCustomDescription] = useState("");
  const [selectedAlcItems, setSelectedAlcItems] = useState<string[]>([]);
  const [customTitle, setCustomTitle] = useState("");
  const [urgency, setUrgency] = useState<"low" | "normal" | "high" | "urgent">("normal");

  // Request Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    type: "package" | "development" | "branding" | "production" | "custom";
    estimatedTotal: number;
    items: any[];
    description?: string;
  } | null>(null);

  // Success Confirmation State
  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    requestId: string;
    title: string;
    total: number;
  } | null>(null);

  const formatMoney = (amount: number) => {
    return `${amount.toLocaleString()} ${currency || "ETB"}`;
  };

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

  // Handle Submit Request
  const handleConfirmRequest = async () => {
    if (!confirmModal) return;

    try {
      const res = await createRequest({
        request_type: confirmModal.type,
        title: confirmModal.title,
        description: confirmModal.description || "",
        catalog_items: confirmModal.items,
        estimated_total: confirmModal.estimatedTotal,
        currency: currency || "ETB",
        urgency: urgency,
      });

      toast.success("Service request submitted successfully!");
      setConfirmModal(null);
      setSuccessModal({
        open: true,
        requestId: res.id,
        title: confirmModal.title,
        total: confirmModal.estimatedTotal,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit service request");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
      {/* Top Header */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/portal/services")}
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
              title="Return to Services"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                  Official Catalog
                </span>
                <span className="text-xs text-zinc-400">
                  {currentClient?.name || "Client Portal"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                Services & Solutions Directory
              </h1>
            </div>
          </div>

          <button
            onClick={() => navigate("/portal/services")}
            className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 rounded-lg border border-zinc-700/60 transition flex items-center gap-2"
          >
            My Services Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar gap-2 pt-2">
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
                className={`flex items-center gap-2.5 px-4 py-3 border-b-2 text-sm font-medium whitespace-nowrap transition-all ${
                  active
                    ? "border-amber-400 text-amber-300 bg-amber-500/5"
                    : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-amber-400" : "text-zinc-500"}`} />
                {tab.label}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                    active
                      ? "bg-amber-400/20 text-amber-300"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Catalog Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ======================================================== */}
        {/* SECTION 1: PACKAGES                                      */}
        {/* ======================================================== */}
        {activeTab === "packages" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900/50 to-transparent p-6 rounded-2xl border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Curated Turnkey Packages</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Full-Stack Digital Transformation</h2>
              <p className="text-zinc-400 text-sm max-w-2xl mt-1">
                Discounted comprehensive suites bundling web architecture, brand positioning, Google Maps discoverability, and search optimization into one turnkey release.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {CURATED_PACKAGES.map((pkg) => {
                const isExpanded = expandedPackage === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    className="bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl overflow-hidden transition-all shadow-xl"
                  >
                    <div className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-800/60">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="px-2.5 py-1 text-xs font-mono font-bold bg-zinc-800 text-amber-400 rounded-md border border-zinc-700">
                            Package {pkg.number}
                          </span>
                          <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                            Save {formatMoney(pkg.savings)} ({pkg.savingsPercent}% OFF)
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{pkg.name}</h3>
                        <p className="text-zinc-300 text-sm">{pkg.tagline}</p>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 pt-1">
                          <span className="font-semibold text-zinc-300">Core Goal:</span>
                          <span>{pkg.coreGoal}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80">
                        <div>
                          <div className="text-xs text-zinc-500 line-through">
                            Value: {formatMoney(pkg.originalValue)}
                          </div>
                          <div className="text-3xl font-extrabold text-white tracking-tight text-amber-400">
                            {formatMoney(pkg.price)}
                          </div>
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
                            className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm rounded-lg transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                          >
                            <Zap className="w-4 h-4" />
                            Request Package
                          </button>

                          <button
                            onClick={() => setExpandedPackage(isExpanded ? null : pkg.id)}
                            className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition"
                            title={isExpanded ? "Collapse Details" : "Expand Details"}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Included Services Details */}
                    {isExpanded && (
                      <div className="p-6 sm:p-8 bg-zinc-950/40 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div>
                          <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Included Deliverables & Standalone Value
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pkg.includedServices.map((srv, idx) => (
                              <div
                                key={idx}
                                className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 space-y-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <h5 className="font-semibold text-white text-sm">{srv.name}</h5>
                                  <span className="text-xs font-mono text-zinc-400 shrink-0">
                                    {formatMoney(srv.value)}
                                  </span>
                                </div>
                                <ul className="space-y-1.5 text-xs text-zinc-400">
                                  {srv.description.map((line, lIdx) => (
                                    <li key={lIdx} className="flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 mt-1 shrink-0" />
                                      <span>{line}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>

                        {pkg.addons && pkg.addons.length > 0 && (
                          <div className="pt-4 border-t border-zinc-800/60">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                              Optional Package Add-ons
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {pkg.addons.map((add, aIdx) => (
                                <div
                                  key={aIdx}
                                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs flex items-center gap-2 text-zinc-300"
                                >
                                  <span>{add.name}</span>
                                  <span className="text-amber-400 font-semibold font-mono">
                                    +{formatMoney(add.price)}
                                  </span>
                                </div>
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
          <div className="space-y-8">
            <div className="bg-zinc-900/60 p-6 sm:p-8 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                  Base Architectural Platform
                </span>
                <h3 className="text-2xl font-bold text-white">{BASE_WEBSITE_DEVELOPMENT.name}</h3>
                <p className="text-zinc-400 text-sm">
                  Starting foundation for all digital products. High-speed engineering, custom design system, mobile responsiveness, and deployment.
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> 1 Free Admin User Account Included
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" /> Delivery: {BASE_WEBSITE_DEVELOPMENT.deliveryTime}
                  </span>
                </div>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 shrink-0 text-left md:text-right">
                <div className="text-xs text-zinc-500">Base Investment</div>
                <div className="text-2xl font-bold text-white text-blue-400">
                  {formatMoney(BASE_WEBSITE_DEVELOPMENT.price)}
                </div>
              </div>
            </div>

            {/* Modular Add-on Checkbox Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white">Modular Feature Upgrades & Add-ons</h4>
                  <p className="text-xs text-zinc-400">Select capabilities to calculate custom project investment</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500">Configured Total</div>
                  <div className="text-xl font-bold text-amber-400 font-mono">
                    {formatMoney(calculateDevTotal())}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DEVELOPMENT_ADDONS.map((addon) => {
                  const isChecked = selectedDevAddons.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleDevAddon(addon.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                        isChecked
                          ? "bg-amber-500/5 border-amber-500/50 shadow-md shadow-amber-500/5"
                          : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h5 className="font-semibold text-sm text-white">{addon.name}</h5>
                          <p className="text-xs text-zinc-400 line-clamp-2">{addon.description}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition ${
                            isChecked
                              ? "bg-amber-400 border-amber-400 text-zinc-950"
                              : "border-zinc-700 bg-zinc-800"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-500">Module Cost</span>
                        <span className="text-amber-400 font-semibold">+{formatMoney(addon.price)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Request Custom Development Button */}
              <div className="p-6 bg-zinc-900/80 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div>
                  <div className="text-sm font-semibold text-white">Ready with your architecture?</div>
                  <div className="text-xs text-zinc-400">
                    Base Platform + {selectedDevAddons.length} Selected Modular Features
                  </div>
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
                  className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm rounded-lg transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                >
                  <Code2 className="w-4 h-4" />
                  Request Development ({formatMoney(calculateDevTotal())})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 3: BRANDING                                      */}
        {/* ======================================================== */}
        {activeTab === "branding" && (
          <div className="space-y-6">
            <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800">
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">
                Brand Strategy & Identity System
              </span>
              <h3 className="text-2xl font-bold text-white mt-2">4 Strategic Engagement Tiers</h3>
              <p className="text-zinc-400 text-sm max-w-2xl mt-1">
                From essential startup marks to corporate identity systems and multi-channel brand guides.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {BRANDING_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className="bg-zinc-900/60 border border-zinc-800 hover:border-purple-500/50 rounded-2xl p-6 flex flex-col justify-between gap-6 transition shadow-lg"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                        Tier {tier.tier}
                      </span>
                      <span className="text-xs text-purple-400 font-medium">{tier.deliveryTime}</span>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-white">{tier.name}</h4>
                      <div className="text-2xl font-extrabold text-white mt-1 text-purple-300">
                        {formatMoney(tier.price)}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        Key Deliverables:
                      </div>
                      <ul className="space-y-2 text-xs text-zinc-300">
                        {tier.deliverables.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setConfirmModal({
                        open: true,
                        type: "branding",
                        title: `${tier.name} (Tier ${tier.tier})`,
                        estimatedTotal: tier.price,
                        items: tier.deliverables,
                        description: `Branding engagement tier: ${tier.name}. Delivery timeframe: ${tier.deliveryTime}.`,
                      })
                    }
                    className="w-full py-2.5 bg-zinc-800 hover:bg-purple-600 hover:text-white text-zinc-200 font-semibold text-xs rounded-lg transition border border-zinc-700 hover:border-purple-500 flex items-center justify-center gap-1.5"
                  >
                    <Palette className="w-3.5 h-3.5" />
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
          <div className="space-y-6">
            <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800">
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded">
                Audiovisual & Content Retainers
              </span>
              <h3 className="text-2xl font-bold text-white mt-2">Continuous Production & Event Coverage</h3>
              <p className="text-zinc-400 text-sm max-w-2xl mt-1">
                Studio-grade cinema cameras, licensed drone pilots, multi-channel vertical video engines, and event coverage.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {CONTENT_PRODUCTION.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-zinc-900/60 border border-zinc-800 hover:border-rose-500/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6 transition shadow-xl"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-400 rounded">
                        {prod.billingType === "monthly" ? "Monthly Retainer" : "Per Campaign / Event"}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-white">{prod.name}</h4>
                      <div className="text-3xl font-extrabold text-rose-400 mt-1">
                        {formatMoney(prod.price)}
                        {prod.billingType === "monthly" && (
                          <span className="text-xs text-zinc-400 font-normal ml-1">/ month</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-zinc-800/80">
                      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Production Scope:
                      </div>
                      <ul className="space-y-2 text-xs text-zinc-300">
                        {prod.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
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
                    className="w-full py-3 bg-zinc-800 hover:bg-rose-600 hover:text-white text-zinc-200 font-bold text-sm rounded-lg transition border border-zinc-700 hover:border-rose-500 flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    Request Production
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 5: BUILD MYSELF (CUSTOM & À LA CARTE)            */}
        {/* ======================================================== */}
        {activeTab === "build_myself" && (
          <div className="space-y-8">
            <div className="bg-zinc-900/60 p-6 sm:p-8 rounded-2xl border border-zinc-800">
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                Custom Architectural Scope
              </span>
              <h3 className="text-2xl font-bold text-white mt-2">Build Myself — Tailored Scope</h3>
              <p className="text-zinc-400 text-sm max-w-2xl mt-1">
                Combine individual capabilities across development, branding, and content, or describe your unique requirements directly to the Furii engineering team.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: À la Carte Picker */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-amber-400" />
                    Select Individual Modules
                  </h4>
                  <span className="text-xs text-zinc-400">
                    {selectedAlcItems.length} modules selected
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {A_LA_CARTE_CATALOG.map((item) => {
                    const isSelected = selectedAlcItems.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleAlcItem(item.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500/60 shadow-md shadow-amber-500/5"
                            : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-zinc-500">
                              {item.category}
                            </span>
                            <h5 className="font-semibold text-sm text-white">{item.name}</h5>
                            <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                              {item.description}
                            </p>
                          </div>
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? "bg-amber-400 border-amber-400 text-zinc-950"
                                : "border-zinc-700 bg-zinc-800"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-zinc-800/60 text-right text-xs font-mono font-semibold text-amber-400">
                          {formatMoney(item.price)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Custom Description & Summary */}
              <div className="space-y-6">
                <div className="bg-zinc-900/90 p-6 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
                  <h4 className="text-base font-bold text-white">Project Scope Brief</h4>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Project / Requirement Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mobile App Redesign & Brand Expansion"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Describe What You Need
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Tell us about your specific goals, timelines, references, or specialized technical needs..."
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Project Urgency
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["low", "normal", "high", "urgent"] as const).map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setUrgency(u)}
                          className={`py-1.5 text-xs uppercase font-semibold rounded border transition ${
                            urgency === u
                              ? "bg-amber-500/20 text-amber-300 border-amber-500"
                              : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 space-y-2">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Selected Items ({selectedAlcItems.length})</span>
                      <span>{formatMoney(calculateAlcTotal())}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-zinc-800/60">
                      <span>Estimated Total</span>
                      <span className="text-amber-400 font-mono">
                        {formatMoney(calculateAlcTotal())}
                      </span>
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
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold text-sm rounded-lg transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                  >
                    <Wrench className="w-4 h-4" />
                    Submit Custom Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* CONFIRMATION MODAL                                        */}
      {/* ======================================================== */}
      {confirmModal && confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-semibold text-amber-400">Confirm Request</span>
                <h3 className="text-xl font-bold text-white mt-0.5">{confirmModal.title}</h3>
              </div>
              <button
                onClick={() => setConfirmModal(null)}
                className="text-zinc-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-zinc-950/80 p-4 rounded-xl border border-zinc-800/80 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Request Type:</span>
                <span className="font-semibold text-white capitalize">{confirmModal.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Estimated Total:</span>
                <span className="font-bold text-amber-400 font-mono">
                  {formatMoney(confirmModal.estimatedTotal)}
                </span>
              </div>
              {confirmModal.description && (
                <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">Brief: </span>
                  {confirmModal.description}
                </div>
              )}
            </div>

            <p className="text-xs text-zinc-400">
              Submitting creates a formal service request for Furii Operations. You can attach a proof of payment immediately or from your Requested tab.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                disabled={isCreating}
                onClick={handleConfirmRequest}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm rounded-lg transition disabled:opacity-50"
              >
                {isCreating ? "Submitting..." : "Confirm & Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUCCESS MODAL (PROMPT FOR PAYMENT)                       */}
      {/* ======================================================== */}
      {successModal && successModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Request Submitted!</h3>
              <p className="text-sm text-zinc-400">
                "{successModal.title}" is now recorded.
              </p>
              <div className="text-lg font-mono font-bold text-amber-400 pt-1">
                {formatMoney(successModal.total)}
              </div>
            </div>

            <p className="text-xs text-zinc-400 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              To get your project started immediately, you can attach your payment receipt now, or return to your Requested tab anytime.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => navigate(`/portal/payment?requestId=${successModal.requestId}`)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm rounded-lg transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                Attach Receipt & Pay to Get Started
              </button>

              <button
                onClick={() => navigate("/portal/services?tab=requested")}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs rounded-lg transition"
              >
                Go to Requested Services
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ClientCatalogPage;
