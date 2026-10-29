-- ==============================================================================
-- ShikshaIQ: Phase 04 Schema Migration
-- 1. Student Lesson Completions Table & RLS
-- 2. Concept Lessons Table & RLS
-- 3. Student Attempts attempt_type Column
-- 4. Seed Concept Lessons (5 Class 7 Fractions Concepts)
-- 5. Seed Additional Practice Questions & Protected Answer Keys (10 Questions)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Student Lesson Completions
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.student_lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  concept_id TEXT NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_lesson_completion UNIQUE (student_id, concept_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_comp_student ON public.student_lesson_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_comp_concept ON public.student_lesson_completions(concept_id);

ALTER TABLE public.student_lesson_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students read own lesson completions"
  ON public.student_lesson_completions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students insert own lesson completions"
  ON public.student_lesson_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers view supervised student completions"
  ON public.student_lesson_completions
  FOR SELECT
  TO authenticated
  USING (public.is_teacher_of_student(student_id));

CREATE POLICY "Admins manage all lesson completions"
  ON public.student_lesson_completions
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 2. Concept Lessons Table (Public Curriculum Content)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.concept_lessons (
  concept_id TEXT PRIMARY KEY REFERENCES public.concepts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  short_title TEXT NOT NULL,
  grade_level INTEGER NOT NULL DEFAULT 7 CHECK (grade_level >= 1 AND grade_level <= 12),
  subject TEXT NOT NULL DEFAULT 'Mathematics',
  learning_objective TEXT NOT NULL,
  summary TEXT NOT NULL,
  introduction TEXT NOT NULL,
  visual_representation JSONB NOT NULL,
  key_rules JSONB NOT NULL,
  worked_examples JSONB NOT NULL,
  common_mistakes JSONB NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.concept_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view curriculum lessons"
  ON public.concept_lessons
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins manage curriculum lessons"
  ON public.concept_lessons
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. Student Attempts attempt_type Column
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'student_attempts' AND column_name = 'attempt_type'
  ) THEN
    ALTER TABLE public.student_attempts 
      ADD COLUMN attempt_type TEXT NOT NULL DEFAULT 'diagnostic' 
      CHECK (attempt_type IN ('diagnostic', 'practice', 'concept_test'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_attempts_type ON public.student_attempts(student_id, attempt_type);

-- ------------------------------------------------------------------------------
-- 4. Seed Concept Lessons (5 Class 7 Fractions Concepts)
-- ------------------------------------------------------------------------------

INSERT INTO public.concept_lessons (
  concept_id,
  title,
  short_title,
  grade_level,
  subject,
  learning_objective,
  summary,
  introduction,
  visual_representation,
  key_rules,
  worked_examples,
  common_mistakes,
  estimated_minutes
) VALUES
  (
    'fraction-basics',
    'Fraction Basics & Representation',
    'Fraction Basics',
    7,
    'Mathematics',
    'Understand the meaning of numerator and denominator, represent fractions as parts of a whole unit, and identify proper and improper fractions.',
    'A fraction represents one or more equal parts of a whole object or collection. The denominator indicates how many equal parts the whole is partitioned into, and the numerator indicates how many of those parts are selected.',
    'In daily life, we constantly share objects like rotis, pizzas, or chocolate bars. When an object is divided into equal parts, each part is a fraction. If you cut an apple into 4 equal slices and eat 1 slice, you have eaten 1 out of 4 parts, written mathematically as 1/4.',
    '{"type": "fraction_strip", "title": "Fraction Strip Model (5/8)", "description": "A whole unit divided into 8 equal parts with 5 parts shaded.", "data": {"totalParts": 8, "shadedParts": 5, "fractionLabel": "5/8"}}'::JSONB,
    '[
      "Denominator (bottom number): The total number of equal parts that make up one whole unit. It can never be zero.",
      "Numerator (top number): The number of equal parts being considered, counted, or selected.",
      "Proper Fraction: The numerator is strictly less than the denominator (e.g., 3/5 < 1). The value is less than 1 whole.",
      "Improper Fraction: The numerator is greater than or equal to the denominator (e.g., 7/4 > 1, 4/4 = 1). The value is 1 whole or more."
    ]'::JSONB,
    '[
      {
        "id": "we_fb_01",
        "problem": "In a Class 7 mathematics test with 12 equal-mark questions, Rohan solved 9 questions correctly. What fraction of the test did Rohan solve correctly, and what fraction was left unsolved?",
        "steps": [
          "Step 1: Identify the whole unit. The entire test consists of 12 equal questions, so the denominator is 12.",
          "Step 2: Identify the selected parts. Rohan answered 9 questions correctly, so the numerator for correct questions is 9. The fraction is 9/12.",
          "Step 3: Calculate remaining questions: 12 - 9 = 3.",
          "Step 4: Form the unsolved fraction: 3/12."
        ],
        "solution": "Rohan solved 9/12 of the test correctly (simplifies to 3/4), and 3/12 was left unsolved (simplifies to 1/4)."
      }
    ]'::JSONB,
    '[
      {
        "id": "cm_fb_01",
        "misconception": "Inverting the numerator and denominator.",
        "correction": "Top = Parts taken, Bottom = Total equal parts. Eating 3 of 8 slices is 3/8, never 8/3.",
        "explanation": "8/3 represents 8 parts of a 3-part whole, which is more than two whole objects."
      }
    ]'::JSONB,
    8
  ),
  (
    'common-multiples',
    'Factors & Common Multiples (LCM)',
    'Common Multiples',
    7,
    'Mathematics',
    'Find multiples of whole numbers and compute the Least Common Multiple (LCM) of two or more numbers using prime factorization and division.',
    'A multiple of a number is the product of that number and any positive integer. The Least Common Multiple (LCM) is the smallest non-zero number that is a multiple of all of them. Finding the LCM is the foundational prerequisite for adding and subtracting fractions with unlike denominators.',
    'Imagine two bells at an Indian school. Bell A rings every 4 minutes, and Bell B rings every 6 minutes. When will both bells ring together? Bell A rings at 4, 8, 12, 16... Bell B rings at 6, 12, 18... Both ring together at 12 minutes! In mathematics, 12 is the Least Common Multiple (LCM) of 4 and 6.',
    '{"type": "grid", "title": "Multiples Comparison Line", "description": "Multiples of 4 and 6 meeting at 12.", "data": {"numberA": 4, "multiplesA": [4, 8, 12, 16, 20], "numberB": 6, "multiplesB": [6, 12, 18, 24], "lcm": 12}}'::JSONB,
    '[
      "A multiple is found by multiplying a number by 1, 2, 3, 4, etc.",
      "The Least Common Multiple (LCM) is the smallest shared multiple.",
      "For Coprime Numbers (like 3 and 5), the LCM is simply their direct product: 3 × 5 = 15.",
      "Division Method: Write numbers in a row, divide by prime factors, and multiply all divisors."
    ]'::JSONB,
    '[
      {
        "id": "we_cm_01",
        "problem": "Find the Least Common Multiple (LCM) of 6 and 8 using prime division.",
        "steps": [
          "Step 1: Write (6, 8) in a row.",
          "Step 2: Divide both by 2: (3, 4).",
          "Step 3: Divide by 2: (3, 2).",
          "Step 4: Divide by 2: (3, 1).",
          "Step 5: Divide by 3: (1, 1).",
          "Step 6: Multiply all prime divisors: 2 × 2 × 2 × 3 = 24."
        ],
        "solution": "The LCM of 6 and 8 is 24."
      }
    ]'::JSONB,
    '[
      {
        "id": "cm_cm_01",
        "misconception": "Always multiplying the numbers together instead of finding the LCM.",
        "correction": "For 4 and 6, multiplying gives 24, but the true LCM is 12.",
        "explanation": "Multiplying works as a common denominator, but using the true LCM keeps numbers smaller."
      }
    ]'::JSONB,
    10
  ),
  (
    'equivalent-fractions',
    'Equivalent Fractions & Simplification',
    'Equivalent Fractions',
    7,
    'Mathematics',
    'Generate equivalent fractions by multiplying or dividing numerator and denominator by non-zero numbers, and reduce fractions to simplest form.',
    'Equivalent fractions represent the exact same portion of the whole unit, even though they have different numerators and denominators. To find an equivalent fraction, multiply or divide both the numerator and the denominator by the exact same non-zero number.',
    'If you eat half a paratha (1/2), or if you cut the paratha into 4 slices and eat 2 slices (2/4), you have eaten the exact same amount of paratha! Therefore, 1/2 and 2/4 are equivalent fractions.',
    '{"type": "fraction_strip", "title": "Equivalent Strip Progression (1/2 = 2/4 = 4/8)", "description": "Three strips showing identical shaded length.", "data": {"strips": [{"parts": 2, "shaded": 1}, {"parts": 4, "shaded": 2}, {"parts": 8, "shaded": 4}]}}'::JSONB,
    '[
      "Rule of Equivalence: (a × k) / (b × k) = a/b.",
      "Simplest Form: A fraction is in lowest terms when HCF of numerator and denominator is 1.",
      "Cross-Multiplication Test: a/b = c/d if and only if a × d = b × c."
    ]'::JSONB,
    '[
      {
        "id": "we_ef_01",
        "problem": "Find an equivalent fraction for 3/5 with denominator 35.",
        "steps": [
          "Step 1: Scale factor for denominator: 35 ÷ 5 = 7.",
          "Step 2: Multiply numerator by 7: 3 × 7 = 21.",
          "Step 3: Combine: 21/35."
        ],
        "solution": "3/5 is equivalent to 21/35."
      }
    ]'::JSONB,
    '[
      {
        "id": "cm_ef_01",
        "misconception": "Adding the same number to numerator and denominator.",
        "correction": "Equivalence requires MULTIPLICATION or DIVISION only, never addition.",
        "explanation": "(1+2)/(2+2) = 3/4, which is 75%, not 50% (1/2)."
      }
    ]'::JSONB,
    8
  ),
  (
    'adding-fractions',
    'Adding Fractions with Like & Unlike Denominators',
    'Adding Fractions',
    7,
    'Mathematics',
    'Add fractions with like denominators directly, and add fractions with unlike denominators by converting them into equivalent fractions using the LCM of their denominators.',
    'To add fractions with the same denominator, add their numerators and keep the common denominator. To add fractions with different denominators, first convert both fractions into equivalent fractions with a common denominator equal to the LCM, then add the numerators.',
    'Think of denominators as units. You can add 2 meters + 3 meters = 5 meters. Likewise, 2/7 + 3/7 = 5/7. But for 1/4 + 1/6, you must first convert fourths and sixths into a shared unit: twelfths.',
    '{"type": "fraction_strip", "title": "Common Denominator Transformation", "description": "1/4 (3/12) + 1/6 (2/12) = 5/12.", "data": {"term1": "3/12", "term2": "2/12", "sum": "5/12"}}'::JSONB,
    '[
      "Like Denominators: a/c + b/c = (a + b) / c. Never add the denominators!",
      "Unlike Denominators: Find LCM -> Convert each to equivalent fraction with LCM -> Add numerators -> Simplify."
    ]'::JSONB,
    '[
      {
        "id": "we_af_01",
        "problem": "Solve: 1/4 + 1/6 = ?",
        "steps": [
          "Step 1: LCM of 4 and 6 is 12.",
          "Step 2: Convert 1/4 = 3/12.",
          "Step 3: Convert 1/6 = 2/12.",
          "Step 4: Add: 3/12 + 2/12 = 5/12."
        ],
        "solution": "1/4 + 1/6 = 5/12."
      }
    ]'::JSONB,
    '[
      {
        "id": "cm_af_01",
        "misconception": "Adding both numerators and denominators: 1/2 + 1/2 = 2/4.",
        "correction": "Denominators are never added. 1/2 + 1/2 = 2/2 = 1 whole.",
        "explanation": "Adding denominators makes the result smaller than the starting numbers."
      }
    ]'::JSONB,
    12
  ),
  (
    'mixed-fractions',
    'Mixed Numbers & Fraction Word Problems',
    'Mixed Fractions',
    7,
    'Mathematics',
    'Convert between improper fractions and mixed numbers, add mixed numerals, and solve applied fraction word problems.',
    'A mixed number consists of a whole number and a proper fraction (e.g., 2 3/4). An improper fraction has a numerator greater than or equal to its denominator (e.g., 11/4). Both represent the exact same quantity greater than 1.',
    'If you have 11 quarter-rotis (11/4), how many whole rotis do you have? 4 quarters make 1 whole. 8 quarters make 2 wholes, with 3 quarters left over. Thus, 11/4 = 2 3/4.',
    '{"type": "circle_division", "title": "Mixed Number Model (2 3/4 = 11/4)", "description": "Two full units plus 3/4 unit.", "data": {"whole": 2, "fraction": "3/4", "improper": "11/4"}}'::JSONB,
    '[
      "Improper to Mixed: Divide numerator by denominator. Quotient = Whole, Remainder = Numerator.",
      "Mixed to Improper: (Whole × Denominator + Numerator) / Denominator.",
      "Add whole numbers and fractional parts, then simplify."
    ]'::JSONB,
    '[
      {
        "id": "we_mf_01",
        "problem": "Convert 17/5 into a mixed number.",
        "steps": [
          "Step 1: Divide 17 by 5: 17 ÷ 5 = 3 with remainder 2.",
          "Step 2: Quotient 3 is the whole number.",
          "Step 3: Remainder 2 is the numerator: 3 2/5."
        ],
        "solution": "17/5 = 3 2/5."
      }
    ]'::JSONB,
    '[
      {
        "id": "cm_mf_01",
        "misconception": "Multiplying whole number by numerator instead of denominator.",
        "correction": "Formula: (Whole × Denominator + Numerator) / Denominator.",
        "explanation": "For 3 2/5: 3 wholes have 3 × 5 = 15 fifths. Plus 2 fifths gives 17/5."
      }
    ]'::JSONB,
    10
  )
