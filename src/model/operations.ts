import { generateId } from './defaults';
import type {
  DiagramNode,
  InsertionTarget,
  SwitchCase,
  SwitchNode,
} from './types';

function insertIntoArray<T>(items: readonly T[], index: number, item: T): T[] {
  const clamped = Math.max(0, Math.min(index, items.length));
  return [...items.slice(0, clamped), item, ...items.slice(clamped)];
}

function mapChildBranches(
  node: DiagramNode,
  mapper: (branch: DiagramNode[]) => DiagramNode[]
): DiagramNode {
  switch (node.type) {
    case 'sequence':
    case 'subroutine':
      return node;
    case 'if': {
      const thenBranch = mapper(node.thenBranch);
      const elseBranch = mapper(node.elseBranch);
      if (thenBranch === node.thenBranch && elseBranch === node.elseBranch) {
        return node;
      }
      return { ...node, thenBranch, elseBranch };
    }
    case 'switch': {
      let casesChanged = false;
      const cases = node.cases.map((c) => {
        const body = mapper(c.body);
        if (body !== c.body) {
          casesChanged = true;
          return { ...c, body };
        }
        return c;
      });
      const defaultBranch = mapper(node.defaultBranch);
      if (!casesChanged && defaultBranch === node.defaultBranch) {
        return node;
      }
      return { ...node, cases, defaultBranch };
    }
    case 'while':
    case 'doWhile':
    case 'for': {
      const body = mapper(node.body);
      if (body === node.body) {
        return node;
      }
      return { ...node, body };
    }
  }
}

function getChildBranches(node: DiagramNode): DiagramNode[][] {
  switch (node.type) {
    case 'sequence':
    case 'subroutine':
      return [];
    case 'if':
      return [node.thenBranch, node.elseBranch];
    case 'switch':
      return [...node.cases.map((c) => c.body), node.defaultBranch];
    case 'while':
    case 'doWhile':
    case 'for':
      return [node.body];
  }
}

/**
 * Recursively finds a node by its ID in a DiagramNode tree.
 */
