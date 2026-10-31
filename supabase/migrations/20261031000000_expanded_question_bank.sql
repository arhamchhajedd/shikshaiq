-- ==============================================================================
-- ShikshaIQ Migration: Expanded Question Bank & Anti-Cheating Seed
-- 25 Additional NCERT Class 7 Questions across 5 Concepts (Total 50 in bank)
-- ==============================================================================

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES
  -- Concept 1: Fraction Basics
  (
    'q_fb_06',
    'fraction-basics',
    'What fraction of an hour is 45 minutes?',
    'easy',
    'single_choice',
    '[
      {"id": "opt_a", "text": "1/2"},
      {"id": "opt_b", "text": "3/4"},
      {"id": "opt_c", "text": "2/3"},
      {"id": "opt_d", "text": "4/5"}
    ]'::JSONB,
    'Calculate fractional units of time.'
  ),
  (
    'q_fb_07',
    'fraction-basics',
    'If a ribbon of length 1 meter is cut into 10 equal pieces, what is the length of 7 such pieces?',
    'easy',
    'single_choice',
    '[
      {"id": "opt_a", "text": "7/10 meter"},
      {"id": "opt_b", "text": "3/10 meter"},
      {"id": "opt_c", "text": "10/7 meters"},
      {"id": "opt_d", "text": "1/7 meter"}
    ]'::JSONB,
    'Model parts of a linear measurement as fractions.'
  ),
  (
    'q_fb_08',
    'fraction-basics',
    'Which of the following fractions is strictly greater than 1 (an improper fraction)?',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "5/6"},
      {"id": "opt_b", "text": "8/8"},
      {"id": "opt_c", "text": "9/7"},
      {"id": "opt_d", "text": "3/4"}
    ]'::JSONB,
    'Identify fractions greater than one whole.'
  ),
  (
    'q_fb_09',
    'fraction-basics',
    'A fruit basket contains 20 apples. 5 of them are green and the remainder are red. What fraction of the apples are red?',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "5/20"},
      {"id": "opt_b", "text": "15/20"},
      {"id": "opt_c", "text": "20/15"},
      {"id": "opt_d", "text": "10/20"}
    ]'::JSONB,
    'Compute fractional subsets in real-world collections.'
  ),
  (
    'q_fb_10',
    'fraction-basics',
    'In a class of 40 students, 3/8 of the students are girls. How many boys are in the class?',
    'hard',
    'single_choice',
    '[
      {"id": "opt_a", "text": "15"},
      {"id": "opt_b", "text": "25"},
      {"id": "opt_c", "text": "20"},
      {"id": "opt_d", "text": "30"}
    ]'::JSONB,
    'Solve multi-step fractional word problems.'
  ),

  -- Concept 2: Common Multiples & LCM
  (
    'q_cm_06',
    'common-multiples',
    'What is the Least Common Multiple (LCM) of 3 and 5?',
    'easy',
    'single_choice',
    '[
      {"id": "opt_a", "text": "8"},
      {"id": "opt_b", "text": "15"},
      {"id": "opt_c", "text": "10"},
      {"id": "opt_d", "text": "12"}
    ]'::JSONB,
    'Find the LCM of two prime integers.'
  ),
  (
    'q_cm_07',
    'common-multiples',
    'What is the smallest common denominator required to add 1/6 and 1/9?',
    'easy',
    'single_choice',
    '[
      {"id": "opt_a", "text": "18"},
      {"id": "opt_b", "text": "54"},
      {"id": "opt_c", "text": "15"},
      {"id": "opt_d", "text": "36"}
    ]'::JSONB,
    'Identify lowest common denominator using LCM.'
  ),
  (
    'q_cm_08',
    'common-multiples',
    'Find the Least Common Multiple (LCM) of 6, 8, and 12.',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "48"},
      {"id": "opt_b", "text": "24"},
      {"id": "opt_c", "text": "72"},
      {"id": "opt_d", "text": "36"}
    ]'::JSONB,
    'Compute LCM across three composite integers.'
  ),
  (
    'q_cm_09',
    'common-multiples',
    'Two bells toll together at 9:00 AM. One tolls every 12 minutes and the other every 18 minutes. At what time will they toll together next?',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "9:30 AM"},
      {"id": "opt_b", "text": "9:36 AM"},
      {"id": "opt_c", "text": "9:48 AM"},
      {"id": "opt_d", "text": "10:00 AM"}
    ]'::JSONB,
    'Apply LCM to periodic scheduling problems.'
  ),
  (
    'q_cm_10',
    'common-multiples',
    'The product of two positive numbers is 180 and their Highest Common Factor (HCF) is 3. What is their LCM?',
    'hard',
    'single_choice',
    '[
      {"id": "opt_a", "text": "60"},
      {"id": "opt_b", "text": "540"},
      {"id": "opt_c", "text": "30"},
      {"id": "opt_d", "text": "90"}
    ]'::JSONB,
    'Use the product formula Product = LCM x HCF.'
  ),

  -- Concept 3: Equivalent Fractions
  (
    'q_ef_06',
    'equivalent-fractions',
    'Which fraction is equivalent to 1/2 with denominator 16?',
    'easy',
    'single_choice',
    '[
      {"id": "opt_a", "text": "8/16"},
      {"id": "opt_b", "text": "4/16"},
      {"id": "opt_c", "text": "6/16"},
      {"id": "opt_d", "text": "2/16"}
    ]'::JSONB,
    'Scale a unit fraction to a designated denominator.'
  ),
  (
    'q_ef_07',
    'equivalent-fractions',
    'What is the fraction 15/25 reduced to its simplest form?',
    'easy',
    'single_choice',
    '[
      {"id": "opt_a", "text": "5/3"},
      {"id": "opt_b", "text": "3/5"},
      {"id": "opt_c", "text": "1/5"},
      {"id": "opt_d", "text": "3/4"}
    ]'::JSONB,
    'Simplify fractions by dividing by the common factor 5.'
  ),
  (
    'q_ef_08',
    'equivalent-fractions',
    'Find the missing denominator to make the fractions equivalent: 4/9 = 28/?',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "54"},
      {"id": "opt_b", "text": "63"},
      {"id": "opt_c", "text": "72"},
      {"id": "opt_d", "text": "36"}
    ]'::JSONB,
    'Compute unknown denominator in equivalent fractions.'
  ),
  (
    'q_ef_09',
    'equivalent-fractions',
    'Which of the following fractions is NOT equivalent to 2/5?',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "4/10"},
      {"id": "opt_b", "text": "6/15"},
      {"id": "opt_c", "text": "8/20"},
      {"id": "opt_d", "text": "10/22"}
    ]'::JSONB,
    'Identify non-equivalent fractions through scaling check.'
  ),
  (
    'q_ef_10',
    'equivalent-fractions',
    'Reduce the fraction 48/72 to its simplest form (lowest terms).',
    'hard',
    'single_choice',
    '[
      {"id": "opt_a", "text": "4/6"},
      {"id": "opt_b", "text": "6/9"},
      {"id": "opt_c", "text": "2/3"},
      {"id": "opt_d", "text": "3/4"}
    ]'::JSONB,
    'Reduce larger numbers using highest common factor (24).'
  ),

  -- Concept 4: Adding Fractions
  (
    'q_af_06',
    'adding-fractions',
    'What is the sum of 2/9 + 4/9?',
    'easy',
    'single_choice',
    '[
      {"id": "opt_a", "text": "6/18"},
      {"id": "opt_b", "text": "6/9"},
      {"id": "opt_c", "text": "8/9"},
      {"id": "opt_d", "text": "2/9"}
    ]'::JSONB,
    'Add like fractions keeping the common denominator.'
  ),
  (
    'q_af_07',
    'adding-fractions',
    'What common denominator should be used to add 1/5 and 2/3?',
    'easy',
    'single_choice',
    '[
      {"id": "opt_a", "text": "8"},
      {"id": "opt_b", "text": "15"},
      {"id": "opt_c", "text": "10"},
      {"id": "opt_d", "text": "20"}
    ]'::JSONB,
    'Determine common denominator for prime denominators.'
  ),
  (
    'q_af_08',
    'adding-fractions',
    'Calculate: 3/10 + 2/5. Express your answer in simplest form.',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "5/15"},
      {"id": "opt_b", "text": "7/10"},
      {"id": "opt_c", "text": "5/10"},
      {"id": "opt_d", "text": "1/2"}
    ]'::JSONB,
    'Add fractions where one denominator is a multiple of the other.'
  ),
  (
    'q_af_09',
    'adding-fractions',
    'A recipe requires 1/3 cup of olive oil and 1/6 cup of lemon juice. What is the total liquid added?',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "2/9 cup"},
      {"id": "opt_b", "text": "1/2 cup"},
      {"id": "opt_c", "text": "3/6 cup"},
      {"id": "opt_d", "text": "2/6 cup"}
    ]'::JSONB,
    'Add unlike fractions in real-world cooking measurements.'
  ),
  (
    'q_af_10',
    'adding-fractions',
    'Evaluate: 5/12 + 7/18. Give your answer in lowest terms.',
    'hard',
    'single_choice',
    '[
      {"id": "opt_a", "text": "12/30"},
      {"id": "opt_b", "text": "29/36"},
      {"id": "opt_c", "text": "31/36"},
      {"id": "opt_d", "text": "17/36"}
    ]'::JSONB,
    'Add unlike fractions requiring composite LCM calculation.'
  ),

  -- Concept 5: Mixed Fractions
  (
    'q_mf_06',
    'mixed-fractions',
    'Which mixed numeral is equivalent to the improper fraction 7/2?',
    'easy',
    'single_choice',
    '[
      {"id": "opt_a", "text": "3 1/2"},
      {"id": "opt_b", "text": "2 1/2"},
      {"id": "opt_c", "text": "3 1/4"},
      {"id": "opt_d", "text": "4 1/2"}
    ]'::JSONB,
    'Convert improper fraction with denominator 2 to mixed numeral.'
  ),
  (
    'q_mf_07',
    'mixed-fractions',
    'Convert the mixed fraction 3 2/5 into an improper fraction.',
    'easy',
    'single_choice',
    '[
      {"id": "opt_a", "text": "17/5"},
      {"id": "opt_b", "text": "15/5"},
      {"id": "opt_c", "text": "11/5"},
      {"id": "opt_d", "text": "21/5"}
    ]'::JSONB,
    'Convert mixed numeral to improper fraction.'
  ),
  (
    'q_mf_08',
    'mixed-fractions',
    'Add the mixed numerals: 2 1/4 + 3 1/4.',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "5 1/2"},
      {"id": "opt_b", "text": "5 2/8"},
      {"id": "opt_c", "text": "6 1/4"},
      {"id": "opt_d", "text": "5 1/4"}
    ]'::JSONB,
    'Add mixed numerals with like denominators and simplify.'
  ),
  (
    'q_mf_09',
    'mixed-fractions',
    'Calculate: 1 2/3 + 2 1/6 = ?',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "3 3/9"},
      {"id": "opt_b", "text": "3 5/6"},
      {"id": "opt_c", "text": "4 1/6"},
      {"id": "opt_d", "text": "3 1/2"}
    ]'::JSONB,
    'Add mixed numerals with unlike denominators using LCM.'
  ),
  (
    'q_mf_10',
    'mixed-fractions',
    'Raman walked 2 1/2 km in the morning and 3 3/4 km in the evening. What is the total distance he walked?',
    'hard',
    'single_choice',
    '[
      {"id": "opt_a", "text": "5 4/6 km"},
      {"id": "opt_b", "text": "6 1/4 km"},
      {"id": "opt_c", "text": "6 1/2 km"},
      {"id": "opt_d", "text": "5 3/4 km"}
    ]'::JSONB,
    'Solve multi-step mixed fraction contextual distance problems.'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Answer Keys for Additional Questions
INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES
  (
    'q_fb_06',
    'opt_b',
    'One hour has 60 minutes. 45 minutes out of 60 is 45/60. Dividing numerator and denominator by 15 gives 3/4.'
  ),
  (
    'q_fb_07',
    'opt_a',
    'When 1 whole meter is divided into 10 equal portions, each portion is 1/10 meter. Taking 7 such portions gives 7/10 meter.'
  ),
  (
    'q_fb_08',
    'opt_c',
    'A fraction is strictly greater than 1 when its numerator is greater than its denominator. In 9/7, 9 > 7, so it represents more than one whole.'
  ),
  (
    'q_fb_09',
    'opt_b',
    'Out of 20 apples, 5 are green, which leaves 20 - 5 = 15 red apples. The fraction of red apples is therefore 15/20 (or 3/4).'
  ),
  (
    'q_fb_10',
    'opt_b',
    'The number of girls is (3/8) × 40 = 15. The remaining students are boys: 40 - 15 = 25 boys (or 5/8 × 40 = 25).'
  ),
  (
    'q_cm_06',
    'opt_b',
    'Both 3 and 5 are prime numbers. Since they have no shared factors other than 1, their LCM is their direct product: 3 × 5 = 15.'
  ),
  (
    'q_cm_07',
    'opt_a',
    'Multiples of 6 are 6, 12, 18, 24... Multiples of 9 are 9, 18, 27... The lowest common multiple is 18.'
  ),
  (
    'q_cm_08',
    'opt_b',
    'Prime factorizations: 6 = 2 × 3, 8 = 2³, 12 = 2² × 3. LCM = 2³ × 3 = 8 × 3 = 24.'
  ),
  (
    'q_cm_09',
    'opt_b',
    'The bells toll together at the LCM of 12 and 18. LCM(12, 18) = 36 minutes. 36 minutes after 9:00 AM is 9:36 AM.'
  ),
  (
    'q_cm_10',
    'opt_a',
    'For any two numbers: Product = LCM × HCF. Therefore, LCM = Product / HCF = 180 / 3 = 60.'
  ),
  (
    'q_ef_06',
    'opt_a',
    'To obtain denominator 16 from 2, multiply both numerator and denominator by 8: (1 × 8) / (2 × 8) = 8/16.'
  ),
  (
    'q_ef_07',
    'opt_b',
    'The Highest Common Factor of 15 and 25 is 5. Dividing both parts by 5 gives (15 ÷ 5) / (25 ÷ 5) = 3/5.'
  ),
  (
    'q_ef_08',
    'opt_b',
    'Since 28 = 4 × 7, we scale the denominator by the same multiplier 7: 9 × 7 = 63. Thus, 4/9 = 28/63.'
  ),
  (
    'q_ef_09',
    'opt_d',
    '4/10 = 2/5, 6/15 = 2/5, and 8/20 = 2/5. However, 10/22 reduces to 5/11, which does not equal 2/5.'
  ),
  (
    'q_ef_10',
    'opt_c',
    'The HCF of 48 and 72 is 24. Dividing numerator and denominator by 24 gives (48 ÷ 24) / (72 ÷ 24) = 2/3.'
  ),
  (
    'q_af_06',
    'opt_b',
    'With common denominator 9, add the numerators: 2 + 4 = 6. Result: 6/9 (which reduces to 2/3).'
  ),
  (
    'q_af_07',
    'opt_b',
    '5 and 3 are coprime numbers. Their lowest common denominator is their product: 5 × 3 = 15.'
  ),
  (
    'q_af_08',
    'opt_b',
    'The LCM of 10 and 5 is 10. Convert 2/5 to tenths: 2/5 = 4/10. Now add: 3/10 + 4/10 = 7/10.'
  ),
  (
    'q_af_09',
    'opt_b',
    'LCM of 3 and 6 is 6. Convert: 1/3 = 2/6 cup. Total = 2/6 + 1/6 = 3/6 cup, which simplifies to 1/2 cup.'
  ),
  (
    'q_af_10',
    'opt_b',
    'LCM of 12 and 18 is 36. Convert: 5/12 = 15/36 and 7/18 = 14/36. Adding yields (15 + 14) / 36 = 29/36.'
  ),
  (
    'q_mf_06',
    'opt_a',
    'Dividing 7 by 2 yields a quotient of 3 with a remainder of 1. Hence, 7/2 = 3 1/2.'
  ),
  (
    'q_mf_07',
    'opt_a',
    'To convert 3 2/5: multiply the whole number by denominator and add numerator: (3 × 5 + 2) / 5 = (15 + 2) / 5 = 17/5.'
  ),
  (
    'q_mf_08',
    'opt_a',
    'Sum whole parts: 2 + 3 = 5. Sum fraction parts: 1/4 + 1/4 = 2/4 = 1/2. Combined: 5 1/2.'
  ),
  (
    'q_mf_09',
    'opt_b',
    'Whole parts: 1 + 2 = 3. Fractional parts: 2/3 + 1/6 = 4/6 + 1/6 = 5/6. Combined: 3 5/6.'
  ),
  (
    'q_mf_10',
    'opt_b',
    'Sum: 2 1/2 + 3 3/4 = 2 2/4 + 3 3/4 = 5 5/4. Since 5/4 = 1 1/4, the total is 5 + 1 1/4 = 6 1/4 km.'
  )
ON CONFLICT (question_id) DO NOTHING;
