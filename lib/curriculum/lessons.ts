import { ConceptId, ConceptLesson } from "@/types/curriculum";

export const CONCEPT_LESSONS: Record<ConceptId, ConceptLesson> = {
  "fraction-basics": {
    conceptId: "fraction-basics",
    title: "Fraction Basics & Representation",
    shortTitle: "Fraction Basics",
    gradeLevel: 7,
    subject: "Mathematics",
    learningObjective:
      "Understand the meaning of numerator and denominator, represent fractions as parts of a whole unit, and identify proper and improper fractions.",
    summary:
      "A fraction represents one or more equal parts of a whole object or collection. The denominator indicates how many equal parts the whole is partitioned into, and the numerator indicates how many of those parts are selected.",
    introduction:
      "In daily life, we constantly share objects like rotis, pizzas, or chocolate bars. When an object is divided into equal parts, each part is a fraction. If you cut an apple into 4 equal slices and eat 1 slice, you have eaten 1 out of 4 parts, written mathematically as 1/4.",
    visualRepresentation: {
      type: "fraction_strip",
      title: "Fraction Strip Model (5/8)",
      description:
        "A whole unit divided into 8 equal parts with 5 parts shaded. The 5 shaded parts represent the numerator, and the 8 total parts represent the denominator.",
      data: {
        totalParts: 8,
        shadedParts: 5,
        unitLabel: "One Whole Unit",
        fractionLabel: "5/8",
      },
    },
    keyRules: [
      "Denominator (bottom number): The total number of equal parts that make up one whole unit. It can never be zero.",
      "Numerator (top number): The number of equal parts being considered, counted, or selected.",
      "Proper Fraction: The numerator is strictly less than the denominator (e.g., 3/5 < 1). The value is less than 1 whole.",
      "Improper Fraction: The numerator is greater than or equal to the denominator (e.g., 7/4 > 1, 4/4 = 1). The value is 1 whole or more.",
      "Unit Fraction: Any proper fraction where the numerator is exactly 1 (e.g., 1/2, 1/3, 1/8).",
    ],
    workedExamples: [
      {
        id: "we_fb_01",
        problem:
          "In a Class 7 mathematics test with 12 equal-mark questions, Rohan solved 9 questions correctly. What fraction of the test did Rohan solve correctly, and what fraction was left unsolved?",
        steps: [
          "Step 1: Identify the whole unit. The entire test consists of 12 equal questions, so the denominator is 12.",
          "Step 2: Identify the selected parts. Rohan answered 9 questions correctly, so the numerator for correct questions is 9. The fraction is 9/12.",
          "Step 3: Calculate the remaining questions. Total questions - solved questions = 12 - 9 = 3.",
          "Step 4: Form the unsolved fraction. 3 questions out of 12 were unsolved, giving 3/12.",
        ],
        solution:
          "Rohan solved 9/12 of the test correctly (simplifies to 3/4), and 3/12 was left unsolved (simplifies to 1/4).",
        tip: "Notice that 9/12 + 3/12 = 12/12 = 1 whole test. The sum of all fractional parts must always equal the whole.",
      },
      {
        id: "we_fb_02",
        problem:
          "Classify the following fractions into Proper, Improper, or Whole: 4/7, 9/5, 6/6, 1/9.",
        steps: [
          "Step 1: For 4/7: Numerator (4) < Denominator (7). Since numerator is smaller, this is a Proper fraction.",
          "Step 2: For 9/5: Numerator (9) > Denominator (5). Since numerator is larger, this is an Improper fraction.",
          "Step 3: For 6/6: Numerator (6) = Denominator (6). 6 divided by 6 equals 1 whole unit.",
          "Step 4: For 1/9: Numerator is 1, which is less than 9. This is a Proper unit fraction.",
        ],
        solution:
          "4/7 is Proper, 9/5 is Improper, 6/6 is Whole (1), and 1/9 is Proper.",
      },
    ],
    commonMistakes: [
      {
        id: "cm_fb_01",
        misconception: "Inverting the numerator and denominator.",
        correction:
          "Always remember: Top = Parts taken, Bottom = Total equal parts. If you eat 3 slices out of 8, it is 3/8, NEVER 8/3.",
        explanation:
          "Writing 8/3 would mean you ate 8 slices when the whole only had 3 slices, which represents more than two whole objects.",
      },
      {
        id: "cm_fb_02",
        misconception: "Assuming parts do not need to be equal in size.",
        correction:
          "Fractions only work when all parts are strictly equal in measure.",
        explanation:
          "If a roti is cut into two unequal pieces, one piece cannot be called 1/2 because the parts are not identical in area.",
      },
    ],
    estimatedMinutes: 8,
  },

  "common-multiples": {
    conceptId: "common-multiples",
    title: "Factors & Common Multiples (LCM)",
    shortTitle: "Common Multiples",
    gradeLevel: 7,
    subject: "Mathematics",
    learningObjective:
      "Find multiples of whole numbers and compute the Least Common Multiple (LCM) of two or more numbers using prime factorization and division.",
    summary:
      "A multiple of a number is the product of that number and any positive integer. The Least Common Multiple (LCM) of two or more numbers is the smallest non-zero number that is a multiple of all of them. Finding the LCM is the foundational prerequisite for adding and subtracting fractions with unlike denominators.",
    introduction:
      "Imagine two bells at an Indian school. Bell A rings every 4 minutes, and Bell B rings every 6 minutes. When will both bells ring together? Bell A rings at 4, 8, 12, 16... Bell B rings at 6, 12, 18... Both ring together at 12 minutes! In mathematics, 12 is the Least Common Multiple (LCM) of 4 and 6.",
    visualRepresentation: {
      type: "grid",
      title: "Multiples Comparison Line",
      description:
        "Multiples of 4: [4, 8, 12, 16, 20, 24]. Multiples of 6: [6, 12, 18, 24, 30]. The lowest common point of alignment is 12.",
      data: {
        numberA: 4,
        multiplesA: [4, 8, 12, 16, 20, 24],
        numberB: 6,
        multiplesB: [6, 12, 18, 24, 30],
        commonMultiples: [12, 24],
        lcm: 12,
      },
    },
    keyRules: [
      "A multiple is found by multiplying a number by 1, 2, 3, 4, etc. (e.g., Multiples of 5 are 5, 10, 15, 20...).",
      "Common multiples are numbers that appear in the multiples list of both numbers.",
      "The Least Common Multiple (LCM) is the smallest of these common multiples.",
      "For Coprime Numbers (numbers sharing no common factors other than 1, like 3 and 5), the LCM is simply their direct product: 3 × 5 = 15.",
      "Division Method: Write the numbers in a row, divide by the smallest prime that divides at least one number, bring down un-divisible numbers, and multiply all divisors.",
    ],
    workedExamples: [
      {
        id: "we_cm_01",
        problem: "Find the Least Common Multiple (LCM) of 6 and 8 using prime division.",
        steps: [
          "Step 1: Write (6, 8) in a row.",
          "Step 2: Divide both by 2: (6 ÷ 2 = 3, 8 ÷ 2 = 4).",
          "Step 3: Divide by 2 again: 3 stays 3, 4 ÷ 2 = 2. Row is now (3, 2).",
          "Step 4: Divide by 2 again: 3 stays 3, 2 ÷ 2 = 1. Row is now (3, 1).",
          "Step 5: Divide by 3: 3 ÷ 3 = 1, 1 stays 1. Row is now (1, 1).",
          "Step 6: Multiply all prime divisors: 2 × 2 × 2 × 3 = 24.",
        ],
        solution: "The LCM of 6 and 8 is 24.",
        tip: "Notice that multiplying 6 × 8 gives 48. While 48 is a common multiple, 24 is the LEAST common multiple. Using 24 saves you from doing large calculations later in fraction addition!",
      },
      {
        id: "we_cm_02",
        problem: "Find the LCM of 3, 4, and 5.",
        steps: [
          "Step 1: Check prime factors: 3 is prime, 5 is prime, and 4 = 2 × 2.",
          "Step 2: Since 3, 4, and 5 have no common prime factors across them, they are pairwise coprime.",
          "Step 3: Multiply them directly: 3 × 4 × 5 = 60.",
        ],
        solution: "The LCM of 3, 4, and 5 is 60.",
      },
    ],
    commonMistakes: [
      {
        id: "cm_cm_01",
        misconception: "Always multiplying the numbers together instead of finding the LCM.",
        correction:
          "For 4 and 6, multiplying gives 24, but the true LCM is 12.",
        explanation:
          "Multiplying works as a common denominator, but using the true LCM keeps numbers smaller and prevents arithmetic errors.",
      },
      {
        id: "cm_cm_02",
        misconception: "Confusing LCM with HCF (Highest Common Factor).",
        correction:
          "HCF is smaller than or equal to the numbers (factors divide into them). LCM is larger than or equal to the numbers (multiples are products).",
        explanation:
          "For 6 and 8, HCF is 2 (a factor), while LCM is 24 (a multiple).",
      },
    ],
    estimatedMinutes: 10,
  },

  "equivalent-fractions": {
    conceptId: "equivalent-fractions",
    title: "Equivalent Fractions & Simplification",
    shortTitle: "Equivalent Fractions",
    gradeLevel: 7,
    subject: "Mathematics",
    learningObjective:
      "Generate equivalent fractions by multiplying or dividing numerator and denominator by non-zero numbers, and reduce fractions to simplest form.",
    summary:
      "Equivalent fractions are fractions that represent the exact same portion of the whole unit, even though they have different numerators and denominators. To find an equivalent fraction, multiply or divide both the numerator and the denominator by the exact same non-zero number.",
    introduction:
      "If you eat half a paratha (1/2), or if you cut the paratha into 4 slices and eat 2 slices (2/4), you have eaten the exact same amount of paratha! Therefore, 1/2 and 2/4 are equivalent fractions. In the same way, 1/2 = 2/4 = 3/6 = 4/8.",
    visualRepresentation: {
      type: "fraction_strip",
      title: "Equivalent Strip Progression (1/2 = 2/4 = 4/8)",
      description:
        "Three strips of equal length: the first divided into 2 parts (1 shaded), the second into 4 parts (2 shaded), the third into 8 parts (4 shaded). The total shaded length is identical across all three.",
      data: {
        strips: [
          { parts: 2, shaded: 1, label: "1/2" },
          { parts: 4, shaded: 2, label: "2/4" },
          { parts: 8, shaded: 4, label: "4/8" },
        ],
      },
    },
    keyRules: [
      "Rule of Equivalence: Multiplying or dividing both numerator and denominator by the SAME non-zero integer never changes the fraction's value: (a × k) / (b × k) = a/b.",
      "Simplest Form (Lowest Terms): A fraction is in simplest form when the only common factor between its numerator and denominator is 1 (they are coprime).",
      "To reduce a fraction to simplest form, divide both the numerator and denominator by their Highest Common Factor (HCF).",
      "Cross-Multiplication Test: Two fractions a/b and c/d are equivalent if and only if a × d = b × c.",
    ],
    workedExamples: [
      {
        id: "we_ef_01",
        problem: "Find an equivalent fraction for 3/5 with denominator 35.",
        steps: [
          "Step 1: Determine what number the original denominator (5) was multiplied by to get 35: 35 ÷ 5 = 7.",
          "Step 2: Multiply the numerator (3) by that same scale factor of 7: 3 × 7 = 21.",
          "Step 3: Combine to form the new equivalent fraction: 21/35.",
        ],
        solution: "3/5 is equivalent to 21/35.",
        tip: "Check using cross-multiplication: 3 × 35 = 105, and 5 × 21 = 105. Since both products equal 105, the fractions are guaranteed equivalent!",
      },
      {
        id: "we_ef_02",
        problem: "Reduce 18/24 to its simplest form (lowest terms).",
        steps: [
          "Step 1: Find the factors of 18: 1, 2, 3, 6, 9, 18.",
          "Step 2: Find the factors of 24: 1, 2, 3, 4, 6, 8, 12, 24.",
          "Step 3: The Highest Common Factor (HCF) is 6.",
          "Step 4: Divide both numerator and denominator by 6: (18 ÷ 6) / (24 ÷ 6) = 3/4.",
        ],
        solution: "The simplest form of 18/24 is 3/4.",
      },
    ],
    commonMistakes: [
      {
        id: "cm_ef_01",
        misconception: "Adding or subtracting the same number from numerator and denominator.",
        correction:
          "Equivalence requires MULTIPLICATION or DIVISION only, never addition or subtraction.",
        explanation:
          "If you take 1/2 and add 2 to both: (1+2)/(2+2) = 3/4. 3/4 (75%) is NOT equal to 1/2 (50%). Adding changes the proportion.",
      },
      {
        id: "cm_ef_02",
        misconception: "Only dividing the numerator or only the denominator.",
        correction:
          "Whatever you do to the numerator, you MUST do to the denominator.",
        explanation:
          "Dividing 18/24 by 6 on the numerator only gives 3/24, which is 1/8, completely changing the value.",
      },
    ],
    estimatedMinutes: 8,
  },

  "adding-fractions": {
    conceptId: "adding-fractions",
    title: "Adding Fractions with Like & Unlike Denominators",
    shortTitle: "Adding Fractions",
    gradeLevel: 7,
    subject: "Mathematics",
    learningObjective:
      "Add fractions with like denominators directly, and add fractions with unlike denominators by converting them into equivalent fractions using the LCM of their denominators.",
    summary:
      "To add fractions with the same denominator, add their numerators and keep the common denominator. To add fractions with different denominators, first convert both fractions into equivalent fractions with a common denominator equal to the LCM of the denominators, then add the numerators.",
    introduction:
      "Think of denominators as units of measurement. You can easily add 2 meters + 3 meters = 5 meters. In the same way, 2/7 + 3/7 = 5/7, because the unit (sevenths) is identical. But what if you need to add 1/4 and 1/6? You cannot combine fourths and sixths directly! You must first convert them into a shared unit using LCM, which is twelfths.",
    visualRepresentation: {
      type: "fraction_strip",
      title: "Common Denominator Transformation",
      description:
        "Converting 1/4 and 1/6 into twelfths: 1/4 becomes 3/12, and 1/6 becomes 2/12. Now both can be added: 3/12 + 2/12 = 5/12.",
      data: {
        term1Original: "1/4",
        term1Converted: "3/12",
        term2Original: "1/6",
        term2Converted: "2/12",
        sum: "5/12",
      },
    },
    keyRules: [
      "Like Denominators: a/c + b/c = (a + b) / c. Never add the denominators!",
      "Unlike Denominators: 1. Find LCM of the denominators. 2. Convert each fraction to an equivalent fraction with the LCM as denominator. 3. Add the numerators. 4. Reduce sum to simplest form.",
      "Check your answer: If the sum is an improper fraction, express it as a mixed fraction if required.",
    ],
    workedExamples: [
      {
        id: "we_af_01",
        problem: "Solve: 2/7 + 3/7 = ?",
        steps: [
          "Step 1: Observe the denominators. Both are 7 (like denominators).",
          "Step 2: Keep the denominator 7 and add the numerators: 2 + 3 = 5.",
          "Step 3: Result is 5/7.",
          "Step 4: Check simplest form. 5 and 7 are prime, so 5/7 is in lowest terms.",
        ],
        solution: "2/7 + 3/7 = 5/7.",
        tip: "Never add the denominators! 2/7 + 3/7 is NEVER 5/14. If you have 2 slices of a 7-slice pizza and get 3 more slices, you have 5 slices of a 7-slice pizza.",
      },
      {
        id: "we_af_02",
        problem: "Solve: 1/4 + 1/6 = ?",
        steps: [
          "Step 1: The denominators are 4 and 6 (unlike denominators).",
          "Step 2: Find the LCM of 4 and 6. Multiples of 4: 4, 8, 12... Multiples of 6: 6, 12... So LCM = 12.",
          "Step 3: Convert 1/4 to twelfths: 12 ÷ 4 = 3, so (1 × 3) / (4 × 3) = 3/12.",
          "Step 4: Convert 1/6 to twelfths: 12 ÷ 6 = 2, so (1 × 2) / (6 × 2) = 2/12.",
          "Step 5: Add the converted fractions: 3/12 + 2/12 = (3 + 2) / 12 = 5/12.",
        ],
        solution: "1/4 + 1/6 = 5/12.",
      },
    ],
    commonMistakes: [
      {
        id: "cm_af_01",
        misconception: "Adding both numerators and denominators: a/b + c/d = (a+c)/(b+d).",
        correction:
          "Denominators are never added. 1/2 + 1/2 = 2/2 = 1 whole, NOT 2/4 (which would be 1/2!).",
        explanation:
          "Adding denominators would mean that adding two positive parts results in a smaller fraction than you started with.",
      },
      {
        id: "cm_af_02",
        misconception: "Using common factors instead of multiples for unlike denominators.",
        correction:
          "You must find the COMMON MULTIPLE (LCM), which is larger than both denominators, not a common factor (HCF).",
        explanation:
          "For 4 and 6, using 2 as the denominator is impossible because 4 and 6 do not divide into 2.",
      },
    ],
    estimatedMinutes: 12,
  },

  "mixed-fractions": {
    conceptId: "mixed-fractions",
    title: "Mixed Numbers & Fraction Word Problems",
    shortTitle: "Mixed Fractions",
    gradeLevel: 7,
    subject: "Mathematics",
    learningObjective:
      "Convert between improper fractions and mixed numbers, add mixed numerals, and solve applied fraction word problems.",
    summary:
      "A mixed number consists of a whole number and a proper fraction (e.g., 2 3/4). An improper fraction has a numerator greater than or equal to its denominator (e.g., 11/4). Both represent the exact same quantity greater than 1. Mixed numbers are easier to visualize in real-world contexts, while improper fractions are often easier for mathematical operations.",
    introduction:
      "If you make 11 quarter-rotis (11/4), how many whole rotis do you have? Every 4 quarters make 1 whole roti. 4 quarters + 4 quarters = 8 quarters (2 whole rotis), leaving 3 quarters remaining. So 11/4 is equal to 2 whole rotis and 3/4 of a roti, written as 2 3/4.",
    visualRepresentation: {
      type: "circle_division",
      title: "Mixed Number Representation (2 3/4 = 11/4)",
      description:
        "Two fully shaded circles (4/4 + 4/4 = 8/4) plus one circle with 3 out of 4 parts shaded (3/4). Total quarters shaded = 4 + 4 + 3 = 11 quarters.",
      data: {
        wholeUnits: 2,
        fractionalNumerator: 3,
        fractionalDenominator: 4,
        improperEquivalent: "11/4",
      },
    },
    keyRules: [
      "Improper to Mixed: Divide numerator by denominator. Quotient = Whole number, Remainder = New numerator, Denominator stays the same.",
      "Mixed to Improper: Multiply whole number by denominator, add numerator: (Whole × Denominator + Numerator) / Denominator.",
      "Adding Mixed Numbers: You can either add the whole numbers and fractions separately, or convert both to improper fractions first.",
      "Always simplify the fractional part of the answer to lowest terms.",
    ],
    workedExamples: [
      {
        id: "we_mf_01",
        problem: "Convert the improper fraction 17/5 into a mixed number.",
        steps: [
          "Step 1: Divide the numerator 17 by the denominator 5.",
          "Step 2: 17 ÷ 5 = 3 with a remainder of 2 (since 5 × 3 = 15, and 17 - 15 = 2).",
          "Step 3: The quotient 3 becomes the whole number.",
          "Step 4: The remainder 2 becomes the numerator, and the denominator remains 5.",
        ],
        solution: "17/5 = 3 2/5.",
        tip: "Quick check: (3 × 5) + 2 = 15 + 2 = 17. Matches the original numerator 17!",
      },
      {
        id: "we_mf_02",
        problem:
          "A recipe calls for 1 1/2 cups of sugar. Sunita already has 3/4 cup. How much more sugar does Sunita need?",
        steps: [
          "Step 1: Understand the operation. Needed amount = Total required - Amount available = 1 1/2 - 3/4.",
          "Step 2: Convert 1 1/2 to an improper fraction: (1 × 2 + 1) / 2 = 3/2.",
          "Step 3: Find common denominator for 3/2 and 3/4. The LCM of 2 and 4 is 4.",
          "Step 4: Convert 3/2 to fourths: (3 × 2) / (2 × 2) = 6/4.",
          "Step 5: Subtract: 6/4 - 3/4 = (6 - 3) / 4 = 3/4.",
        ],
        solution: "Sunita needs 3/4 cup more sugar.",
      },
    ],
    commonMistakes: [
      {
        id: "cm_mf_01",
        misconception: "Multiplying whole number by numerator instead of denominator.",
        correction:
          "Formula for a b/c: (a × c + b) / c. Multiply by the DENOMINATOR (the size of each piece), then add the numerator.",
        explanation:
          "For 3 2/5, each whole has 5 fifths. 3 wholes have 3 × 5 = 15 fifths. Adding 2 fifths gives 17/5.",
      },
      {
        id: "cm_mf_02",
        misconception: "Leaving an improper fraction inside a mixed number (e.g. 2 5/4).",
        correction:
          "The fractional part of a mixed number MUST be a proper fraction. 5/4 is 1 1/4, so 2 5/4 becomes 3 1/4.",
        explanation:
          "5/4 contains a whole unit that must be added to the whole number part.",
      },
    ],
    estimatedMinutes: 10,
  },
};
