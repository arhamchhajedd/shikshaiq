import { PublicQuestion } from "../../types/curriculum";

export const DIAGNOSTIC_QUESTIONS: PublicQuestion[] = [
  // --- Concept 1: Fraction Basics ---
  {
    id: "q_fb_01",
    conceptId: "fraction-basics",
    prompt: "In the fraction 5/8, what does the denominator (8) represent?",
    options: [
      { id: "opt_a", text: "The number of parts being counted or selected" },
      { id: "opt_b", text: "The total number of equal parts that make up one whole" },
      { id: "opt_c", text: "The difference between numerator and denominator" },
      { id: "opt_d", text: "The total number of whole units" },
    ],
    difficulty: "easy",
    learningObjective: "Identify the role of numerator and denominator in fractions.",
  },
  {
    id: "q_fb_02",
    conceptId: "fraction-basics",
    prompt: "A roti is cut into 6 equal slices. Rohit eats 4 slices. What fraction of the roti did Rohit eat?",
    options: [
      { id: "opt_a", text: "4/6" },
      { id: "opt_b", text: "6/4" },
      { id: "opt_c", text: "2/6" },
      { id: "opt_d", text: "1/4" },
    ],
    difficulty: "easy",
    learningObjective: "Represent fractional quantities from real-world contexts.",
  },
  {
    id: "q_fb_03",
    conceptId: "fraction-basics",
    prompt: "Which of the following is a proper fraction?",
    options: [
      { id: "opt_a", text: "7/4" },
      { id: "opt_b", text: "9/9" },
      { id: "opt_c", text: "3/5" },
      { id: "opt_d", text: "11/8" },
    ],
    difficulty: "medium",
    learningObjective: "Distinguish proper fractions (numerator < denominator) from improper fractions.",
  },

  // --- Concept 2: Common Multiples ---
  {
    id: "q_cm_01",
    conceptId: "common-multiples",
    prompt: "What is the Least Common Multiple (LCM) of 4 and 6?",
    options: [
      { id: "opt_a", text: "2" },
      { id: "opt_b", text: "12" },
      { id: "opt_c", text: "24" },
      { id: "opt_d", text: "10" },
    ],
    difficulty: "easy",
    learningObjective: "Calculate the lowest common multiple of two small integers.",
  },
  {
    id: "q_cm_02",
    conceptId: "common-multiples",
    prompt: "What is the LCM of the three numbers: 3, 4, and 6?",
    options: [
      { id: "opt_a", text: "12" },
      { id: "opt_b", text: "24" },
      { id: "opt_c", text: "72" },
      { id: "opt_d", text: "18" },
    ],
    difficulty: "medium",
    learningObjective: "Find the common denominator LCM across multiple terms.",
  },
  {
    id: "q_cm_03",
    conceptId: "common-multiples",
    prompt: "Which pair of denominators has an LCM equal to their direct product?",
    options: [
      { id: "opt_a", text: "4 and 8" },
      { id: "opt_b", text: "5 and 7" },
      { id: "opt_c", text: "6 and 9" },
      { id: "opt_d", text: "2 and 6" },
    ],
    difficulty: "hard",
    learningObjective: "Recognize that coprime numbers have LCM = product.",
  },

  // --- Concept 3: Equivalent Fractions ---
  {
    id: "q_ef_01",
    conceptId: "equivalent-fractions",
    prompt: "Which of the following fractions is equivalent to 3/4?",
    options: [
      { id: "opt_a", text: "6/7" },
      { id: "opt_b", text: "9/12" },
      { id: "opt_c", text: "12/15" },
      { id: "opt_d", text: "7/8" },
    ],
    difficulty: "easy",
    learningObjective: "Identify equivalent fractions by scaling numerator and denominator equally.",
  },
  {
    id: "q_ef_02",
    conceptId: "equivalent-fractions",
    prompt: "What is the fraction 18/24 reduced to its simplest form (lowest terms)?",
    options: [
      { id: "opt_a", text: "9/12" },
      { id: "opt_b", text: "6/8" },
      { id: "opt_c", text: "3/4" },
      { id: "opt_d", text: "2/3" },
    ],
    difficulty: "medium",
    learningObjective: "Simplify fractions by dividing numerator and denominator by their HCF/GCD.",
  },
  {
    id: "q_ef_03",
    conceptId: "equivalent-fractions",
    prompt: "Find the missing numerator: 2/5 = ?/20",
    options: [
      { id: "opt_a", text: "4" },
      { id: "opt_b", text: "8" },
      { id: "opt_c", text: "10" },
      { id: "opt_d", text: "15" },
    ],
    difficulty: "medium",
    learningObjective: "Scale fractions to a required target denominator.",
  },

  // --- Concept 4: Adding Fractions ---
  {
    id: "q_af_01",
    conceptId: "adding-fractions",
    prompt: "What is the sum of 3/7 + 2/7 in simplest form?",
    options: [
      { id: "opt_a", text: "5/14" },
      { id: "opt_b", text: "5/7" },
      { id: "opt_c", text: "6/7" },
      { id: "opt_d", text: "1/7" },
    ],
    difficulty: "easy",
    learningObjective: "Add fractions with like denominators without adding denominators.",
  },
  {
    id: "q_af_02",
    conceptId: "adding-fractions",
    prompt: "What is the value of 1/4 + 2/3?",
    options: [
      { id: "opt_a", text: "3/7" },
      { id: "opt_b", text: "11/12" },
      { id: "opt_c", text: "9/12" },
      { id: "opt_d", text: "5/12" },
    ],
    difficulty: "medium",
    learningObjective: "Add fractions with unlike denominators by converting to LCM denominator 12.",
  },
  {
    id: "q_af_03",
    conceptId: "adding-fractions",
    prompt: "Evaluate: 5/6 + 3/8. Give the answer in lowest terms.",
    options: [
      { id: "opt_a", text: "8/14" },
      { id: "opt_b", text: "29/24" },
      { id: "opt_c", text: "19/24" },
      { id: "opt_d", text: "25/24" },
    ],
    difficulty: "hard",
    learningObjective: "Add unlike fractions with composite denominators using LCM (24).",
  },

  // --- Concept 5: Mixed Fraction Problems ---
  {
    id: "q_mf_01",
    conceptId: "mixed-fractions",
    prompt: "Convert the improper fraction 11/4 into a mixed numeral.",
    options: [
      { id: "opt_a", text: "2 1/4" },
      { id: "opt_b", text: "2 3/4" },
      { id: "opt_c", text: "3 1/4" },
      { id: "opt_d", text: "1 3/4" },
    ],
    difficulty: "easy",
    learningObjective: "Convert improper fractions to mixed numerals.",
  },
  {
    id: "q_mf_02",
    conceptId: "mixed-fractions",
    prompt: "What is the sum of 1 1/2 + 2 1/3?",
    options: [
      { id: "opt_a", text: "3 2/5" },
      { id: "opt_b", text: "3 5/6" },
      { id: "opt_c", text: "4 1/6" },
      { id: "opt_d", text: "3 1/6" },
    ],
    difficulty: "medium",
    learningObjective: "Add mixed fractions by summing whole parts and fractional parts.",
  },
  {
    id: "q_mf_03",
    conceptId: "mixed-fractions",
    prompt: "Priya studied Mathematics for 1 3/4 hours and Science for 1 1/2 hours. What was the total time she spent studying?",
    options: [
      { id: "opt_a", text: "3 1/4 hours" },
      { id: "opt_b", text: "2 4/6 hours" },
      { id: "opt_c", text: "3 1/2 hours" },
      { id: "opt_d", text: "3 3/4 hours" },
    ],
    difficulty: "hard",
    learningObjective: "Solve contextual word problems requiring mixed fraction addition.",
  },
];

