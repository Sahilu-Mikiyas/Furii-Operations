// Tree manipulation utilities for 5-level hierarchical tasks (Daily & Weekly)

export const MAX_TASK_DEPTH = 5;

export interface HierarchicalTask {
  id: string;
  label: string;
  done: boolean;
  parent_id?: string | undefined;
  [key: string]: any;
}

export interface TaskTreeNode<T extends HierarchicalTask = HierarchicalTask> {
  item: T;
  depth: number; // 1 to 5
  children: TaskTreeNode<T>[];
}

export interface FlattenedTaskNode<T extends HierarchicalTask = HierarchicalTask> {
  item: T;
  depth: number; // 1 to 5
  hasChildren: boolean;
  isExpanded: boolean;
  subtaskCount: number;
  completedSubtasks: number;
  descendantIds: string[];
}

/**
 * Calculates the depth of a task (1-indexed). Root items have depth = 1.
 */
export function getTaskDepth<T extends HierarchicalTask>(
  taskId: string,
  taskMap: Map<string, T>
): number {
  let depth = 1;
  let current = taskMap.get(taskId);
  const visited = new Set<string>();

  while (current && current.parent_id && depth < MAX_TASK_DEPTH + 1) {
    if (visited.has(current.id)) break; // cycle protection
    visited.add(current.id);
    const parent = taskMap.get(current.parent_id);
    if (!parent) break;
    depth += 1;
    current = parent;
  }

  return Math.min(depth, MAX_TASK_DEPTH);
}

/**
 * Returns all descendant IDs (children, grandchildren, etc.) of a given task ID.
 */
export function getDescendantIds<T extends HierarchicalTask>(
  parentId: string,
  allTasks: T[]
): string[] {
  const descendants: string[] = [];
  const children = allTasks.filter((t) => t.parent_id === parentId);

  for (const child of children) {
    descendants.push(child.id);
    descendants.push(...getDescendantIds(child.id, allTasks));
  }

  return descendants;
}

/**
 * Calculates the max subtree depth beneath a given task.
 * A task with no children has subtree depth = 1.
 */
export function getSubtreeDepth<T extends HierarchicalTask>(
  taskId: string,
  allTasks: T[]
): number {
  const children = allTasks.filter((t) => t.parent_id === taskId);
  if (children.length === 0) return 1;

  let maxChildDepth = 0;
  for (const child of children) {
    const d = getSubtreeDepth(child.id, allTasks);
    if (d > maxChildDepth) maxChildDepth = d;
  }

  return 1 + maxChildDepth;
}

/**
 * Builds a hierarchical tree from a flat list of tasks.
 * Preserves the order of root tasks and child tasks.
 */
export function buildTaskTree<T extends HierarchicalTask>(items: T[]): TaskTreeNode<T>[] {
  const taskMap = new Map<string, T>(items.map((t) => [t.id, t]));
  const childrenMap = new Map<string, T[]>();

  const rootItems: T[] = [];

  for (const item of items) {
    if (item.parent_id && taskMap.has(item.parent_id)) {
      const list = childrenMap.get(item.parent_id) || [];
      list.push(item);
      childrenMap.set(item.parent_id, list);
    } else {
      rootItems.push(item);
    }
  }

  function buildNode(item: T, currentDepth: number): TaskTreeNode<T> {
    const rawChildren = childrenMap.get(item.id) || [];
    const safeDepth = Math.min(currentDepth, MAX_TASK_DEPTH);
    const childrenNodes = safeDepth < MAX_TASK_DEPTH
      ? rawChildren.map((c) => buildNode(c, safeDepth + 1))
      : [];

    return {
      item,
      depth: safeDepth,
      children: childrenNodes,
    };
  }

  return rootItems.map((root) => buildNode(root, 1));
}

/**
 * Flattens a task tree into a flat array suitable for sequential list rendering,
 * respecting expanded/collapsed state and calculating subtask counts.
 */
export function flattenTaskTree<T extends HierarchicalTask>(
  tree: TaskTreeNode<T>[],
  expandedIds: Set<string>,
  allTasks: T[]
): FlattenedTaskNode<T>[] {
  const result: FlattenedTaskNode<T>[] = [];

  function traverse(node: TaskTreeNode<T>) {
    const descendantIds = getDescendantIds(node.item.id, allTasks);
    const directChildren = node.children.map((c) => c.item);
    const subtaskCount = directChildren.length;
    const completedSubtasks = directChildren.filter((c) => c.done).length;
    const isExpanded = expandedIds.has(node.item.id);

    result.push({
      item: node.item,
      depth: node.depth,
      hasChildren: node.children.length > 0,
      isExpanded,
      subtaskCount,
      completedSubtasks,
      descendantIds,
    });

    if (isExpanded && node.children.length > 0) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  for (const root of tree) {
    traverse(root);
  }

  return result;
}

export interface EligibleParentOption {
  id: string;
  label: string;
  depth: number;
}

/**
 * Computes all eligible parent tasks that a given target task can be nested under.
 * Rules:
 * 1. Cannot be the task itself.
 * 2. Cannot be any of the task's own descendants (avoids circular loops).
 * 3. Potential parent's depth + target task's subtree depth must not exceed MAX_TASK_DEPTH (5).
 */
export function getEligibleParents<T extends HierarchicalTask>(
  targetTask: T,
  allTasks: T[]
): EligibleParentOption[] {
  const taskMap = new Map<string, T>(allTasks.map((t) => [t.id, t]));
  const forbiddenIds = new Set<string>([targetTask.id, ...getDescendantIds(targetTask.id, allTasks)]);
  const targetSubtreeDepth = getSubtreeDepth(targetTask.id, allTasks);

  const eligible: EligibleParentOption[] = [];

  for (const task of allTasks) {
    if (forbiddenIds.has(task.id)) continue;

    const parentDepth = getTaskDepth(task.id, taskMap);
    // Can only attach if parentDepth + targetSubtreeDepth <= MAX_TASK_DEPTH
    const canAttach = parentDepth + targetSubtreeDepth <= MAX_TASK_DEPTH;

    if (canAttach) {
      eligible.push({
        id: task.id,
        label: task.label,
        depth: parentDepth,
      });
    }
  }

  // Sort by visual hierarchy order
  const flatOrder = flattenTaskTree(buildTaskTree(allTasks), new Set(allTasks.map((t) => t.id)), allTasks);
  const orderMap = new Map(flatOrder.map((f, idx) => [f.item.id, idx]));

  return eligible.sort((a, b) => {
    const ordA = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
    const ordB = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
    return ordA - ordB;
  });
}
