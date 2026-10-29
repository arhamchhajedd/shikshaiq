import { Concept, ConceptId } from "../../types/curriculum";

export const CONCEPTS: Record<ConceptId, Concept> = {
  "fraction-basics": {
    id: "fraction-basics",
    title: "Fraction Basics & Representation",
    shortTitle: "Fraction Basics",
    description: "Understanding numerator, denominator, and fractions as parts of a whole unit.",
    gradeLevel: 7,
    order: 1,
    prerequisites: [],
  },
  "common-multiples": {
    id: "common-multiples",
    title: "Factors & Common Multiples (LCM)",
    shortTitle: "Common Multiples",
    description: "Finding multiples and calculating the Least Common Multiple (LCM) for unlike denominators.",
    gradeLevel: 7,
    order: 2,
    prerequisites: [],
  },
  "equivalent-fractions": {
    id: "equivalent-fractions",
    title: "Equivalent Fractions & Simplification",
    shortTitle: "Equivalent Fractions",
    description: "Multiplying or dividing numerator and denominator by non-zero factors to scale and simplify fractions.",
    gradeLevel: 7,
    order: 3,
    prerequisites: ["fraction-basics"],
  },
  "adding-fractions": {
    id: "adding-fractions",
    title: "Adding Fractions with Like & Unlike Denominators",
    shortTitle: "Adding Fractions",
    description: "Using LCM to find common denominators and computing the exact sum in lowest terms.",
    gradeLevel: 7,
    order: 4,
    prerequisites: ["common-multiples", "equivalent-fractions"],
  },
  "mixed-fractions": {
    id: "mixed-fractions",
    title: "Mixed Numbers & Fraction Word Problems",
    shortTitle: "Mixed Fractions",
    description: "Converting improper fractions to mixed numerals and solving contextual arithmetic problems.",
    gradeLevel: 7,
    order: 5,
    prerequisites: ["adding-fractions"],
  },
};

export const CONCEPTS_LIST: Concept[] = Object.values(CONCEPTS).sort(
  (a, b) => a.order - b.order
);