ON CONFLICT (concept_id) DO UPDATE SET
  title = EXCLUDED.title,
  short_title = EXCLUDED.short_title,
  grade_level = EXCLUDED.grade_level,
  subject = EXCLUDED.subject,
  learning_objective = EXCLUDED.learning_objective,
  summary = EXCLUDED.summary,
  introduction = EXCLUDED.introduction,
  visual_representation = EXCLUDED.visual_representation,
  key_rules = EXCLUDED.key_rules,
  worked_examples = EXCLUDED.worked_examples,
  common_mistakes = EXCLUDED.common_mistakes,
  estimated_minutes = EXCLUDED.estimated_minutes,
  updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 5. Seed Additional Practice Questions (10 Questions, 2 per concept)
-- ------------------------------------------------------------------------------

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES
  -- Concept 1: Fraction Basics
  (
    'q_fb_04',
    'fraction-basics',
    'A pizza is cut into 12 equal slices. If Meera eats 3 slices, what fraction of the pizza is left uneaten?',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "9/12"},
      {"id": "opt_b", "text": "3/12"},
      {"id": "opt_c", "text": "12/9"},
      {"id": "opt_d", "text": "6/12"}
    ]'::JSONB,
    'Compute the remaining fractional parts of a whole unit.'
  ),
  (
    'q_fb_05',
    'fraction-basics',
    'On a number line from 0 to 1 divided into 5 equal segments, which mark represents the fraction 4/5?',
    'easy',
    'single_choice',
    '[
      {"id": "opt_a", "text": "The 1st mark from 0"},
      {"id": "opt_b", "text": "The 4th mark from 0"},
      {"id": "opt_c", "text": "The 5th mark from 0"},
      {"id": "opt_d", "text": "The midpoint between 0 and 1"}
    ]'::JSONB,
    'Locate and identify fractions on a segmented number line.'
  ),

  -- Concept 2: Common Multiples
  (
    'q_cm_04',
    'common-multiples',
    'What is the Least Common Multiple (LCM) of 8 and 12?',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "24"},
      {"id": "opt_b", "text": "48"},
      {"id": "opt_c", "text": "4"},
      {"id": "opt_d", "text": "96"}
    ]'::JSONB,
    'Calculate the LCM of two composite integers.'
  ),
  (
    'q_cm_05',
    'common-multiples',
    'Two traffic lights turn green every 15 seconds and 20 seconds respectively. If they both turn green simultaneously, after how many seconds will they turn green together again?',
    'hard',
    'single_choice',
    '[
      {"id": "opt_a", "text": "30 seconds"},
      {"id": "opt_b", "text": "60 seconds"},
      {"id": "opt_c", "text": "300 seconds"},
      {"id": "opt_d", "text": "35 seconds"}
    ]'::JSONB,
    'Apply LCM to solve real-world periodic interval problems.'
  ),

  -- Concept 3: Equivalent Fractions
  (
    'q_ef_04',
    'equivalent-fractions',
    'Which pair of fractions below are equivalent to each other?',
    'easy',
    'single_choice',
    '[
      {"id": "opt_a", "text": "2/3 and 8/12"},
      {"id": "opt_b", "text": "3/5 and 6/15"},
      {"id": "opt_c", "text": "4/7 and 8/21"},
      {"id": "opt_d", "text": "1/4 and 3/8"}
    ]'::JSONB,
    'Identify equivalent fractions using proportional scaling.'
  ),
  (
    'q_ef_05',
    'equivalent-fractions',
    'Reduce the fraction 35/49 to its simplest form (lowest terms).',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "7/5"},
      {"id": "opt_b", "text": "5/7"},
      {"id": "opt_c", "text": "5/9"},
      {"id": "opt_d", "text": "1/7"}
    ]'::JSONB,
    'Simplify a fraction by dividing by the highest common factor.'
  ),

  -- Concept 4: Adding Fractions
  (
    'q_af_04',
    'adding-fractions',
    'Calculate: 3/8 + 1/4 = ?',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "4/12"},
      {"id": "opt_b", "text": "5/8"},
      {"id": "opt_c", "text": "4/8"},
      {"id": "opt_d", "text": "7/8"}
    ]'::JSONB,
    'Add fractions when one denominator is a multiple of the other.'
  ),
  (
    'q_af_05',
    'adding-fractions',
    'Solve: 2/3 + 3/5 = ?',
    'hard',
    'single_choice',
    '[
      {"id": "opt_a", "text": "5/8"},
      {"id": "opt_b", "text": "19/15"},
      {"id": "opt_c", "text": "11/15"},
      {"id": "opt_d", "text": "6/15"}
    ]'::JSONB,
    'Add fractions with coprime denominators and convert to common terms.'
  ),

  -- Concept 5: Mixed Fractions
  (
    'q_mf_04',
    'mixed-fractions',
    'Convert the mixed numeral 4 3/7 into an improper fraction.',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "19/7"},
      {"id": "opt_b", "text": "31/7"},
      {"id": "opt_c", "text": "28/7"},
      {"id": "opt_d", "text": "12/7"}
    ]'::JSONB,
    'Convert a mixed numeral into an improper fraction.'
  ),
  (
    'q_mf_05',
    'mixed-fractions',
    'Calculate: 2 1/3 + 1 1/6 = ?',
    'hard',
    'single_choice',
    '[
      {"id": "opt_a", "text": "3 2/9"},
      {"id": "opt_b", "text": "3 1/2"},
      {"id": "opt_c", "text": "3 2/6"},
      {"id": "opt_d", "text": "4 1/2"}
    ]'::JSONB,
    'Add mixed numbers with unlike denominators and simplify.'
  )
