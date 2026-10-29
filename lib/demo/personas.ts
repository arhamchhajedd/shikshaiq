import { StudentAnswer } from "../../types/assessment";

export interface DemoPersona {
  id: string;
  name: string;
  grade: string;
  school: string;
  avatarInitials: string;
  tagline: string;
  answers: StudentAnswer[];
}

/**
 * Predefined deterministic answers for Aarav
 * Score: 14/15 correct (misses q_mf_03)
 */
export const AARAV_ANSWERS: StudentAnswer[] = [
  { questionId: "q_fb_01", selectedOptionId: "opt_b" },
  { questionId: "q_fb_02", selectedOptionId: "opt_a" },
  { questionId: "q_fb_03", selectedOptionId: "opt_c" },
  { questionId: "q_cm_01", selectedOptionId: "opt_b" },
  { questionId: "q_cm_02", selectedOptionId: "opt_a" },
  { questionId: "q_cm_03", selectedOptionId: "opt_b" },
  { questionId: "q_ef_01", selectedOptionId: "opt_b" },
  { questionId: "q_ef_02", selectedOptionId: "opt_c" },
  { questionId: "q_ef_03", selectedOptionId: "opt_b" },
  { questionId: "q_af_01", selectedOptionId: "opt_b" },
  { questionId: "q_af_02", selectedOptionId: "opt_b" },
  { questionId: "q_af_03", selectedOptionId: "opt_b" },
  { questionId: "q_mf_01", selectedOptionId: "opt_b" },
  { questionId: "q_mf_02", selectedOptionId: "opt_b" },
  { questionId: "q_mf_03", selectedOptionId: "opt_b" }, // Incorrect
];

/**
 * Predefined deterministic answers for Diya
 * Score: 10/15 correct (developing concept fluency across later fractions)
 */
export const DIYA_ANSWERS: StudentAnswer[] = [
  { questionId: "q_fb_01", selectedOptionId: "opt_b" },
  { questionId: "q_fb_02", selectedOptionId: "opt_a" },
  { questionId: "q_fb_03", selectedOptionId: "opt_c" },
  { questionId: "q_cm_01", selectedOptionId: "opt_b" },
  { questionId: "q_cm_02", selectedOptionId: "opt_a" },
  { questionId: "q_cm_03", selectedOptionId: "opt_a" }, // Incorrect (opt_b)
  { questionId: "q_ef_01", selectedOptionId: "opt_b" },
  { questionId: "q_ef_02", selectedOptionId: "opt_a" }, // Incorrect (opt_c)
  { questionId: "q_ef_03", selectedOptionId: "opt_b" },
  { questionId: "q_af_01", selectedOptionId: "opt_b" },
  { questionId: "q_af_02", selectedOptionId: "opt_a" }, // Incorrect (opt_b)
  { questionId: "q_af_03", selectedOptionId: "opt_b" },
  { questionId: "q_mf_01", selectedOptionId: "opt_b" },
  { questionId: "q_mf_02", selectedOptionId: "opt_a" }, // Incorrect (opt_b)
  { questionId: "q_mf_03", selectedOptionId: "opt_c" }, // Incorrect (opt_a)
];

/**
 * Predefined deterministic answers for Rohan
 * Score: 6/15 correct (mastered fraction-basics, but blocked by common-multiples / LCM gap)
 */
export const ROHAN_ANSWERS: StudentAnswer[] = [
  { questionId: "q_fb_01", selectedOptionId: "opt_b" }, // Correct
  { questionId: "q_fb_02", selectedOptionId: "opt_a" }, // Correct
  { questionId: "q_fb_03", selectedOptionId: "opt_c" }, // Correct (3/3)
  { questionId: "q_cm_01", selectedOptionId: "opt_c" }, // Incorrect (opt_b)
  { questionId: "q_cm_02", selectedOptionId: "opt_c" }, // Incorrect (opt_a)
  { questionId: "q_cm_03", selectedOptionId: "opt_a" }, // Incorrect (opt_b) (0/3)
  { questionId: "q_ef_01", selectedOptionId: "opt_b" }, // Correct
  { questionId: "q_ef_02", selectedOptionId: "opt_b" }, // Incorrect (opt_c)
  { questionId: "q_ef_03", selectedOptionId: "opt_a" }, // Incorrect (opt_b) (1/3)
  { questionId: "q_af_01", selectedOptionId: "opt_a" }, // Incorrect (opt_b)
  { questionId: "q_af_02", selectedOptionId: "opt_a" }, // Incorrect (opt_b)
  { questionId: "q_af_03", selectedOptionId: "opt_b" }, // Correct (1/3)
  { questionId: "q_mf_01", selectedOptionId: "opt_b" }, // Correct
  { questionId: "q_mf_02", selectedOptionId: "opt_a" }, // Incorrect (opt_b)
  { questionId: "q_mf_03", selectedOptionId: "opt_b" }, // Incorrect (opt_a) (1/3)
];

export const DEMO_PERSONAS: Record<string, DemoPersona> = {
  rohan: {
    id: "rohan",
    name: "Rohan Sharma",
    grade: "Class 7-B",
    school: "Kendriya Vidyalaya, New Delhi",
    avatarInitials: "RS",
    tagline: "Foundational Gap in Common Multiples (LCM)",
    answers: ROHAN_ANSWERS,
  },
  diya: {
    id: "diya",
    name: "Diya Patel",
    grade: "Class 7-B",
    school: "Kendriya Vidyalaya, New Delhi",
    avatarInitials: "DP",
    tagline: "Developing Concept Fluency",
    answers: DIYA_ANSWERS,
  },
  aarav: {
    id: "aarav",
    name: "Aarav Gupta",
    grade: "Class 7-B",
    school: "Kendriya Vidyalaya, New Delhi",
    avatarInitials: "AG",
    tagline: "Advanced Ready for Enrichment",
    answers: AARAV_ANSWERS,
  },
};