export const PRACTICE_QUESTIONS: PublicQuestion[] = [
  // --- Concept 1: Fraction Basics ---
  {
    id: "q_fb_04",
    conceptId: "fraction-basics",
    prompt: "A pizza is cut into 12 equal slices. If Meera eats 3 slices, what fraction of the pizza is left uneaten?",
    options: [
      { id: "opt_a", text: "9/12" },
      { id: "opt_b", text: "3/12" },
      { id: "opt_c", text: "12/9" },
      { id: "opt_d", text: "6/12" },
    ],
    difficulty: "medium",
    learningObjective: "Compute the remaining fractional parts of a whole unit.",
  },
  {
    id: "q_fb_05",
    conceptId: "fraction-basics",
    prompt: "On a number line from 0 to 1 divided into 5 equal segments, which mark represents the fraction 4/5?",
    options: [
      { id: "opt_a", text: "The 1st mark from 0" },
      { id: "opt_b", text: "The 4th mark from 0" },
      { id: "opt_c", text: "The 5th mark from 0" },
      { id: "opt_d", text: "The midpoint between 0 and 1" },
    ],
    difficulty: "easy",
    learningObjective: "Locate and identify fractions on a segmented number line.",
  },

  // --- Concept 2: Common Multiples ---
  {
    id: "q_cm_04",
    conceptId: "common-multiples",
    prompt: "What is the Least Common Multiple (LCM) of 8 and 12?",
    options: [
      { id: "opt_a", text: "24" },
      { id: "opt_b", text: "48" },
      { id: "opt_c", text: "4" },
      { id: "opt_d", text: "96" },
    ],
    difficulty: "medium",
    learningObjective: "Calculate the LCM of two composite integers.",
  },
  {
    id: "q_cm_05",
    conceptId: "common-multiples",
    prompt: "Two traffic lights turn green every 15 seconds and 20 seconds respectively. If they both turn green simultaneously, after how many seconds will they turn green together again?",
    options: [
      { id: "opt_a", text: "30 seconds" },
      { id: "opt_b", text: "60 seconds" },
      { id: "opt_c", text: "300 seconds" },
      { id: "opt_d", text: "35 seconds" },
    ],
    difficulty: "hard",
    learningObjective: "Apply LCM to solve real-world periodic interval problems.",
  },

  // --- Concept 3: Equivalent Fractions ---
  {
    id: "q_ef_04",
    conceptId: "equivalent-fractions",
    prompt: "Which pair of fractions below are equivalent to each other?",
    options: [
      { id: "opt_a", text: "2/3 and 8/12" },
      { id: "opt_b", text: "3/5 and 6/15" },
      { id: "opt_c", text: "4/7 and 8/21" },
      { id: "opt_d", text: "1/4 and 3/8" },
    ],
    difficulty: "easy",
    learningObjective: "Identify equivalent fractions using proportional scaling.",
  },
  {
    id: "q_ef_05",
    conceptId: "equivalent-fractions",
    prompt: "Reduce the fraction 35/49 to its simplest form (lowest terms).",
    options: [
      { id: "opt_a", text: "7/5" },
      { id: "opt_b", text: "5/7" },
      { id: "opt_c", text: "5/9" },
      { id: "opt_d", text: "1/7" },
    ],
    difficulty: "medium",
    learningObjective: "Simplify a fraction by dividing by the highest common factor.",
  },

  // --- Concept 4: Adding Fractions ---
  {
    id: "q_af_04",
    conceptId: "adding-fractions",
    prompt: "Calculate: 3/8 + 1/4 = ?",
    options: [
      { id: "opt_a", text: "4/12" },
      { id: "opt_b", text: "5/8" },
      { id: "opt_c", text: "4/8" },
      { id: "opt_d", text: "7/8" },
    ],
    difficulty: "medium",
    learningObjective: "Add fractions when one denominator is a multiple of the other.",
  },
  {
    id: "q_af_05",
    conceptId: "adding-fractions",
    prompt: "Solve: 2/3 + 3/5 = ?",
    options: [
      { id: "opt_a", text: "5/8" },
      { id: "opt_b", text: "19/15" },
      { id: "opt_c", text: "11/15" },
      { id: "opt_d", text: "6/15" },
    ],
    difficulty: "hard",
    learningObjective: "Add fractions with coprime denominators and convert to common terms.",
  },

  // --- Concept 5: Mixed Fractions ---
  {
    id: "q_mf_04",
    conceptId: "mixed-fractions",
    prompt: "Convert the mixed numeral 4 3/7 into an improper fraction.",
    options: [
      { id: "opt_a", text: "19/7" },
      { id: "opt_b", text: "31/7" },
      { id: "opt_c", text: "28/7" },
      { id: "opt_d", text: "12/7" },
    ],
    difficulty: "medium",
    learningObjective: "Convert a mixed numeral into an improper fraction.",
  },
  {
    id: "q_mf_05",
    conceptId: "mixed-fractions",
    prompt: "Calculate: 2 1/3 + 1 1/6 = ?",
    options: [
      { id: "opt_a", text: "3 2/9" },
      { id: "opt_b", text: "3 1/2" },
      { id: "opt_c", text: "3 2/6" },
      { id: "opt_d", text: "4 1/2" },
    ],
    difficulty: "hard",
    learningObjective: "Add mixed numbers with unlike denominators and simplify.",
  },
];

