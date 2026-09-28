import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useChecklists } from "@/hooks/useChecklists";
import type { ChecklistCategory, ChecklistItem } from "@/types/checklist";
import { toast } from "sonner";
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit3,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
  FolderPlus,
  ListTodo,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AdminChecklistsPage() {
  const {
    categories,
    items,
    createCategory,
    updateCategory,
    deleteCategory,
    createItem,
    updateItem,
    deleteItem,
    toggleItem,
    resetToDefaults,
  } = useChecklists();

  // Active Category selection tab
  const [selectedCatId, setSelectedCatId] = useState<string>("all");

  // Category Modal State (Create or Edit)
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ChecklistCategory | null>(null);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catColor, setCatColor] = useState("blue");

  // Item Modal State (Create or Edit)
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [itemCatId, setItemCatId] = useState<string>("");
  const [itemTitle, setItemTitle] = useState("");
  const [itemDesc, setItemDesc] = useState("");

  // Delete Confirmations
  const [deleteCatTarget, setDeleteCatTarget] = useState<ChecklistCategory | null>(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState<ChecklistItem | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Category color options
  const COLOR_OPTIONS = [
    { label: "Blue", value: "blue", class: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    { label: "Purple", value: "purple", class: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
    { label: "Amber", value: "amber", class: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    { label: "Emerald", value: "emerald", class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    { label: "Rose", value: "rose", class: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
  ];

  const getColorClass = (colorVal?: string) => {
    const match = COLOR_OPTIONS.find((c) => c.value === colorVal);
    return match ? match.class : "bg-primary/10 text-primary border-primary/20";
  };

  // Open Category Create
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCatName("");
    setCatDesc("");
    setCatColor("blue");
    setCatModalOpen(true);
  };

  // Open Category Edit
  const handleOpenEditCategory = (cat: ChecklistCategory) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || "");
    setCatColor(cat.color || "blue");
    setCatModalOpen(true);
  };

  // Submit Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: catName.trim(),
        description: catDesc.trim(),
        color: catColor,
      });
    } else {
      createCategory(catName.trim(), catDesc.trim(), catColor);
    }
    setCatModalOpen(false);
  };

  // Open Item Create
  const handleOpenCreateItem = (targetCatId: string) => {
    setEditingItem(null);
    setItemCatId(targetCatId);
    setItemTitle("");
    setItemDesc("");
    setItemModalOpen(true);
  };

  // Open Item Edit
  const handleOpenEditItem = (item: ChecklistItem) => {
    setEditingItem(item);
    setItemCatId(item.category_id);
    setItemTitle(item.title);
    setItemDesc(item.description || "");
    setItemModalOpen(true);
  };

  // Submit Item
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim() || !itemCatId) return;

    if (editingItem) {
      updateItem(editingItem.id, {
        title: itemTitle.trim(),
        description: itemDesc.trim(),
      });
    } else {
      createItem(itemCatId, itemTitle.trim(), itemDesc.trim());
    }
    setItemModalOpen(false);
  };

  const filteredCategories = useMemo(() => {
    if (selectedCatId === "all") return categories;
    return categories.filter((c) => c.id === selectedCatId);
  }, [categories, selectedCatId]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <PageHeader
        title="Checklists & Execution Categories"
        description="Create, edit, organize, and delete quality checklist categories and execution steps used across client deliverables."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-card border border-border rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Reset templates to agency defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Standards
            </button>

            <button
              onClick={handleOpenCreateCategory}
              className="px-4 py-2 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              + New Category
            </button>
          </div>
        }
      />

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-card border border-border rounded-2xl shadow-2xs">
        <button
          onClick={() => setSelectedCatId("all")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer shrink-0 ${
            selectedCatId === "all"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          All Categories ({categories.length})
        </button>

        {categories.map((c) => {
          const count = items.filter((i) => i.category_id === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCatId(c.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                selectedCatId === c.id
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <span>{c.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-secondary/80 text-foreground font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Matrices */}
      <div className="space-y-6">
        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center bg-card rounded-2xl border border-border shadow-2xs space-y-3">
            <Layers className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
            <h3 className="text-base font-bold text-foreground">No Categories Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You haven't created any checklist categories yet or filtered them out.
            </p>
            <button
              onClick={handleOpenCreateCategory}
              className="px-4 py-2 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Create First Category
            </button>
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const catItems = items.filter((i) => i.category_id === cat.id);
            const completedCount = catItems.filter((i) => i.is_completed).length;

            return (
              <div
                key={cat.id}
                className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden"
              >
                {/* Category Header Row */}
                <div className="p-5 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/20">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${getColorClass(
                          cat.color
                        )}`}
                      >
                        Category
                      </span>
                      <h3 className="text-base font-bold text-foreground">{cat.name}</h3>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground">{cat.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground mr-1 hidden sm:inline-block">
                      {completedCount} of {catItems.length} active
                    </span>

                    <button
                      onClick={() => handleOpenCreateItem(cat.id)}
                      className="px-2.5 py-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Step
                    </button>

                    <button
                      onClick={() => handleOpenEditCategory(cat)}
                      className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition cursor-pointer"
                      title="Edit Category Name & Style"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteCatTarget(cat)}
                      className="p-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Items in Category */}
                <div className="p-4 sm:p-5 space-y-2.5">
                  {catItems.length === 0 ? (
                    <div className="p-6 text-center bg-secondary/15 rounded-xl border border-dashed border-border space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground">
                        No checklist items in this category yet.
                      </p>
                      <button
                        onClick={() => handleOpenCreateItem(cat.id)}
                        className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add first checklist step
                      </button>
                    </div>
                  ) : (
                    catItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 transition-colors ${
                          item.is_completed
                            ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60"
                            : "bg-secondary/10 border-border/80"
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => toggleItem(item.id)}
                            className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold transition cursor-pointer ${
                              item.is_completed
                                ? "bg-emerald-600 text-white"
                                : "border border-border text-muted-foreground bg-card hover:border-primary"
                            }`}
                            title="Toggle Checklist Step"
                          >
                            {item.is_completed ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                          </button>

                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div
                              className={`font-semibold ${
                                item.is_completed ? "text-foreground" : "text-foreground"
                              }`}
                            >
                              {item.title}
                            </div>
                            {item.description && (
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEditItem(item)}
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                            title="Edit Step"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteItemTarget(item)}
                            className="p-1 rounded-md text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                            title="Delete Step"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================== */}
      {/* MODAL 1: CREATE / EDIT CATEGORY                            */}
      {/* ========================================================== */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                {editingCategory ? "Edit Category" : "New Checklist Category"}
              </h3>
              <button onClick={() => setCatModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Mobile App Quality Assurance"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe the scope of checks in this category..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Accent Theme Color</label>
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCatColor(c.value)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition capitalize cursor-pointer ${
                        catColor === c.value
                          ? "ring-2 ring-primary ring-offset-2 " + c.class
                          : c.class + " opacity-60"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  {editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 2: CREATE / EDIT CHECKLIST ITEM                      */}
      {/* ========================================================== */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                {editingItem ? "Edit Checklist Step" : "Add Checklist Step"}
              </h3>
              <button onClick={() => setItemModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Step Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Cross-Browser Safari/Chrome Testing"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Specification & Description</label>
                <textarea
                  rows={3}
                  placeholder="Explain requirements, quality threshold, or verification instructions..."
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  {editingItem ? "Save Changes" : "Add Step"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 3: CONFIRM DELETE CATEGORY                           */}
      {/* ========================================================== */}
      {deleteCatTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-sm rounded-2xl border border-rose-500/30 shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-2.5 text-rose-600">
              <Trash2 className="w-5 h-5" />
              <h4 className="text-base font-bold text-foreground">Delete Category?</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete <strong className="text-foreground">"{deleteCatTarget.name}"</strong> and all checklist items within it?
            </p>
            <div className="pt-2 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setDeleteCatTarget(null)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteCategory(deleteCatTarget.id);
                  setDeleteCatTarget(null);
                }}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                Delete Category
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 4: CONFIRM DELETE ITEM                               */}
      {/* ========================================================== */}
      {deleteItemTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-2xl p-5 space-y-3"
          >
            <div className="flex items-center gap-2 text-rose-600">
              <Trash2 className="w-5 h-5" />
              <h4 className="text-sm font-bold text-foreground">Remove Checklist Step?</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to remove <strong className="text-foreground">"{deleteItemTarget.title}"</strong>?
            </p>
            <div className="pt-2 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setDeleteItemTarget(null)}
                className="px-3 py-1 text-xs font-semibold rounded-lg border border-border hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteItem(deleteItemTarget.id);
                  setDeleteItemTarget(null);
                }}
                className="px-3.5 py-1 text-xs font-bold rounded-lg bg-rose-600 text-white cursor-pointer"
              >
                Delete Step
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 5: CONFIRM RESET DEFAULTS                            */}
      {/* ========================================================== */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-2xl p-5 space-y-3"
          >
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="text-sm font-bold text-foreground">Reset Standard Templates?</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              This will restore standard Furii agency checklist categories and steps (Platform Engineering, Branding, Production, and QA).
            </p>
            <div className="pt-2 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1 text-xs font-semibold rounded-lg border border-border hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToDefaults();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-1 text-xs font-bold rounded-lg bg-primary text-primary-foreground cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AdminChecklistsPage;
