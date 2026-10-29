if (typeof window !== "undefined") {
  throw new Error(
    "Security violation: ANSWER_KEYS is a server-only module and must never be imported into client code."
  );
}

import { PrivateAnswerKey } from "../../types/curriculum";

/**
 * Server-only answer key dictionary.
 * NEVER import this file into Client Components.
 */
export const ANSWER_KEYS: Record<string, PrivateAnswerKey> = {
  // Concept 1: Fraction Basics
  q_fb_01: {
    questionId: "q_fb_01",
    correctAnswerId: "opt_b",
    explanation:
      "In any fraction a/b, the denominator 'b' represents the total number of equal parts into which the whole object is divided, while the numerator 'a' tells how many parts are counted.",
  },
  q_fb_02: {
    questionId: "q_fb_02",
    correctAnswerId: "opt_a",
    explanation:
      "The whole roti is cut into 6 equal parts (denominator = 6). Rohit eats 4 of them (numerator = 4). Hence, the fraction is 4/6 (which equals 2/3 in simplest form).",
  },
  q_fb_03: {
    questionId: "q_fb_03",
    correctAnswerId: "opt_c",
    explanation:
      "A proper fraction has a numerator strictly less than its denominator. Since 3 < 5, 3/5 is a proper fraction. (7/4, 9/9, and 11/8 are improper fractions).",
  },

  // Concept 2: Common Multiples
  q_cm_01: {
    questionId: "q_cm_01",
    correctAnswerId: "opt_b",
    explanation:
      "Multiples of 4 are 4, 8, 12, 16... Multiples of 6 are 6, 12, 18... The smallest shared multiple is 12.",
  },
  q_cm_02: {
    questionId: "q_cm_02",
    correctAnswerId: "opt_a",
    explanation:
      "12 is divisible by 3 (12/3 = 4), 4 (12/4 = 3), and 6 (12/6 = 2). It is the smallest integer divisible by all three numbers.",
  },
  q_cm_03: {
    questionId: "q_cm_03",
    correctAnswerId: "opt_b",
    explanation:
      "5 and 7 are prime and coprime numbers (they share no common factors other than 1). When numbers are coprime, their LCM is their direct product: 5 × 7 = 35.",
  },

  // Concept 3: Equivalent Fractions
  q_ef_01: {
    questionId: "q_ef_01",
    correctAnswerId: "opt_b",
    explanation:
      "Multiplying both numerator and denominator of 3/4 by 3 yields (3 × 3) / (4 × 3) = 9/12. Both represent the exact same value.",
  },
  q_ef_02: {
    questionId: "q_ef_02",
    correctAnswerId: "opt_c",
    explanation:
      "The Highest Common Factor (HCF) of 18 and 24 is 6. Dividing numerator and denominator by 6 gives (18 ÷ 6) / (24 ÷ 6) = 3/4.",
  },
  q_ef_03: {
    questionId: "q_ef_03",
    correctAnswerId: "opt_b",
    explanation:
      "To reach denominator 20 from 5, we multiply by 4. Scaling the numerator by the same factor gives 2 × 4 = 8. Thus, 2/5 = 8/20.",
  },

  // Concept 4: Adding Fractions
  q_af_01: {
    questionId: "q_af_01",
    correctAnswerId: "opt_b",
    explanation:
      "With like denominators, keep the denominator 7 and simply add the numerators: 3 + 2 = 5. Result: 5/7.",
  },
  q_af_02: {
    questionId: "q_af_02",
    correctAnswerId: "opt_b",
    explanation:
      "The LCM of 4 and 3 is 12. Convert each: 1/4 = 3/12 and 2/3 = 8/12. Adding them gives 3/12 + 8/12 = 11/12.",
  },
  q_af_03: {
    questionId: "q_af_03",
    correctAnswerId: "opt_b",
    explanation:
      "The LCM of 6 and 8 is 24. Scaling: 5/6 = 20/24 and 3/8 = 9/24. Sum: (20 + 9) / 24 = 29/24.",
  },

  // Concept 5: Mixed Fractions
  q_mf_01: {
    questionId: "q_mf_01",
    correctAnswerId: "opt_b",
    explanation:
      "Dividing 11 by 4 gives a quotient of 2 with a remainder of 3. Written as a mixed fraction, this is 2 3/4.",
  },
  q_mf_02: {
    questionId: "q_mf_02",
    correctAnswerId: "opt_b",
    explanation:
      "Sum the whole numbers first: 1 + 2 = 3. Next, add the fractions using common denominator 6: 1/2 + 1/3 = 3/6 + 2/6 = 5/6. Total: 3 5/6.",
  },
  q_mf_03: {
    questionId: "q_mf_03",
    correctAnswerId: "opt_a",
    explanation:
      "1 3/4 + 1 1/2 = 1 3/4 + 1 2/4 = 2 5/4. Since 5/4 = 1 1/4, the total is 2 + 1 1/4 = 3 1/4 hours.",
  },

  // --- Additional Practice Questions (Phase 04) ---
  q_fb_04: {
    questionId: "q_fb_04",
    correctAnswerId: "opt_a",
    explanation:
      "The whole pizza had 12 equal slices. Since 3 slices were eaten, 12 - 3 = 9 slices remain. The fraction of pizza left uneaten is 9/12 (which reduces to 3/4).",
  },
  q_fb_05: {
    questionId: "q_fb_05",
    correctAnswerId: "opt_b",
    explanation:
      "When a unit distance from 0 to 1 is divided into 5 equal parts, each mark represents 1/5, 2/5, 3/5, 4/5, and 5/5 (1). The 4th mark from 0 represents exactly 4/5.",
  },
  q_cm_04: {
    questionId: "q_cm_04",
    correctAnswerId: "opt_a",
    explanation:
      "Multiples of 8: 8, 16, 24, 32... Multiples of 12: 12, 24, 36... The lowest common multiple shared by both numbers is 24.",
  },
  q_cm_05: {
    questionId: "q_cm_05",
    correctAnswerId: "opt_b",
    explanation:
      "The next simultaneous green light occurs at the Least Common Multiple of the two cycle periods: LCM(15, 20). 15 = 3 × 5, 20 = 2² × 5. LCM = 2² × 3 × 5 = 60 seconds.",
  },
  q_ef_04: {
    questionId: "q_ef_04",
    correctAnswerId: "opt_a",
    explanation:
      "Multiplying both the numerator and denominator of 2/3 by 4 gives (2 × 4) / (3 × 4) = 8/12. Since they represent the exact same value, 2/3 and 8/12 are equivalent.",
  },
  q_ef_05: {
    questionId: "q_ef_05",
    correctAnswerId: "opt_b",
    explanation:
      "The Highest Common Factor (HCF) of 35 and 49 is 7. Dividing both terms by 7 gives (35 ÷ 7) / (49 ÷ 7) = 5/7.",
  },
  q_af_04: {
    questionId: "q_af_04",
    correctAnswerId: "opt_b",
    explanation:
      "The LCM of denominators 8 and 4 is 8. Convert 1/4 to eighths: (1 × 2) / (4 × 2) = 2/8. Now add numerators: 3/8 + 2/8 = 5/8.",
  },
  q_af_05: {
    questionId: "q_af_05",
    correctAnswerId: "opt_b",
    explanation:
      "3 and 5 are coprime, so their LCM is 3 × 5 = 15. Convert each: 2/3 = 10/15 and 3/5 = 9/15. Adding gives (10 + 9) / 15 = 19/15 (or 1 4/15 as a mixed fraction).",
  },
  q_mf_04: {
    questionId: "q_mf_04",
    correctAnswerId: "opt_b",
    explanation:
      "To convert a mixed number a b/c to an improper fraction: (a × c + b) / c. For 4 3/7: (4 × 7 + 3) / 7 = (28 + 3) / 7 = 31/7.",
  },
  q_mf_05: {
    questionId: "q_mf_05",
    correctAnswerId: "opt_b",
    explanation:
      "Add whole numbers: 2 + 1 = 3. Add fractional parts: 1/3 + 1/6. LCM of 3 and 6 is 6. 1/3 = 2/6. 2/6 + 1/6 = 3/6 = 1/2. Combining gives 3 1/2.",
  },
};