export function findNodeById(nodes: readonly DiagramNode[], id: string): DiagramNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    for (const branch of getChildBranches(node)) {
      const found = findNodeById(branch, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function insertIntoNodeBranch(
  node: DiagramNode,
  branchKey: InsertionTarget['branchKey'],
  index: number,
  newNode: DiagramNode
): DiagramNode {
  switch (node.type) {
    case 'sequence':
    case 'subroutine':
      return node;
    case 'if':
      if (branchKey === 'then') {
        return { ...node, thenBranch: insertIntoArray(node.thenBranch, index, newNode) };
      }
      if (branchKey === 'else') {
        return { ...node, elseBranch: insertIntoArray(node.elseBranch, index, newNode) };
      }
      return node;
    case 'switch':
      if (branchKey === 'default') {
        return { ...node, defaultBranch: insertIntoArray(node.defaultBranch, index, newNode) };
      }
      if (branchKey) {
        const idx = node.cases.findIndex((c) => c.id === branchKey);
        if (idx !== -1) {
          const updatedCases = node.cases.map((c, i) =>
            i === idx ? { ...c, body: insertIntoArray(c.body, index, newNode) } : c
          );
          return { ...node, cases: updatedCases };
        }
      }
      return node;
    case 'while':
    case 'doWhile':
    case 'for':
      if (branchKey === undefined || branchKey === 'body') {
        return { ...node, body: insertIntoArray(node.body, index, newNode) };
      }
      return node;
  }
}

/**
 * Immutably inserts a new node at the specified InsertionTarget (without diagramId).
 */
export function insertNodeAt(
  nodes: readonly DiagramNode[],
  target: Omit<InsertionTarget, 'diagramId'>,
  newNode: DiagramNode
): DiagramNode[] {
  if (target.parentId === null) {
    return insertIntoArray(nodes, target.index, newNode);
  }

  let changed = false;
  const result = nodes.map((node) => {
    if (node.id === target.parentId) {
      const updated = insertIntoNodeBranch(node, target.branchKey, target.index, newNode);
      if (updated !== node) {
        changed = true;
      }
      return updated;
    }
    const updated = mapChildBranches(node, (branch) =>
      insertNodeAt(branch, target, newNode)
    );
    if (updated !== node) {
      changed = true;
    }
    return updated;
  });

  return changed ? result : (nodes as DiagramNode[]);
}

/**
 * Immutably removes a node by ID and returns both the updated tree and the removed node.
 */
export function removeNodeById(
  nodes: readonly DiagramNode[],
  id: string
): { nodes: DiagramNode[]; removed: DiagramNode | null } {
  let removed: DiagramNode | null = null;
  const nextNodes: DiagramNode[] = [];

  for (const node of nodes) {
    if (node.id === id) {
      removed = node;
      continue;
    }

    if (removed === null) {
      const updated = mapChildBranches(node, (branch) => {
        if (removed !== null) {
          return branch;
        }
        const sub = removeNodeById(branch, id);
        if (sub.removed !== null) {
          removed = sub.removed;
          return sub.nodes;
        }
        return branch;
      });
      nextNodes.push(updated);
    } else {
      nextNodes.push(node);
    }
  }

  return {
    nodes: removed !== null ? nextNodes : (nodes as DiagramNode[]),
    removed,
  };
}

/**
 * Immutably updates the node matching `id` using `updater`.
 */
export function updateNodeById(
  nodes: readonly DiagramNode[],
  id: string,
  updater: (node: DiagramNode) => DiagramNode
): DiagramNode[] {
  let changed = false;
  const result = nodes.map((node) => {
    if (node.id === id) {
      const updated = updater(node);
      if (updated !== node) {
        changed = true;
      }
      return updated;
    }
    const updated = mapChildBranches(node, (branch) => updateNodeById(branch, id, updater));
    if (updated !== node) {
      changed = true;
    }
    return updated;
  });

  return changed ? result : (nodes as DiagramNode[]);
}

function moveNodeInList(
  nodes: readonly DiagramNode[],
  id: string,
  direction: -1 | 1
): DiagramNode[] {
  const index = nodes.findIndex((n) => n.id === id);
  if (index !== -1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= nodes.length) {
      return nodes as DiagramNode[];
    }
    const copy = [...nodes];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    return copy;
  }

  let changed = false;
  const result = nodes.map((node) => {
    const updated = mapChildBranches(node, (branch) => moveNodeInList(branch, id, direction));
    if (updated !== node) {
      changed = true;
    }
    return updated;
  });

  return changed ? result : (nodes as DiagramNode[]);
}

/**
 * Moves a node one position earlier within its containing list.
 */
export function moveNodeUp(nodes: readonly DiagramNode[], id: string): DiagramNode[] {
  return moveNodeInList(nodes, id, -1);
}

/**
 * Moves a node one position later within its containing list.
 */
export function moveNodeDown(nodes: readonly DiagramNode[], id: string): DiagramNode[] {
  return moveNodeInList(nodes, id, 1);
}

/**
 * Deep-clones a node and all of its descendants (including switch case IDs) with fresh IDs.
 */
export function cloneNodeWithNewIds<T extends DiagramNode>(node: T): T {
  const newId = generateId();
  const clonedStyle = node.style ? { ...node.style } : undefined;

  switch (node.type) {
    case 'sequence':
    case 'subroutine':
      return {
        ...node,
        id: newId,
        ...(clonedStyle ? { style: clonedStyle } : {}),
      };
    case 'if':
      return {
        ...node,
        id: newId,
        ...(clonedStyle ? { style: clonedStyle } : {}),
        thenBranch: node.thenBranch.map((child) => cloneNodeWithNewIds(child)),
        elseBranch: node.elseBranch.map((child) => cloneNodeWithNewIds(child)),
      };
    case 'switch':
      return {
        ...node,
        id: newId,
        ...(clonedStyle ? { style: clonedStyle } : {}),
        cases: node.cases.map((c) => ({
          ...c,
          id: generateId(),
          body: c.body.map((child) => cloneNodeWithNewIds(child)),
        })),
        defaultBranch: node.defaultBranch.map((child) => cloneNodeWithNewIds(child)),
      };
    case 'while':
    case 'doWhile':
    case 'for':
      return {
        ...node,
        id: newId,
        ...(clonedStyle ? { style: clonedStyle } : {}),
        body: node.body.map((child) => cloneNodeWithNewIds(child)),
      };
  }
}

/**
 * Appends a new case branch to a SwitchNode.
 */
export function addSwitchCase(node: SwitchNode, label?: string): SwitchNode {
  const newCase: SwitchCase = {
    id: generateId(),
    label: label ?? `Fall ${node.cases.length + 1}`,
    body: [],
  };
  return {
    ...node,
    cases: [...node.cases, newCase],
  };
}

/**
 * Removes a case branch by caseId from a SwitchNode.
 */
export function removeSwitchCase(node: SwitchNode, caseId: string): SwitchNode {
  return {
    ...node,
    cases: node.cases.filter((c) => c.id !== caseId),
  };
}

/**
 * Toggles the default branch visibility/presence on a SwitchNode.
 */
export function toggleSwitchDefault(node: SwitchNode): SwitchNode {
  return {
    ...node,
    hasDefault: !node.hasDefault,
  };
}
