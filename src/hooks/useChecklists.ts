import { useState, useEffect, useCallback } from "react";
import type { ChecklistCategory, ChecklistItem } from "@/types/checklist";
import { toast } from "sonner";

const STORAGE_KEY_CATEGORIES = "furii_checklist_categories_v2";
const STORAGE_KEY_ITEMS = "furii_checklist_items_v2";

const DEFAULT_CATEGORIES: ChecklistCategory[] = [
  {
    id: "cat-engineering",
    name: "Platform & Engineering Standards",
    description: "Core software engineering, database modeling, and deployment checkpoints.",
    color: "blue",
    order_index: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-branding",
    name: "Brand Identity & Design System",
    description: "Visual identity, vector mark guidelines, and brand asset suite verification.",
    color: "purple",
    order_index: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-production",
    name: "Content & Film Production",
    description: "Pre-production briefs, cinematography capture, and master grading.",
    color: "amber",
    order_index: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-qa",
    name: "QA & Client Sign-Off Verification",
    description: "Cross-device responsiveness, performance benchmarks, and formal sign-offs.",
    color: "emerald",
    order_index: 4,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_ITEMS: ChecklistItem[] = [
  // Engineering
  {
    id: "item-eng-1",
    category_id: "cat-engineering",
    title: "Scope & Technical Architecture Alignment",
    description: "Confirmation of technical dependencies, hosting stack, and API boundaries.",
    is_completed: true,
    order_index: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "item-eng-2",
    category_id: "cat-engineering",
    title: "Database Modeling & Supabase RLS Policies",
    description: "Entity schemas, tenant client isolation, and authenticated access rules.",
    is_completed: true,
    order_index: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "item-eng-3",
    category_id: "cat-engineering",
    title: "Core Feature Execution & State Management",
    description: "Component scaffolding, data hooks, and interactive UI integration.",
    is_completed: false,
    order_index: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: "item-eng-4",
    category_id: "cat-engineering",
    title: "Production Deployment & CDN Caching",
    description: "Live custom domain routing, SSL certificate provisioning, and caching.",
    is_completed: false,
    order_index: 4,
    created_at: new Date().toISOString(),
  },

  // Branding
  {
    id: "item-brand-1",
    category_id: "cat-branding",
    title: "Brand Archetype & Positioning Alignment",
    description: "Client brand voice, target demographic, and industry competitive positioning.",
    is_completed: true,
    order_index: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "item-brand-2",
    category_id: "cat-branding",
    title: "High-DPI Vector Logo Suite Export",
    description: "Transparent horizontal, stacked, and icon marks with anti-aliased contours.",
    is_completed: true,
    order_index: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "item-brand-3",
    category_id: "cat-branding",
    title: "Typography Hierarchy & Design Token Sheet",
    description: "Font pairings, KaTeX math rendering, and accessible contrast palettes.",
    is_completed: false,
    order_index: 3,
    created_at: new Date().toISOString(),
  },

  // Production
  {
    id: "item-prod-1",
    category_id: "cat-production",
    title: "Shoot Schedule & Variant Shot Planning",
    description: "Storyboard confirmation, on-location shot lists (3-6 days on demand).",
    is_completed: true,
    order_index: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "item-prod-2",
    category_id: "cat-production",
    title: "Post-Production Edit & Audio Normalization",
    description: "4K color grading, sound design, and master ProRes delivery export.",
    is_completed: false,
    order_index: 2,
    created_at: new Date().toISOString(),
  },

  // QA
  {
    id: "item-qa-1",
    category_id: "cat-qa",
    title: "Cross-Device & Viewport Responsiveness",
    description: "Testing layouts on mobile (390px), tablet (768px), and high-DPI desktop.",
    is_completed: true,
    order_index: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: "item-qa-2",
    category_id: "cat-qa",
    title: "Lighthouse Performance & Security Audit",
    description: "Load time optimizations, zero console runtime exceptions, and clean builds.",
    is_completed: false,
    order_index: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: "item-qa-3",
    category_id: "cat-qa",
    title: "Client Stakeholder Sign-Off Handover",
    description: "Review queue delivery, approval verification, and asset vault upload.",
    is_completed: false,
    order_index: 3,
    created_at: new Date().toISOString(),
  },
];

export function useChecklists() {
  const [categories, setCategories] = useState<ChecklistCategory[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to load stored categories:", e);
    }
    return DEFAULT_CATEGORIES;
  });

  const [items, setItems] = useState<ChecklistItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to load stored items:", e);
    }
    return DEFAULT_ITEMS;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error("Failed to persist categories:", e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to persist checklist items:", e);
    }
  }, [items]);

  // -------------------------------------------------------------
  // Category Operations
  // -------------------------------------------------------------
  const createCategory = useCallback(
    (name: string, description?: string, color: string = "blue") => {
      const newCategory: ChecklistCategory = {
        id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: name.trim(),
        description: description?.trim() || "",
        color,
        order_index: categories.length + 1,
        created_at: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, newCategory]);
      toast.success(`Checklist category "${name}" created.`);
      return newCategory;
    },
    [categories.length]
  );

  const updateCategory = useCallback(
    (id: string, updates: Partial<Omit<ChecklistCategory, "id" | "created_at">>) => {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
      toast.success("Category updated.");
    },
    []
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      // Also delete items belonging to this category
      setItems((prev) => prev.filter((i) => i.category_id !== id));
      toast.success("Category and its checklist items deleted.");
    },
    []
  );

  // -------------------------------------------------------------
  // Checklist Item Operations
  // -------------------------------------------------------------
  const createItem = useCallback(
    (categoryId: string, title: string, description?: string) => {
      const categoryItems = items.filter((i) => i.category_id === categoryId);
      const newItem: ChecklistItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        category_id: categoryId,
        title: title.trim(),
        description: description?.trim() || "",
        is_completed: false,
        order_index: categoryItems.length + 1,
        created_at: new Date().toISOString(),
      };
      setItems((prev) => [...prev, newItem]);
      toast.success(`Checklist item added.`);
      return newItem;
    },
    [items]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<Omit<ChecklistItem, "id" | "created_at">>) => {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
      );
      toast.success("Checklist item updated.");
    },
    []
  );

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Checklist item removed.");
  }, []);

  const toggleItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_completed: !i.is_completed } : i))
    );
  }, []);

  const resetToDefaults = useCallback(() => {
    setCategories(DEFAULT_CATEGORIES);
    setItems(DEFAULT_ITEMS);
    toast.success("Reset to standard agency checklist templates.");
  }, []);

  return {
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
  };
}