export const ADDITIONAL_CURRICULUM_QUESTIONS: PublicQuestion[] = [
  // --- Concept 1: Fraction Basics (5 additional: q_fb_06 to q_fb_10) ---
  {
    id: "q_fb_06",
    conceptId: "fraction-basics",
    prompt: "What fraction of an hour is 45 minutes?",
    options: [
      { id: "opt_a", text: "1/2" },
      { id: "opt_b", text: "3/4" },
      { id: "opt_c", text: "2/3" },
      { id: "opt_d", text: "4/5" },
    ],
    difficulty: "easy",
    learningObjective: "Calculate fractional units of time.",
  },
  {
    id: "q_fb_07",
    conceptId: "fraction-basics",
    prompt: "If a ribbon of length 1 meter is cut into 10 equal pieces, what is the length of 7 such pieces?",
    options: [
      { id: "opt_a", text: "7/10 meter" },
      { id: "opt_b", text: "3/10 meter" },
      { id: "opt_c", text: "10/7 meters" },
      { id: "opt_d", text: "1/7 meter" },
    ],
    difficulty: "easy",
    learningObjective: "Model parts of a linear measurement as fractions.",
  },
  {
    id: "q_fb_08",
    conceptId: "fraction-basics",
    prompt: "Which of the following fractions is strictly greater than 1 (an improper fraction)?",
    options: [
      { id: "opt_a", text: "5/6" },
      { id: "opt_b", text: "8/8" },
      { id: "opt_c", text: "9/7" },
      { id: "opt_d", text: "3/4" },
    ],
    difficulty: "medium",
    learningObjective: "Identify fractions greater than one whole.",
  },
  {
    id: "q_fb_09",
    conceptId: "fraction-basics",
    prompt: "A fruit basket contains 20 apples. 5 of them are green and the remainder are red. What fraction of the apples are red?",
    options: [
      { id: "opt_a", text: "5/20" },
      { id: "opt_b", text: "15/20" },
      { id: "opt_c", text: "20/15" },
      { id: "opt_d", text: "10/20" },
    ],
    difficulty: "medium",
    learningObjective: "Compute fractional subsets in real-world collections.",
  },
  {
    id: "q_fb_10",
    conceptId: "fraction-basics",
    prompt: "In a class of 40 students, 3/8 of the students are girls. How many boys are in the class?",
    options: [
      { id: "opt_a", text: "15" },
      { id: "opt_b", text: "25" },
      { id: "opt_c", text: "20" },
      { id: "opt_d", text: "30" },
    ],
    difficulty: "hard",
    learningObjective: "Solve multi-step fractional word problems.",
  },

  // --- Concept 2: Common Multiples & LCM (5 additional: q_cm_06 to q_cm_10) ---
  {
    id: "q_cm_06",
    conceptId: "common-multiples",
    prompt: "What is the Least Common Multiple (LCM) of 3 and 5?",
    options: [
      { id: "opt_a", text: "8" },
      { id: "opt_b", text: "15" },
      { id: "opt_c", text: "10" },
      { id: "opt_d", text: "12" },
    ],
    difficulty: "easy",
    learningObjective: "Find the LCM of two prime integers.",
  },
  {
    id: "q_cm_07",
    conceptId: "common-multiples",
    prompt: "What is the smallest common denominator required to add 1/6 and 1/9?",
    options: [
      { id: "opt_a", text: "18" },
      { id: "opt_b", text: "54" },
      { id: "opt_c", text: "15" },
      { id: "opt_d", text: "36" },
    ],
    difficulty: "easy",
    learningObjective: "Identify lowest common denominator using LCM.",
  },
  {
    id: "q_cm_08",
    conceptId: "common-multiples",
    prompt: "Find the Least Common Multiple (LCM) of 6, 8, and 12.",
    options: [
      { id: "opt_a", text: "48" },
      { id: "opt_b", text: "24" },
      { id: "opt_c", text: "72" },
      { id: "opt_d", text: "36" },
    ],
    difficulty: "medium",
    learningObjective: "Compute LCM across three composite integers.",
  },
  {
    id: "q_cm_09",
    conceptId: "common-multiples",
    prompt: "Two bells toll together at 9:00 AM. One tolls every 12 minutes and the other every 18 minutes. At what time will they toll together next?",
    options: [
      { id: "opt_a", text: "9:30 AM" },
      { id: "opt_b", text: "9:36 AM" },
      { id: "opt_c", text: "9:48 AM" },
      { id: "opt_d", text: "10:00 AM" },
    ],
    difficulty: "medium",
    learningObjective: "Apply LCM to periodic scheduling problems.",
  },
  {
    id: "q_cm_10",
    conceptId: "common-multiples",
    prompt: "The product of two positive numbers is 180 and their Highest Common Factor (HCF) is 3. What is their LCM?",
    options: [
      { id: "opt_a", text: "60" },
      { id: "opt_b", text: "540" },
      { id: "opt_c", text: "30" },
      { id: "opt_d", text: "90" },
    ],
    difficulty: "hard",
    learningObjective: "Use the product formula Product = LCM x HCF.",
  },

  // --- Concept 3: Equivalent Fractions (5 additional: q_ef_06 to q_ef_10) ---
  {
    id: "q_ef_06",
    conceptId: "equivalent-fractions",
    prompt: "Which fraction is equivalent to 1/2 with denominator 16?",
    options: [
      { id: "opt_a", text: "8/16" },
      { id: "opt_b", text: "4/16" },
      { id: "opt_c", text: "6/16" },
      { id: "opt_d", text: "2/16" },
    ],
    difficulty: "easy",
    learningObjective: "Scale a unit fraction to a designated denominator.",
  },
  {
    id: "q_ef_07",
    conceptId: "equivalent-fractions",
    prompt: "What is the fraction 15/25 reduced to its simplest form?",
    options: [
      { id: "opt_a", text: "5/3" },
      { id: "opt_b", text: "3/5" },
      { id: "opt_c", text: "1/5" },
      { id: "opt_d", text: "3/4" },
    ],
    difficulty: "easy",
    learningObjective: "Simplify fractions by dividing by the common factor 5.",
  },
  {
    id: "q_ef_08",
    conceptId: "equivalent-fractions",
    prompt: "Find the missing denominator to make the fractions equivalent: 4/9 = 28/?",
    options: [
      { id: "opt_a", text: "54" },
      { id: "opt_b", text: "63" },
      { id: "opt_c", text: "72" },
      { id: "opt_d", text: "36" },
    ],
    difficulty: "medium",
    learningObjective: "Compute unknown denominator in equivalent fractions.",
  },
  {
    id: "q_ef_09",
    conceptId: "equivalent-fractions",
    prompt: "Which of the following fractions is NOT equivalent to 2/5?",
    options: [
      { id: "opt_a", text: "4/10" },
      { id: "opt_b", text: "6/15" },
      { id: "opt_c", text: "8/20" },
      { id: "opt_d", text: "10/22" },
    ],
    difficulty: "medium",
    learningObjective: "Identify non-equivalent fractions through scaling check.",
  },
  {
    id: "q_ef_10",
    conceptId: "equivalent-fractions",
    prompt: "Reduce the fraction 48/72 to its simplest form (lowest terms).",
    options: [
      { id: "opt_a", text: "4/6" },
      { id: "opt_b", text: "6/9" },
      { id: "opt_c", text: "2/3" },
      { id: "opt_d", text: "3/4" },
    ],
    difficulty: "hard",
    learningObjective: "Reduce larger numbers using highest common factor (24).",
  },

  // --- Concept 4: Adding Fractions (5 additional: q_af_06 to q_af_10) ---
  {
    id: "q_af_06",
    conceptId: "adding-fractions",
    prompt: "What is the sum of 2/9 + 4/9?",
    options: [
      { id: "opt_a", text: "6/18" },
      { id: "opt_b", text: "6/9" },
      { id: "opt_c", text: "8/9" },
      { id: "opt_d", text: "2/9" },
    ],
    difficulty: "easy",
    learningObjective: "Add like fractions keeping the common denominator.",
  },
  {
    id: "q_af_07",
    conceptId: "adding-fractions",
    prompt: "What common denominator should be used to add 1/5 and 2/3?",
    options: [
      { id: "opt_a", text: "8" },
      { id: "opt_b", text: "15" },
      { id: "opt_c", text: "10" },
      { id: "opt_d", text: "20" },
    ],
    difficulty: "easy",
    learningObjective: "Determine common denominator for prime denominators.",
  },
  {
    id: "q_af_08",
    conceptId: "adding-fractions",
    prompt: "Calculate: 3/10 + 2/5. Express your answer in simplest form.",
    options: [
      { id: "opt_a", text: "5/15" },
      { id: "opt_b", text: "7/10" },
      { id: "opt_c", text: "5/10" },
      { id: "opt_d", text: "1/2" },
    ],
    difficulty: "medium",
    learningObjective: "Add fractions where one denominator is a multiple of the other.",
  },
  {
    id: "q_af_09",
    conceptId: "adding-fractions",
    prompt: "A recipe requires 1/3 cup of olive oil and 1/6 cup of lemon juice. What is the total liquid added?",
    options: [
      { id: "opt_a", text: "2/9 cup" },
      { id: "opt_b", text: "1/2 cup" },
      { id: "opt_c", text: "3/6 cup" },
      { id: "opt_d", text: "2/6 cup" },
    ],
    difficulty: "medium",
    learningObjective: "Add unlike fractions in real-world cooking measurements.",
  },
  {
    id: "q_af_10",
    conceptId: "adding-fractions",
    prompt: "Evaluate: 5/12 + 7/18. Give your answer in lowest terms.",
    options: [
      { id: "opt_a", text: "12/30" },
      { id: "opt_b", text: "29/36" },
      { id: "opt_c", text: "31/36" },
      { id: "opt_d", text: "17/36" },
    ],
    difficulty: "hard",
    learningObjective: "Add unlike fractions requiring composite LCM calculation.",
  },

  // --- Concept 5: Mixed Fractions (5 additional: q_mf_06 to q_mf_10) ---
  {
    id: "q_mf_06",
    conceptId: "mixed-fractions",
    prompt: "Which mixed numeral is equivalent to the improper fraction 7/2?",
    options: [
      { id: "opt_a", text: "3 1/2" },
      { id: "opt_b", text: "2 1/2" },
      { id: "opt_c", text: "3 1/4" },
      { id: "opt_d", text: "4 1/2" },
    ],
    difficulty: "easy",
    learningObjective: "Convert improper fraction with denominator 2 to mixed numeral.",
  },
  {
    id: "q_mf_07",
    conceptId: "mixed-fractions",
    prompt: "Convert the mixed fraction 3 2/5 into an improper fraction.",
    options: [
      { id: "opt_a", text: "17/5" },
      { id: "opt_b", text: "15/5" },
      { id: "opt_c", text: "11/5" },
      { id: "opt_d", text: "21/5" },
    ],
    difficulty: "easy",
    learningObjective: "Convert mixed numeral to improper fraction.",
  },
  {
    id: "q_mf_08",
    conceptId: "mixed-fractions",
    prompt: "Add the mixed numerals: 2 1/4 + 3 1/4.",
    options: [
      { id: "opt_a", text: "5 1/2" },
      { id: "opt_b", text: "5 2/8" },
      { id: "opt_c", text: "6 1/4" },
      { id: "opt_d", text: "5 1/4" },
    ],
    difficulty: "medium",
    learningObjective: "Add mixed numerals with like denominators and simplify.",
  },
  {
    id: "q_mf_09",
    conceptId: "mixed-fractions",
    prompt: "Calculate: 1 2/3 + 2 1/6 = ?",
    options: [
      { id: "opt_a", text: "3 3/9" },
      { id: "opt_b", text: "3 5/6" },
      { id: "opt_c", text: "4 1/6" },
      { id: "opt_d", text: "3 1/2" },
    ],
    difficulty: "medium",
    learningObjective: "Add mixed numerals with unlike denominators using LCM.",
  },
  {
    id: "q_mf_10",
    conceptId: "mixed-fractions",
    prompt: "Raman walked 2 1/2 km in the morning and 3 3/4 km in the evening. What is the total distance he walked?",
    options: [
      { id: "opt_a", text: "5 4/6 km" },
      { id: "opt_b", text: "6 1/4 km" },
      { id: "opt_c", text: "6 1/2 km" },
      { id: "opt_d", text: "5 3/4 km" },
    ],
    difficulty: "hard",
    learningObjective: "Solve multi-step mixed fraction contextual distance problems.",
  },
];

export const ALL_QUESTIONS: PublicQuestion[] = [
  ...DIAGNOSTIC_QUESTIONS,
  ...PRACTICE_QUESTIONS,
  ...ADDITIONAL_CURRICULUM_QUESTIONS,
];

export function getQuestionsForConcept(
  conceptId: string,
  preferredDifficulty?: "easy" | "medium" | "hard"
): PublicQuestion[] {
  const filtered = ALL_QUESTIONS.filter((q) => q.conceptId === conceptId);
  if (!preferredDifficulty) return filtered;

  // Sort so preferred difficulty appears first
  return [...filtered].sort((a, b) => {
    if (a.difficulty === preferredDifficulty && b.difficulty !== preferredDifficulty) return -1;
    if (b.difficulty === preferredDifficulty && a.difficulty !== preferredDifficulty) return 1;
    return 0;
  });
}
