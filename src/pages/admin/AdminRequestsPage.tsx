import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useClients } from "@/hooks/useClients";
import { useServiceRequests } from "@/hooks/useServiceRequests";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ServiceRequest, ServiceRequestStatus, ServiceRequestType } from "@/types";
import { toast } from "sonner";
import {
  Sparkles,
  Search,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  FileCheck2,
  Zap,
  Building2,
  AlertTriangle,
  Receipt,
  X,
  Loader2,
  ExternalLink,
  ChevronDown,
  Filter,
  ShieldCheck,
  Calendar,
  Layers,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ReceiptInvoiceModal } from "@/components/shared/ReceiptInvoiceModal";
import type { ReceiptPdfData } from "@/lib/invoicePdfGenerator";
import { downloadContractPdf } from "@/lib/contractPdfGenerator";

export function AdminRequestsPage() {
  const { currency } = useAuth();
  const { clients } = useClients();
  const {
    requests,
    isLoading,
    createRequestAsAdmin,
    isCreatingAsAdmin,
    editRequest,
    isEditingRequest,
    deleteRequest,
    isDeletingRequest,
    wipeClientRequests,
    isWipingClientRequests,
    updateStatus,
    approveAndLaunchProject,
    isApprovingAndLaunching,
  } = useServiceRequests();

  // Filters
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Create Request Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createClientId, setCreateClientId] = useState<string>("");
  const [createType, setCreateType] = useState<ServiceRequestType>("package");
  const [createTitle, setCreateTitle] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createAmount, setCreateAmount] = useState<number>(75000);
  const [createUrgency, setCreateUrgency] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [createStatus, setCreateStatus] = useState<ServiceRequestStatus>("pending");
  const [autoLaunch, setAutoLaunch] = useState(false);

  // Edit Request Modal State
  const [editingReq, setEditingReq] = useState<ServiceRequest | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editStatusVal, setEditStatusVal] = useState<ServiceRequestStatus>("pending");
  const [editNotes, setEditNotes] = useState("");

  // Deletion / Wipe Confirmation States
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [wipeTargetClient, setWipeTargetClient] = useState<{ id: string; name: string } | null>(null);

  // Receipt Modal State
  const [selectedReceiptData, setSelectedReceiptData] = useState<ReceiptPdfData | null>(null);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const handleOpenReceipt = (req: ServiceRequest) => {
    const client = clients.find((c) => c.id === req.client_id) || req.client;
    const receiptNum = `FURII-REC-${req.id.slice(0, 8).toUpperCase()}`;

    let receiptItems = [
      {
        description: req.title,
        category: req.request_type ? `${req.request_type.toUpperCase()} SCOPE` : "Commissioned Service",
        quantity: 1,
        unitPrice: Number(req.estimated_total) || 0,
        total: Number(req.estimated_total) || 0,
      },
    ];

    if (req.catalog_items && Array.isArray(req.catalog_items) && req.catalog_items.length > 0) {
      receiptItems = req.catalog_items.map((catItem: any) => ({
        description: catItem.name || catItem.title || catItem.description || "Scope Deliverable",
        category: catItem.category || req.request_type || "Scope Item",
        quantity: 1,
        unitPrice: Number(catItem.price || catItem.cost || req.estimated_total / req.catalog_items.length),
        total: Number(catItem.price || catItem.cost || req.estimated_total / req.catalog_items.length),
      }));
    }

    const isPaid = req.status === "approved" || req.status === "converted";

    const data: ReceiptPdfData = {
      receiptNumber: receiptNum,
      issueDate: formatDate(req.created_at),
      approvalDate: req.updated_at ? formatDate(req.updated_at) : formatDate(new Date().toISOString()),
      client: {
        name: client?.name || "Client Partner",
        company: client?.company || client?.name || "Client Organization",
        email: client?.email || undefined,
        phone: client?.phone || undefined,
      },
      projectTitle: req.title,
      serviceType: req.request_type,
      description: req.description || "Authorized engagement stream with Furii Operations.",
      items: receiptItems,
      currency: (req.currency as "ETB" | "USD") || "ETB",
      subtotal: Number(req.estimated_total) || 0,
      totalAmount: Number(req.estimated_total) || 0,
      amountPaid: isPaid ? Number(req.estimated_total) || 0 : 0,
      paymentMethod: req.payment_notes?.toLowerCase().includes("telebirr")
        ? "Telebirr Electronic Money"
        : req.payment_notes?.toLowerCase().includes("cbe")
        ? "CBE Birr / Commercial Bank of Ethiopia"
        : "Bank Wire Transfer",
      paymentReference: req.payment_notes || `REQ-${req.id.slice(0, 8).toUpperCase()}`,
      paymentDate: req.payment_submitted_at ? formatDate(req.payment_submitted_at) : formatDate(req.created_at),
      verifiedBy: "Furii Operations & Finance",
    };

    setSelectedReceiptData(data);
    setSelectedReceiptUrl(req.receipt_url || null);
    setIsReceiptModalOpen(true);
  };

  // Quick preset catalog options
  const CATALOG_PRESETS: { title: string; type: ServiceRequestType; price: number }[] = [
    { title: "Real Estate Package", type: "package", price: 120000 },
    { title: "Business Launch Package", type: "package", price: 150000 },
    { title: "Digital Commerce Package", type: "package", price: 200000 },
    { title: "Professional Presence Package", type: "package", price: 125000 },
    { title: "Premium Brand Experience", type: "package", price: 250000 },
    { title: "Base Website Platform", type: "development", price: 75000 },
    { title: "Complete Brand Identity", type: "branding", price: 80000 },
    { title: "Professional Enterprise Retainer", type: "production", price: 45000 },
  ];

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesClient = selectedClientId === "all" || r.client_id === selectedClientId;
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesSearch =
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(search.toLowerCase())) ||
        (r.client?.name && r.client.name.toLowerCase().includes(search.toLowerCase()));

      return matchesClient && matchesStatus && matchesSearch;
    });
  }, [requests, selectedClientId, statusFilter, search]);

  // Metrics
  const totalPipelineValue = useMemo(() => {
    return filteredRequests.reduce((acc, r) => acc + Number(r.estimated_total || 0), 0);
  }, [filteredRequests]);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const paymentReviewCount = requests.filter((r) => r.status === "payment_review").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;

  const handleOpenCreateModal = (presetClientId?: string) => {
    setCreateClientId(presetClientId || (clients[0]?.id ?? ""));
    setCreateType("package");
    setCreateTitle("");
    setCreateDesc("");
    setCreateAmount(75000);
    setCreateUrgency("normal");
    setCreateStatus("pending");
    setAutoLaunch(false);
    setShowCreateModal(true);
  };

  const handleSelectPreset = (preset: typeof CATALOG_PRESETS[0]) => {
    setCreateTitle(preset.title);
    setCreateType(preset.type);
    setCreateAmount(preset.price);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createClientId) {
      toast.error("Please select a target client.");
      return;
    }
    if (!createTitle.trim()) {
      toast.error("Please enter a title for the request.");
      return;
    }

    try {
      await createRequestAsAdmin({
        client_id: createClientId,
        request_type: createType,
        title: createTitle.trim(),
        description: createDesc.trim(),
        estimated_total: Number(createAmount) || 0,
        currency: "ETB",
        urgency: createUrgency,
        status: autoLaunch ? "approved" : createStatus,
        autoLaunch: autoLaunch,
        manager_notes: "Created directly by agency administrator.",
      });

      toast.success(
        autoLaunch
          ? `Created & Approved! Launched into live Ongoing stream for client.`
          : "Service request created successfully."
      );
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create request.");
    }
  };

  const handleOpenEditModal = (req: ServiceRequest) => {
    setEditingReq(req);
    setEditTitle(req.title);
    setEditDesc(req.description || "");
    setEditAmount(Number(req.estimated_total || 0));
    setEditStatusVal(req.status);
    setEditNotes(req.manager_notes || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReq) return;

    try {
      await editRequest({
        id: editingReq.id,
        title: editTitle.trim(),
        description: editDesc.trim(),
        estimated_total: Number(editAmount),
        status: editStatusVal,
        manager_notes: editNotes.trim(),
      });

      toast.success("Request updated successfully.");
      setEditingReq(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update request.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteRequest(deleteTargetId);
      toast.success("Service request deleted successfully.");
      setDeleteTargetId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete request.");
    }
  };

  const handleConfirmWipe = async () => {
    if (!wipeTargetClient) return;
    try {
      await wipeClientRequests(wipeTargetClient.id);
      toast.success(`Wiped all request history for ${wipeTargetClient.name}.`);
      setWipeTargetClient(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to wipe client history.");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <PageHeader
        title="Client Applications & Service Requests"
        description="Comprehensive control over all client catalog requests, payment reviews, history wipe, and manual onboarding."
        action={
          <div className="flex items-center gap-2.5">
            {selectedClientId !== "all" && (
              <button
                onClick={() => {
                  const clientObj = clients.find((c) => c.id === selectedClientId);
                  if (clientObj) setWipeTargetClient({ id: clientObj.id, name: clientObj.name });
                }}
                className="px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Wipe Selected Client History
              </button>
            )}

            <button
              onClick={() => handleOpenCreateModal()}
              className="px-4 py-2 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Create Request for Client
            </button>
          </div>
        }
      />

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-card border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Applications</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">{requests.length}</div>
          <p className="text-[11px] text-muted-foreground">Across all agency clients</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {pendingCount}
          </div>
          <p className="text-[11px] text-muted-foreground">Awaiting initial scope review</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Payment Review</span>
            <Receipt className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
            {paymentReviewCount}
          </div>
          <p className="text-[11px] text-muted-foreground">Receipt attached & pending launch</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Filtered Pipeline Value</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {formatCurrency(totalPipelineValue, currency)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {filteredRequests.length} active records in view
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Client Filter Dropdown */}
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-secondary/40 border border-border rounded-lg text-foreground font-semibold focus:outline-hidden focus:border-primary"
            >
              <option value="all">All Clients ({clients.length})</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search request title, description, or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-secondary/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-secondary/40 p-1 rounded-xl border border-border shrink-0 overflow-x-auto">
            {["all", "pending", "payment_review", "approved", "declined"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition capitalize whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st === "all" ? "All Status" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center bg-card rounded-2xl border border-border shadow-2xs space-y-3">
            <Clock className="w-10 h-10 text-muted-foreground mx-auto opacity-60" />
            <div className="text-base font-bold text-foreground">No Applications Found</div>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              There are no service requests matching your selected filters. Create one directly or clear your filters.
            </p>
            <button
              onClick={() => handleOpenCreateModal()}
              className="px-4 py-2 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              + Create Request for Client
            </button>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isPaymentReview = req.status === "payment_review";
            const isApproved = req.status === "approved";
            const isDeclined = req.status === "declined";

            return (
              <div
                key={req.id}
                className="p-5 rounded-2xl border border-border bg-card shadow-2xs hover:border-border/80 transition-all space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Column: Client & Request Info */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-foreground px-2.5 py-0.5 rounded-md bg-secondary border border-border flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-primary" />
                        {req.client?.name || "Client Application"}
                      </span>

                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-secondary/80 text-muted-foreground font-semibold border border-border">
                        {req.request_type}
                      </span>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isPaymentReview
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                            : isApproved
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : isDeclined
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {req.status.replace("_", " ")}
                      </span>

                      {/* Billing Model Tag */}
                      {req.billing_type === "monthly_retainer" ? (
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          Retainer · {req.billing_cycle_month || "Monthly"}
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold flex items-center gap-1">
                          <Layers className="w-2.5 h-2.5" />
                          One-Time · {req.duration || "Fixed Scope"}
                        </span>
                      )}

                      {req.urgency && req.urgency !== "normal" && (
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold">
                          {req.urgency}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-foreground leading-snug">{req.title}</h3>
                      {req.description && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {req.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Amount & Receipt Preview */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-1 shrink-0 text-right">
                    <span className="text-[10px] uppercase font-mono text-muted-foreground">
                      Requested Investment
                    </span>
                    <span className="text-lg font-bold font-mono text-foreground">
                      {Number(req.estimated_total).toLocaleString()} {req.currency || "ETB"}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Date: {formatDate(req.created_at)}
                    </span>
                  </div>
                </div>

                {/* Attached Receipt Strip (if any) */}
                {req.receipt_url && (
                  <div className="p-3 bg-secondary/30 rounded-xl border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-purple-500/10 text-purple-600">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-foreground">
                          Bank Wire / Payment Slip Attached
                        </div>
                        {req.payment_notes && (
                          <div className="text-[11px] text-muted-foreground">
                            Notes: {req.payment_notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <a
                      href={req.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card border border-border hover:bg-secondary transition shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Inspect Receipt File ↗
                    </a>
                  </div>
                )}

                {/* Contract Acceptance Verification Status */}
                {req.contract_accepted ? (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold">Contract Agreed & Digitally Signed by Client</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const client = clients.find((c) => c.id === req.client_id) || req.client;
                          downloadContractPdf({
                            dealNumber: `DEAL-${req.id.slice(0, 8).toUpperCase()}`,
                            serviceTitle: req.title,
                            client: {
                              name: client?.name || "Client Partner",
                              company: client?.company || client?.name,
                              email: client?.email,
                              phone: client?.phone,
                            },
                            billingType: req.billing_type || "one_time",
                            duration: req.duration,
                            totalAmount: Number(req.estimated_total || 0),
                            currency: (req.currency as any) || "ETB",
                            receiptFileName: req.payment_notes || "Receipt Slip Attached",
                            signedDate: req.contract_accepted_at ? formatDate(req.contract_accepted_at) : formatDate(req.created_at),
                            signerName: client?.name,
                          });
                          toast.success("Downloaded Signed Deal Contract PDF.");
                        }}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download Deal PDF</span>
                      </button>

                      <a
                        href="/contracts/social-media-content-production-retainer-agreement.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border font-bold text-[10px] flex items-center gap-1 shadow-2xs transition-colors"
                        title="Inspect Full Contract Agreement Document (PDF)"
                      >
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        <span>Inspect Full Doc ↗</span>
                      </a>
                      {req.contract_accepted_at && (
                        <span className="text-[10px] font-mono opacity-80">
                          {formatDate(req.contract_accepted_at)}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-secondary/30 border border-border/70 rounded-xl flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>Contract Terms Agreement Pending Signature</span>
                    </div>
                  </div>
                )}

                {/* Bottom Action Toolbar */}
                <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
                  {/* Status Inline Changer */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground">Status:</span>
                    <select
                      value={req.status}
                      onChange={async (e) => {
                        try {
                          await updateStatus({
                            id: req.id,
                            status: e.target.value as ServiceRequestStatus,
                          });
                          toast.success(`Status changed to ${e.target.value.replace("_", " ")}.`);
                        } catch (err: any) {
                          toast.error(err.message);
                        }
                      }}
                      className="px-2.5 py-1 text-xs bg-secondary border border-border rounded-lg text-foreground font-medium focus:outline-hidden focus:border-primary"
                    >
                      <option value="pending">Pending</option>
                      <option value="payment_review">Payment Review</option>
                      <option value="approved">Approved</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>

                  {/* Actions: Edit, Delete, Launch */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(req)}
                      className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition cursor-pointer"
                      title="Edit Request Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteTargetId(req.id)}
                      className="p-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 transition cursor-pointer"
                      title="Delete This Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {!isApproved && (
                      <button
                        disabled={isApprovingAndLaunching}
                        onClick={async () => {
                          try {
                            await approveAndLaunchProject(req);
                            toast.success(
                              `Approved & Launched! Project "${req.title}" is now active in Ongoing stream!`
                            );
                          } catch (err: any) {
                            toast.error(err.message || "Failed to launch project.");
                          }
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        {isApprovingAndLaunching ? "Launching..." : "Approve & Launch Project"}
                      </button>
                    )}

                    {isApproved && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                          ✓ Live in Ongoing Stream
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenReceipt(req)}
                          className="px-3 py-1 bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title="Generate and view official PDF receipt & invoice"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>PDF Receipt</span>
                        </button>
                      </div>
                    )}

                    {!isApproved && (req.receipt_url || req.status === "payment_review") && (
                      <button
                        type="button"
                        onClick={() => handleOpenReceipt(req)}
                        className="px-2.5 py-1 bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        title="Preview generated invoice and payment receipt"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>Preview Invoice</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================== */}
      {/* MODAL 1: CREATE REQUEST FOR CLIENT                         */}
      {/* ========================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-xl rounded-2xl border border-border shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Create Service Request for Client
                </h3>
                <p className="text-xs text-muted-foreground">
                  Proactively submit a catalog package or tailored brief on behalf of any client.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              {/* Client Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Target Client *</label>
                <select
                  value={createClientId}
                  onChange={(e) => setCreateClientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-lg text-foreground font-semibold focus:outline-hidden focus:border-primary"
                  required
                >
                  <option value="" disabled>
                    -- Select Client --
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.industry || "Account"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Quick Catalog Presets:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-secondary/30 rounded-lg border border-border">
                  {CATALOG_PRESETS.map((p) => (
                    <button
                      key={p.title}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`text-[11px] px-2 py-1 rounded-md border transition cursor-pointer ${
                        createTitle === p.title
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground hover:text-foreground border-border"
                      }`}
                    >
                      {p.title} ({p.price.toLocaleString()} ETB)
                    </button>
                  ))}
                </div>
              </div>

              {/* Request Type & Urgency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Service Category</label>
                  <select
                    value={createType}
                    onChange={(e) => setCreateType(e.target.value as ServiceRequestType)}
                    className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary capitalize"
                  >
                    <option value="package">Curated Package</option>
                    <option value="development">Website & App Dev</option>
                    <option value="branding">Brand Identity</option>
                    <option value="production">Content Production</option>
                    <option value="custom">Custom Brief</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Priority / Urgency</label>
                  <select
                    value={createUrgency}
                    onChange={(e) => setCreateUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary capitalize"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Service Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Real Estate Turnkey Bundle"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Description & Deliverable Specifications
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline the scope, included items, or notes for client view..."
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              {/* Amount & Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Estimated Amount (ETB) *</label>
                  <input
                    type="number"
                    value={createAmount}
                    onChange={(e) => setCreateAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Initial Status</label>
                  <select
                    value={createStatus}
                    onChange={(e) => setCreateStatus(e.target.value as ServiceRequestStatus)}
                    disabled={autoLaunch}
                    className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary capitalize disabled:opacity-50"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="payment_review">Under Payment Review</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
              </div>

              {/* Instant Auto-Launch Checkbox */}
              <label className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoLaunch}
                  onChange={(e) => setAutoLaunch(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  Immediately launch as live Ongoing Project in client workspace
                </span>
              </label>

              {/* Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-secondary text-foreground transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAsAdmin}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {isCreatingAsAdmin ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Application"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 2: EDIT SERVICE REQUEST                              */}
      {/* ========================================================== */}
      {editingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Edit Service Request</h3>
                <p className="text-xs text-muted-foreground">
                  Update title, specifications, amount, or administrative notes.
                </p>
              </div>
              <button
                onClick={() => setEditingReq(null)}
                className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Service Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Amount (ETB)</label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Status</label>
                  <select
                    value={editStatusVal}
                    onChange={(e) => setEditStatusVal(e.target.value as ServiceRequestStatus)}
                    className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary capitalize"
                  >
                    <option value="pending">Pending</option>
                    <option value="payment_review">Payment Review</option>
                    <option value="approved">Approved</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Manager Notes</label>
                <input
                  type="text"
                  placeholder="Internal notes or updates for the client..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingReq(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-secondary text-foreground transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditingRequest}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {isEditingRequest ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 3: CONFIRM DELETE SINGLE REQUEST                     */}
      {/* ========================================================== */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Delete Service Request?</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete this service request? This will remove the inquiry, attached payment slip references, and history from the client portal.
            </p>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-secondary text-foreground transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeletingRequest}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isDeletingRequest ? "Deleting..." : "Yes, Delete Request"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 4: CONFIRM WIPE ALL CLIENT HISTORY                   */}
      {/* ========================================================== */}
      {wipeTargetClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-rose-500/30 shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Wipe All Applications for {wipeTargetClient.name}?
                </h3>
                <span className="text-[10px] uppercase font-mono text-rose-500 font-bold">
                  Permanent Irreversible Action
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              This will permanently wipe out <strong className="text-foreground">all service applications, requests, and payment attachment history</strong> for{" "}
              <strong className="text-foreground">{wipeTargetClient.name}</strong>. Their requested tab will be reset to a clean zero state.
            </p>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <button
                onClick={() => setWipeTargetClient(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-secondary text-foreground transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWipe}
                disabled={isWipingClientRequests}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isWipingClientRequests ? "Wiping..." : "Yes, Wipe All History"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Official Receipt & Settled Invoice Modal */}
      <ReceiptInvoiceModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        data={selectedReceiptData}
        originalReceiptUrl={selectedReceiptUrl}
      />
    </div>
  );
}

export default AdminRequestsPage;