ON CONFLICT (id) DO UPDATE SET
  concept_id = EXCLUDED.concept_id,
  prompt = EXCLUDED.prompt,
  difficulty = EXCLUDED.difficulty,
  options = EXCLUDED.options,
  learning_objective = EXCLUDED.learning_objective,
  updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 6. Seed Protected Answer Keys for Additional Questions
-- ------------------------------------------------------------------------------

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES
  (
    'q_fb_04',
    'opt_a',
    'The whole pizza had 12 equal slices. Since 3 slices were eaten, 12 - 3 = 9 slices remain. The fraction of pizza left uneaten is 9/12 (which reduces to 3/4).'
  ),
  (
    'q_fb_05',
    'opt_b',
    'When a unit distance from 0 to 1 is divided into 5 equal parts, each mark represents 1/5, 2/5, 3/5, 4/5, and 5/5 (1). The 4th mark from 0 represents exactly 4/5.'
  ),
  (
    'q_cm_04',
    'opt_a',
    'Multiples of 8: 8, 16, 24, 32... Multiples of 12: 12, 24, 36... The lowest common multiple shared by both numbers is 24.'
  ),
  (
    'q_cm_05',
    'opt_b',
    'The next simultaneous green light occurs at the Least Common Multiple of the two cycle periods: LCM(15, 20). 15 = 3 × 5, 20 = 2² × 5. LCM = 2² × 3 × 5 = 60 seconds.'
  ),
  (
    'q_ef_04',
    'opt_a',
    'Multiplying both the numerator and denominator of 2/3 by 4 gives (2 × 4) / (3 × 4) = 8/12. Since they represent the exact same value, 2/3 and 8/12 are equivalent.'
  ),
  (
    'q_ef_05',
    'opt_b',
    'The Highest Common Factor (HCF) of 35 and 49 is 7. Dividing both terms by 7 gives (35 ÷ 7) / (49 ÷ 7) = 5/7.'
  ),
  (
    'q_af_04',
    'opt_b',
    'The LCM of denominators 8 and 4 is 8. Convert 1/4 to eighths: (1 × 2) / (4 × 2) = 2/8. Now add numerators: 3/8 + 2/8 = 5/8.'
  ),
  (
    'q_af_05',
    'opt_b',
    '3 and 5 are coprime, so their LCM is 3 × 5 = 15. Convert each: 2/3 = 10/15 and 3/5 = 9/15. Adding gives (10 + 9) / 15 = 19/15 (or 1 4/15 as a mixed fraction).'
  ),
  (
    'q_mf_04',
    'opt_b',
    'To convert a mixed number a b/c to an improper fraction: (a × c + b) / c. For 4 3/7: (4 × 7 + 3) / 7 = (28 + 3) / 7 = 31/7.'
  ),
  (
    'q_mf_05',
    'opt_b',
    'Add whole numbers: 2 + 1 = 3. Add fractional parts: 1/3 + 1/6. LCM of 3 and 6 is 6. 1/3 = 2/6. 2/6 + 1/6 = 3/6 = 1/2. Combining gives 3 1/2.'
  )
ON CONFLICT (question_id) DO UPDATE SET
  correct_option_id = EXCLUDED.correct_option_id,
  explanation = EXCLUDED.explanation,
  updated_at = NOW();
