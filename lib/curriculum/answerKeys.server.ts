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

  // --- Expanded Curriculum Questions (25 additional) ---
  // Concept 1: Fraction Basics
  q_fb_06: {
    questionId: "q_fb_06",
    correctAnswerId: "opt_b",
    explanation:
      "One hour has 60 minutes. 45 minutes out of 60 is 45/60. Dividing numerator and denominator by 15 gives 3/4.",
  },
  q_fb_07: {
    questionId: "q_fb_07",
    correctAnswerId: "opt_a",
    explanation:
      "When 1 whole meter is divided into 10 equal portions, each portion is 1/10 meter. Taking 7 such portions gives 7/10 meter.",
  },
  q_fb_08: {
    questionId: "q_fb_08",
    correctAnswerId: "opt_c",
    explanation:
      "A fraction is strictly greater than 1 when its numerator is greater than its denominator. In 9/7, 9 > 7, so it represents more than one whole.",
  },
  q_fb_09: {
    questionId: "q_fb_09",
    correctAnswerId: "opt_b",
    explanation:
      "Out of 20 apples, 5 are green, which leaves 20 - 5 = 15 red apples. The fraction of red apples is therefore 15/20 (or 3/4).",
  },
  q_fb_10: {
    questionId: "q_fb_10",
    correctAnswerId: "opt_b",
    explanation:
      "The number of girls is (3/8) × 40 = 15. The remaining students are boys: 40 - 15 = 25 boys (or 5/8 × 40 = 25).",
  },

  // Concept 2: Common Multiples & LCM
  q_cm_06: {
    questionId: "q_cm_06",
    correctAnswerId: "opt_b",
    explanation:
      "Both 3 and 5 are prime numbers. Since they have no shared factors other than 1, their LCM is their direct product: 3 × 5 = 15.",
  },
  q_cm_07: {
    questionId: "q_cm_07",
    correctAnswerId: "opt_a",
    explanation:
      "Multiples of 6 are 6, 12, 18, 24... Multiples of 9 are 9, 18, 27... The lowest common multiple is 18.",
  },
  q_cm_08: {
    questionId: "q_cm_08",
    correctAnswerId: "opt_b",
    explanation:
      "Prime factorizations: 6 = 2 × 3, 8 = 2³, 12 = 2² × 3. LCM = 2³ × 3 = 8 × 3 = 24.",
  },
  q_cm_09: {
    questionId: "q_cm_09",
    correctAnswerId: "opt_b",
    explanation:
      "The bells toll together at the LCM of 12 and 18. LCM(12, 18) = 36 minutes. 36 minutes after 9:00 AM is 9:36 AM.",
  },
  q_cm_10: {
    questionId: "q_cm_10",
    correctAnswerId: "opt_a",
    explanation:
      "For any two numbers: Product = LCM × HCF. Therefore, LCM = Product / HCF = 180 / 3 = 60.",
  },

  // Concept 3: Equivalent Fractions
  q_ef_06: {
    questionId: "q_ef_06",
    correctAnswerId: "opt_a",
    explanation:
      "To obtain denominator 16 from 2, multiply both numerator and denominator by 8: (1 × 8) / (2 × 8) = 8/16.",
  },
  q_ef_07: {
    questionId: "q_ef_07",
    correctAnswerId: "opt_b",
    explanation:
      "The Highest Common Factor of 15 and 25 is 5. Dividing both parts by 5 gives (15 ÷ 5) / (25 ÷ 5) = 3/5.",
  },
  q_ef_08: {
    questionId: "q_ef_08",
    correctAnswerId: "opt_b",
    explanation:
      "Since 28 = 4 × 7, we scale the denominator by the same multiplier 7: 9 × 7 = 63. Thus, 4/9 = 28/63.",
  },
  q_ef_09: {
    questionId: "q_ef_09",
    correctAnswerId: "opt_d",
    explanation:
      "4/10 = 2/5, 6/15 = 2/5, and 8/20 = 2/5. However, 10/22 reduces to 5/11, which does not equal 2/5.",
  },
  q_ef_10: {
    questionId: "q_ef_10",
    correctAnswerId: "opt_c",
    explanation:
      "The HCF of 48 and 72 is 24. Dividing numerator and denominator by 24 gives (48 ÷ 24) / (72 ÷ 24) = 2/3.",
  },

  // Concept 4: Adding Fractions
  q_af_06: {
    questionId: "q_af_06",
    correctAnswerId: "opt_b",
    explanation:
      "With common denominator 9, add the numerators: 2 + 4 = 6. Result: 6/9 (which reduces to 2/3).",
  },
  q_af_07: {
    questionId: "q_af_07",
    correctAnswerId: "opt_b",
    explanation:
      "5 and 3 are coprime numbers. Their lowest common denominator is their product: 5 × 3 = 15.",
  },
  q_af_08: {
    questionId: "q_af_08",
    correctAnswerId: "opt_b",
    explanation:
      "The LCM of 10 and 5 is 10. Convert 2/5 to tenths: 2/5 = 4/10. Now add: 3/10 + 4/10 = 7/10.",
  },
  q_af_09: {
    questionId: "q_af_09",
    correctAnswerId: "opt_b",
    explanation:
      "LCM of 3 and 6 is 6. Convert: 1/3 = 2/6 cup. Total = 2/6 + 1/6 = 3/6 cup, which simplifies to 1/2 cup.",
  },
  q_af_10: {
    questionId: "q_af_10",
    correctAnswerId: "opt_b",
    explanation:
      "LCM of 12 and 18 is 36. Convert: 5/12 = 15/36 and 7/18 = 14/36. Adding yields (15 + 14) / 36 = 29/36.",
  },

  // Concept 5: Mixed Fractions
  q_mf_06: {
    questionId: "q_mf_06",
    correctAnswerId: "opt_a",
    explanation:
      "Dividing 7 by 2 yields a quotient of 3 with a remainder of 1. Hence, 7/2 = 3 1/2.",
  },
  q_mf_07: {
    questionId: "q_mf_07",
    correctAnswerId: "opt_a",
    explanation:
      "To convert 3 2/5: multiply the whole number by denominator and add numerator: (3 × 5 + 2) / 5 = (15 + 2) / 5 = 17/5.",
  },
  q_mf_08: {
    questionId: "q_mf_08",
    correctAnswerId: "opt_a",
    explanation:
      "Sum whole parts: 2 + 3 = 5. Sum fraction parts: 1/4 + 1/4 = 2/4 = 1/2. Combined: 5 1/2.",
  },
  q_mf_09: {
    questionId: "q_mf_09",
    correctAnswerId: "opt_b",
    explanation:
      "Whole parts: 1 + 2 = 3. Fractional parts: 2/3 + 1/6 = 4/6 + 1/6 = 5/6. Combined: 3 5/6.",
  },
  q_mf_10: {
    questionId: "q_mf_10",
    correctAnswerId: "opt_b",
    explanation:
      "Sum: 2 1/2 + 3 3/4 = 2 2/4 + 3 3/4 = 5 5/4. Since 5/4 = 1 1/4, the total is 5 + 1 1/4 = 6 1/4 km.",
  },
};
