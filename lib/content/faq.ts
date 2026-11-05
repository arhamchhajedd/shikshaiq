import { ADAPTIVE_CONFIG } from "../adaptive/config";
import { CONCEPTS_LIST } from "../curriculum/concepts";
import { ALL_QUESTIONS, DIAGNOSTIC_QUESTIONS } from "../curriculum/questions";

/** A single question/answer pair rendered on `/faq` and in FAQPage JSON-LD. */
export interface FaqItem {
  /** Stable fragment id so answers can be deep-linked and cited. */
  id: string;
  question: string;
  /** Plain-text answer. Kept self-contained so AI engines can quote it verbatim. */
  answer: string;
}

/** A themed group of FAQ items. */
export interface FaqCategory {
  id: string;
  title: string;
  items: readonly FaqItem[];
}

const toPercent = (ratio: number): string => `${Math.round(ratio * 100)}%`;

const MASTERY_PERCENT = toPercent(ADAPTIVE_CONFIG.MASTERY_THRESHOLD);
const PARTIAL_PERCENT = toPercent(ADAPTIVE_CONFIG.PARTIAL_THRESHOLD);
const CONCEPT_COUNT = CONCEPTS_LIST.length;
const CONCEPT_NAMES = CONCEPTS_LIST.map((concept) => concept.shortTitle).join(", ");

/**
 * Factual FAQ content. Every number is derived from the live engine
 * configuration or curriculum data, so the answers cannot drift from the
 * product's real behaviour. Do not add claims (pricing, partnerships,
 * outcomes) that the product cannot substantiate.
 */
export const FAQ_CATEGORIES: readonly FaqCategory[] = [
  {
    id: "product",
    title: "About ShikshaIQ",
    items: [
      {
        id: "what-is-shikshaiq",
        question: "What is ShikshaIQ?",
        answer: `ShikshaIQ is an adaptive learning platform for Indian school students. It runs a short diagnostic assessment, identifies the exact prerequisite concept a student is missing, and then recommends a personalised path of lessons and practice. The current release covers NCERT Class 7 Mathematics — Fractions, organised into ${CONCEPT_COUNT} linked concepts: ${CONCEPT_NAMES}.`,
      },
      {
        id: "which-classes",
        question: "Which classes and subjects does ShikshaIQ cover?",
        answer:
          "The platform is designed for Classes 6 to 10. The first released module is Class 7 Mathematics — Fractions, aligned with the NCERT and CBSE syllabus. Further chapters and classes are planned but not yet available.",
      },
      {
        id: "who-is-it-for",
        question: "Who is ShikshaIQ for?",
        answer:
          "Students use it to find and close their learning gaps. Teachers use it to see which concepts block their whole class and which students need help. School administrators approve teacher accounts and oversee classrooms.",
      },
    ],
  },
  {
    id: "adaptive-learning",
    title: "Diagnostic & Adaptive Learning",
    items: [
      {
        id: "how-diagnostic-works",
        question: "How does the ShikshaIQ diagnostic assessment work?",
        answer: `The diagnostic has ${DIAGNOSTIC_QUESTIONS.length} multiple-choice questions spread evenly across the ${CONCEPT_COUNT} Fractions concepts, sampled from a bank of ${ALL_QUESTIONS.length} NCERT-aligned questions. Answers are checked on the server against protected answer keys, so the result cannot be manipulated from the browser.`,
      },
      {
        id: "how-mastery-is-calculated",
        question: "How does ShikshaIQ decide whether a student has mastered a concept?",
        answer: `Mastery is calculated by fixed, transparent rules — not by AI. A concept is "Mastered" at ${MASTERY_PERCENT} accuracy or higher with at least ${ADAPTIVE_CONFIG.MIN_EVIDENCE_FOR_MASTERY} answered questions, "Partial" from ${PARTIAL_PERCENT} up to ${MASTERY_PERCENT}, and "Needs revision" below ${PARTIAL_PERCENT}. The same answers always produce the same result.`,
      },
      {
        id: "what-is-prerequisite-gap",
        question: "What is a prerequisite gap?",
        answer:
          "A prerequisite gap is an earlier concept a student has not yet mastered that blocks a later one. For example, adding fractions with unlike denominators needs both equivalent fractions and LCM. If a student struggles with adding fractions because of weak LCM skills, ShikshaIQ sends them to LCM first instead of repeating the harder topic.",
      },
      {
        id: "concept-order",
        question: "In what order should Class 7 fractions concepts be learned?",
        answer:
          "Fraction Basics and Common Multiples (LCM) come first and can be learned in either order. Equivalent Fractions builds on Fraction Basics. Adding Fractions needs both LCM and Equivalent Fractions. Mixed Fractions and word problems come last because they depend on Adding Fractions.",
      },
    ],
  },
  {
    id: "ai-tutor",
    title: "Socratic AI Tutor",
    items: [
      {
        id: "does-ai-grade",
        question: "Does the AI grade students or decide their mastery?",
        answer:
          "No. Grading and mastery are computed only by ShikshaIQ's deterministic server-side engine. The AI tutor can explain and give hints, but it cannot change scores, mastery levels or the recommended learning path.",
      },
      {
        id: "what-ai-tutor-does",
        question: "What does the Socratic AI tutor do?",
        answer:
          "The tutor guides students with step-by-step questions and hints instead of giving away final answers. It uses everyday Indian examples such as sharing rotis or cricket scores, and it can reply in English, Hindi or Marathi.",
      },
      {
        id: "ai-tutor-limits",
        question: "Are there limits on the AI tutor?",
        answer:
          "Yes. Each student's tutor requests are rate-limited and message length is capped to keep usage safe and fair. The tutor runs only on the server, never sees answer keys, and pauses honestly when the device is offline.",
      },
    ],
  },
  {
    id: "teachers",
    title: "For Teachers & Schools",
    items: [
      {
        id: "teacher-features",
        question: "What can teachers do in ShikshaIQ?",
        answer:
          "Teachers create classrooms with a join code, see a class-wide mastery matrix for every concept, get explainable insights such as shared prerequisite bottlenecks, inspect individual students' attempts, and assign a specific lesson or practice activity to a student.",
      },
      {
        id: "teacher-approval",
        question: "Why does a teacher account need approval?",
        answer:
          "Teachers can see student learning data, so new teacher accounts stay pending until a school administrator approves them. Students can start immediately after signing up. Administrator accounts cannot be created through public sign-up.",
      },
    ],
  },
  {
    id: "access-privacy",
    title: "Offline Access & Privacy",
    items: [
      {
        id: "works-offline",
        question: "Does ShikshaIQ work offline?",
        answer:
          "Yes. Students can save lessons and practice questions to their device and keep practising without internet. Offline answers are clearly marked as pending and are checked by the server when the device reconnects, without double counting.",
      },
      {
        id: "student-privacy",
        question: "How does ShikshaIQ protect student data?",
        answer:
          "ShikshaIQ collects only what learning requires, uses no third-party trackers or advertising, and enforces database row-level security so students see only their own data and teachers see only their own classrooms. Student personal details are not sent to the AI model.",
      },
      {
        id: "devices",
        question: "Which devices can use ShikshaIQ?",
        answer:
          "Any modern web browser on a phone, tablet, laptop or desktop. It can also be installed to the home screen as a progressive web app.",
      },
    ],
  },
];

/** All FAQ items in display order, flattened for structured data. */
export const FAQ_ITEMS: readonly FaqItem[] = FAQ_CATEGORIES.flatMap(
  (category) => category.items
);

