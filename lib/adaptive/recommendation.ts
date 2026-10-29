import { ConceptId } from "@/types/curriculum";
import { ADAPTIVE_CONFIG } from "./config";
import {
  AdaptiveGraphNode,
  AdaptiveRecommendation,
  ConceptMasteryRecord,
  PrerequisiteFinding,
} from "./types";
import { getTransitivePrerequisites, getDefaultGraphNodes } from "./graph";

interface RecommendNextActionOptions {
  masteries: Record<ConceptId, ConceptMasteryRecord> | ConceptMasteryRecord[];
  graphNodes?: AdaptiveGraphNode[];
  currentTargetConceptId?: ConceptId;
}

/**
 * Deterministic Adaptive Recommendation Engine.
 *
 * Traverses the prerequisite DAG to identify root knowledge gaps, validates evidence counts,
 * and outputs explainable next-action recommendations.
 */
export function recommendNextAction(
  optionsOrMasteries:
    | RecommendNextActionOptions
    | Record<ConceptId, ConceptMasteryRecord>
    | ConceptMasteryRecord[],
  maybeConcepts?: AdaptiveGraphNode[] | unknown[],
  maybeTargetId?: ConceptId
): AdaptiveRecommendation {
  let masteries: Record<ConceptId, ConceptMasteryRecord> | ConceptMasteryRecord[];
  let graphNodes: AdaptiveGraphNode[] | undefined;
  let currentTargetConceptId: ConceptId | undefined;

  if (
    optionsOrMasteries &&
    typeof optionsOrMasteries === "object" &&
    "masteries" in optionsOrMasteries
  ) {
    const opts = optionsOrMasteries as RecommendNextActionOptions;
    masteries = opts.masteries;
    graphNodes = opts.graphNodes;
    currentTargetConceptId = opts.currentTargetConceptId;
  } else {
    masteries = optionsOrMasteries as Record<ConceptId, ConceptMasteryRecord> | ConceptMasteryRecord[];
    if (Array.isArray(maybeConcepts) && maybeConcepts.length > 0 && "prerequisites" in (maybeConcepts[0] as object)) {
      graphNodes = maybeConcepts as AdaptiveGraphNode[];
    }
    currentTargetConceptId = maybeTargetId;
  }

  const nodes = graphNodes || getDefaultGraphNodes();
  const nodeMap = new Map<ConceptId, AdaptiveGraphNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  // Convert masteries to record lookup
  const masteryMap = new Map<ConceptId, ConceptMasteryRecord>();
  if (Array.isArray(masteries)) {
    for (const m of masteries) {
      masteryMap.set(m.conceptId, m);
    }
  } else if (masteries) {
    for (const [key, value] of Object.entries(masteries)) {
      masteryMap.set(key as ConceptId, value);
    }
  }

  // Determine current target concept if not explicitly provided
  let targetId: ConceptId = currentTargetConceptId || nodes[0].id;
  if (!currentTargetConceptId) {
    // Pick first unmastered concept in topological/curriculum order
    for (const node of nodes) {
      const rec = masteryMap.get(node.id);
      if (!rec || rec.status !== "mastered") {
        targetId = node.id;
        break;
      }
    }
  }

  const targetNode = nodeMap.get(targetId) || nodes[0];
  const targetMastery = masteryMap.get(targetId) || {
    conceptId: targetId,
    masteryScore: null,
    status: "not_started",
    validEvidenceCount: 0,
  };

  // Inspect prerequisites
  const prereqIds = getTransitivePrerequisites(targetId, nodeMap);
  const findings: PrerequisiteFinding[] = [];
  const weakPrereqs: { id: ConceptId; record: ConceptMasteryRecord; node: AdaptiveGraphNode }[] = [];

  for (const pId of prereqIds) {
    const pNode = nodeMap.get(pId);
    if (!pNode) continue;

    const pMastery = masteryMap.get(pId) || {
      conceptId: pId,
      masteryScore: null,
      status: "not_started",
      validEvidenceCount: 0,
    };

    const isWeak = pMastery.status === "needs_revision" || pMastery.status === "partial" || pMastery.status === "not_started";
    const isBlocker = isWeak;

    let message = `${pNode.shortTitle} is mastered (${pMastery.masteryScore ?? 100}%).`;
    if (pMastery.status === "not_started") {
      message = `${pNode.shortTitle} has not been assessed yet.`;
    } else if (pMastery.status === "needs_revision") {
      message = `${pNode.shortTitle} needs revision (${pMastery.masteryScore ?? 0}%). This blocks downstream calculations.`;
    } else if (pMastery.status === "partial") {
      message = `${pNode.shortTitle} is partially understood (${pMastery.masteryScore ?? 0}%).`;
    }

    findings.push({
      prerequisiteId: pId,
      status: pMastery.status,
      masteryScore: pMastery.masteryScore,
      evidenceCount: pMastery.validEvidenceCount,
      isBlocker,
      message,
    });

    if (isWeak) {
      weakPrereqs.push({ id: pId, record: pMastery, node: pNode });
    }
  }

  const timestamp = new Date().toISOString();

  // CASE 1: Prerequisite Gap Exists -> Prefer unmet prerequisite (root gap first)
  if (weakPrereqs.length > 0) {
    // Deterministic tie-breaker:
    // 1. Concept order (root concepts with lower order first, e.g. fraction-basics before adding-fractions)
    // 2. Lowest mastery score
    // 3. Lowest evidence count
    weakPrereqs.sort((a, b) => {
      if (a.node.order !== b.node.order) return a.node.order - b.node.order;
      const scoreA = a.record.masteryScore ?? 0;
      const scoreB = b.record.masteryScore ?? 0;
      if (scoreA !== scoreB) return scoreA - scoreB;
      return a.record.validEvidenceCount - b.record.validEvidenceCount;
    });

    const blocker = weakPrereqs[0];
    const blockerName = blocker.node.shortTitle;
    const targetName = targetNode.shortTitle;

    let reason = `Mastering ${targetName} requires strong foundational understanding of ${blockerName}. We recommend addressing this prerequisite gap first.`;
    if (blocker.record.status === "needs_revision") {
      reason = `${blockerName} is an active bottleneck (${blocker.record.masteryScore ?? 0}% accuracy) preventing fluency in ${targetName}. Practice ${blockerName} fundamentals first.`;
    } else if (blocker.record.status === "not_started") {
      reason = `Before proceeding to ${targetName}, complete the initial diagnostic for ${blockerName} to verify prerequisite readiness.`;
    }

    return {
      targetConceptId: targetId,
      masteryScore: targetMastery.masteryScore,
      masteryStatus: targetMastery.status,
      recommendationType: "prerequisite_remediation",
      recommendedConceptId: blocker.id,
      reason,
      evidenceCount: targetMastery.validEvidenceCount,
      prerequisiteFindings: findings,
      timestamp,
    };
  }

  // CASE 2: Prerequisites are satisfied, but target concept is incomplete
  if (targetMastery.status !== "mastered") {
    let reason = `Your prerequisite foundations are secure. Practice ${targetNode.shortTitle} to reach full concept mastery.`;
    if (targetMastery.status === "not_started") {
      reason = `All prerequisites for ${targetNode.shortTitle} are mastered! Begin practice exercises to establish your skill.`;
    } else if (targetMastery.status === "needs_revision") {
      reason = `Your prerequisites are solid, but ${targetNode.shortTitle} needs revision (${targetMastery.masteryScore ?? 0}%). Targeted practice will build your confidence.`;
    } else if (targetMastery.validEvidenceCount < ADAPTIVE_CONFIG.MIN_EVIDENCE_FOR_MASTERY) {
      reason = `You scored well on ${targetNode.shortTitle}, but more evidence is required to verify full mastery. Complete one more practice round.`;
    }

    return {
      targetConceptId: targetId,
      masteryScore: targetMastery.masteryScore,
      masteryStatus: targetMastery.status,
      recommendationType: "guided_practice",
      recommendedConceptId: targetId,
      reason,
      evidenceCount: targetMastery.validEvidenceCount,
      prerequisiteFindings: findings,
      timestamp,
    };
  }

  // CASE 3: Target concept is already mastered -> Advance to next unmastered concept
  const nextUnmastered = nodes.find((n) => {
    const m = masteryMap.get(n.id);
    return !m || m.status !== "mastered";
  });

  if (nextUnmastered) {
    return {
      targetConceptId: targetId,
      masteryScore: targetMastery.masteryScore,
      masteryStatus: "mastered",
      recommendationType: "advancement",
      recommendedConceptId: nextUnmastered.id,
      reason: `Congratulations! You have mastered ${targetNode.shortTitle}. Advance to ${nextUnmastered.shortTitle} for your next challenge.`,
      evidenceCount: targetMastery.validEvidenceCount,
      prerequisiteFindings: findings,
      timestamp,
    };
  }

  // CASE 4: Entire curriculum mastered!
  return {
    targetConceptId: targetId,
    masteryScore: targetMastery.masteryScore,
    masteryStatus: "mastered",
    recommendationType: "curriculum_complete",
    recommendedConceptId: targetId,
    reason: "Outstanding achievement! You have demonstrated high mastery across all Class 7 Fractions concepts.",
    evidenceCount: targetMastery.validEvidenceCount,
    prerequisiteFindings: findings,
    timestamp,
  };
}
