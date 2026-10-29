import { ConceptId } from "@/types/curriculum";
import { AdaptiveGraphNode } from "./types";
import { CONCEPTS } from "@/lib/curriculum/concepts";

export class ConceptGraphError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConceptGraphError";
  }
}

/**
 * Validates a concept graph:
 * 1. Checks that all prerequisite references exist within the graph.
 * 2. Checks that there are no self-loops.
 * 3. Checks that the graph is an acyclic Directed Acyclic Graph (DAG) with no cycles.
 */
export function validateConceptGraph(nodes: AdaptiveGraphNode[]): void {
  const nodeMap = new Map<ConceptId, AdaptiveGraphNode>();
  for (const node of nodes) {
    if (nodeMap.has(node.id)) {
      throw new ConceptGraphError(`Duplicate concept ID in graph: '${node.id}'`);
    }
    nodeMap.set(node.id, node);
  }

  // 1. Check prerequisite existence & self-loops
  for (const node of nodes) {
    for (const prereqId of node.prerequisites) {
      if (prereqId === node.id) {
        throw new ConceptGraphError(
          `Self-loop detected: Concept '${node.id}' lists itself as a prerequisite.`
        );
      }
      if (!nodeMap.has(prereqId)) {
        throw new ConceptGraphError(
          `Unknown prerequisite '${prereqId}' referenced by concept '${node.id}'.`
        );
      }
    }
  }

  // 2. Detect cycles using depth-first search (DFS) with 3-color marking
  // 0: unvisited, 1: visiting (in current recursion stack), 2: fully visited
  const visited = new Map<ConceptId, number>();
  for (const node of nodes) {
    visited.set(node.id, 0);
  }

  function dfs(currentId: ConceptId, path: ConceptId[]): void {
    visited.set(currentId, 1);
    const node = nodeMap.get(currentId)!;

    for (const prereqId of node.prerequisites) {
      const state = visited.get(prereqId);
      if (state === 1) {
        const cycleStr = [...path, currentId, prereqId].join(" -> ");
        throw new ConceptGraphError(`Cycle detected in concept graph: ${cycleStr}`);
      }
      if (state === 0) {
        dfs(prereqId, [...path, currentId]);
      }
    }

    visited.set(currentId, 2);
  }

  for (const node of nodes) {
    if (visited.get(node.id) === 0) {
      dfs(node.id, []);
    }
  }
}

/**
 * Returns all transitive prerequisites for a concept in topological (root-first) order.
 */
export function getTransitivePrerequisites(
  conceptId: ConceptId,
  nodeMap: Map<ConceptId, AdaptiveGraphNode>
): ConceptId[] {
  if (!nodeMap.has(conceptId)) {
    throw new ConceptGraphError(`Concept '${conceptId}' does not exist in graph.`);
  }

  const result: ConceptId[] = [];
  const visited = new Set<ConceptId>();

  function collect(currentId: ConceptId) {
    const node = nodeMap.get(currentId);
    if (!node) return;

    for (const prereqId of node.prerequisites) {
      if (!visited.has(prereqId)) {
        visited.add(prereqId);
        collect(prereqId);
        result.push(prereqId);
      }
    }
  }

  collect(conceptId);
  return result;
}

/**
 * Returns standard default graph nodes for Class 7 Mathematics Fractions.
 */
export function getDefaultGraphNodes(): AdaptiveGraphNode[] {
  return [
    {
      id: "fraction-basics",
      title: CONCEPTS["fraction-basics"].title,
      shortTitle: CONCEPTS["fraction-basics"].shortTitle,
      description: CONCEPTS["fraction-basics"].description,
      gradeLevel: 7,
      order: 1,
      prerequisites: [],
    },
    {
      id: "common-multiples",
      title: CONCEPTS["common-multiples"].title,
      shortTitle: CONCEPTS["common-multiples"].shortTitle,
      description: CONCEPTS["common-multiples"].description,
      gradeLevel: 7,
      order: 2,
      prerequisites: [],
    },
    {
      id: "equivalent-fractions",
      title: CONCEPTS["equivalent-fractions"].title,
      shortTitle: CONCEPTS["equivalent-fractions"].shortTitle,
      description: CONCEPTS["equivalent-fractions"].description,
      gradeLevel: 7,
      order: 3,
      prerequisites: ["fraction-basics"],
    },
    {
      id: "adding-fractions",
      title: CONCEPTS["adding-fractions"].title,
      shortTitle: CONCEPTS["adding-fractions"].shortTitle,
      description: CONCEPTS["adding-fractions"].description,
      gradeLevel: 7,
      order: 4,
      prerequisites: ["common-multiples", "equivalent-fractions"],
    },
    {
      id: "mixed-fractions",
      title: CONCEPTS["mixed-fractions"].title,
      shortTitle: CONCEPTS["mixed-fractions"].shortTitle,
      description: CONCEPTS["mixed-fractions"].description,
      gradeLevel: 7,
      order: 5,
      prerequisites: ["adding-fractions"],
    },
  ];
}
