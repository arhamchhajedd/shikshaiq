-- ==============================================================================
-- ShikshaIQ Migration: Expanded Question Bank & Anti-Cheating Seed
-- 25 Additional NCERT Class 7 Questions across 5 Concepts (Total 50 in bank)
-- Safe single-row INSERTs to avoid multi-value syntax errors
-- ==============================================================================

-- ---- CONCEPT 1: Fraction Basics ----

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_fb_06',
  'fraction-basics',
  'What fraction of an hour is 45 minutes?',
  'easy',
  'single_choice',
  '[{"id":"opt_a","text":"1/2"},{"id":"opt_b","text":"3/4"},{"id":"opt_c","text":"2/3"},{"id":"opt_d","text":"4/5"}]'::JSONB,
  'Calculate fractional units of time.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_fb_07',
  'fraction-basics',
  'If a ribbon of length 1 meter is cut into 10 equal pieces, what is the length of 7 such pieces?',
  'easy',
  'single_choice',
  '[{"id":"opt_a","text":"7/10 meter"},{"id":"opt_b","text":"3/10 meter"},{"id":"opt_c","text":"10/7 meters"},{"id":"opt_d","text":"1/7 meter"}]'::JSONB,
  'Model parts of a linear measurement as fractions.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_fb_08',
  'fraction-basics',
  'Which of the following fractions is strictly greater than 1 (an improper fraction)?',
  'medium',
  'single_choice',
  '[{"id":"opt_a","text":"5/6"},{"id":"opt_b","text":"8/8"},{"id":"opt_c","text":"9/7"},{"id":"opt_d","text":"3/4"}]'::JSONB,
  'Identify fractions greater than one whole.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_fb_09',
  'fraction-basics',
  'A fruit basket contains 20 apples. 5 of them are green and the remainder are red. What fraction of the apples are red?',
  'medium',
  'single_choice',
  '[{"id":"opt_a","text":"5/20"},{"id":"opt_b","text":"15/20"},{"id":"opt_c","text":"20/15"},{"id":"opt_d","text":"10/20"}]'::JSONB,
  'Compute fractional subsets in real-world collections.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_fb_10',
  'fraction-basics',
  'In a class of 40 students, 3/8 of the students are girls. How many boys are in the class?',
  'hard',
  'single_choice',
  '[{"id":"opt_a","text":"15"},{"id":"opt_b","text":"25"},{"id":"opt_c","text":"20"},{"id":"opt_d","text":"30"}]'::JSONB,
  'Solve multi-step fractional word problems.'
) ON CONFLICT (id) DO NOTHING;

-- ---- CONCEPT 2: Common Multiples & LCM ----

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_cm_06',
  'common-multiples',
  'What is the Least Common Multiple (LCM) of 3 and 5?',
  'easy',
  'single_choice',
  '[{"id":"opt_a","text":"8"},{"id":"opt_b","text":"15"},{"id":"opt_c","text":"10"},{"id":"opt_d","text":"12"}]'::JSONB,
  'Find the LCM of two prime integers.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_cm_07',
  'common-multiples',
  'What is the smallest common denominator required to add 1/6 and 1/9?',
  'easy',
  'single_choice',
  '[{"id":"opt_a","text":"18"},{"id":"opt_b","text":"54"},{"id":"opt_c","text":"15"},{"id":"opt_d","text":"36"}]'::JSONB,
  'Identify lowest common denominator using LCM.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_cm_08',
  'common-multiples',
  'Find the Least Common Multiple (LCM) of 6, 8, and 12.',
  'medium',
  'single_choice',
  '[{"id":"opt_a","text":"48"},{"id":"opt_b","text":"24"},{"id":"opt_c","text":"72"},{"id":"opt_d","text":"36"}]'::JSONB,
  'Compute LCM across three composite integers.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_cm_09',
  'common-multiples',
  'Two bells toll together at 9:00 AM. One tolls every 12 minutes and the other every 18 minutes. At what time will they toll together next?',
  'medium',
  'single_choice',
  '[{"id":"opt_a","text":"9:30 AM"},{"id":"opt_b","text":"9:36 AM"},{"id":"opt_c","text":"9:48 AM"},{"id":"opt_d","text":"10:00 AM"}]'::JSONB,
  'Apply LCM to periodic scheduling problems.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_cm_10',
  'common-multiples',
  'The product of two positive numbers is 180 and their Highest Common Factor (HCF) is 3. What is their LCM?',
  'hard',
  'single_choice',
  '[{"id":"opt_a","text":"60"},{"id":"opt_b","text":"540"},{"id":"opt_c","text":"30"},{"id":"opt_d","text":"90"}]'::JSONB,
  'Use the product formula Product = LCM x HCF.'
) ON CONFLICT (id) DO NOTHING;

-- ---- CONCEPT 3: Equivalent Fractions ----

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_ef_06',
  'equivalent-fractions',
  'Which fraction is equivalent to 1/2 with denominator 16?',
  'easy',
  'single_choice',
  '[{"id":"opt_a","text":"8/16"},{"id":"opt_b","text":"4/16"},{"id":"opt_c","text":"6/16"},{"id":"opt_d","text":"2/16"}]'::JSONB,
  'Scale a unit fraction to a designated denominator.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_ef_07',
  'equivalent-fractions',
  'What is the fraction 15/25 reduced to its simplest form?',
  'easy',
  'single_choice',
  '[{"id":"opt_a","text":"5/3"},{"id":"opt_b","text":"3/5"},{"id":"opt_c","text":"1/5"},{"id":"opt_d","text":"3/4"}]'::JSONB,
  'Simplify fractions by dividing by the common factor 5.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_ef_08',
  'equivalent-fractions',
  'Find the missing denominator to make the fractions equivalent: 4/9 = 28/?',
  'medium',
  'single_choice',
  '[{"id":"opt_a","text":"54"},{"id":"opt_b","text":"63"},{"id":"opt_c","text":"72"},{"id":"opt_d","text":"36"}]'::JSONB,
  'Compute unknown denominator in equivalent fractions.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_ef_09',
  'equivalent-fractions',
  'Which of the following fractions is NOT equivalent to 2/5?',
  'medium',
  'single_choice',
  '[{"id":"opt_a","text":"4/10"},{"id":"opt_b","text":"6/15"},{"id":"opt_c","text":"8/20"},{"id":"opt_d","text":"10/22"}]'::JSONB,
  'Identify non-equivalent fractions through scaling check.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_ef_10',
  'equivalent-fractions',
  'Reduce the fraction 48/72 to its simplest form (lowest terms).',
  'hard',
  'single_choice',
  '[{"id":"opt_a","text":"4/6"},{"id":"opt_b","text":"6/9"},{"id":"opt_c","text":"2/3"},{"id":"opt_d","text":"3/4"}]'::JSONB,
  'Reduce larger numbers using highest common factor (24).'
) ON CONFLICT (id) DO NOTHING;

-- ---- CONCEPT 4: Adding Fractions ----

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_af_06',
  'adding-fractions',
  'What is the sum of 2/9 + 4/9?',
  'easy',
  'single_choice',
  '[{"id":"opt_a","text":"6/18"},{"id":"opt_b","text":"6/9"},{"id":"opt_c","text":"8/9"},{"id":"opt_d","text":"2/9"}]'::JSONB,
  'Add like fractions keeping the common denominator.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_af_07',
  'adding-fractions',
  'What common denominator should be used to add 1/5 and 2/3?',
  'easy',
  'single_choice',
  '[{"id":"opt_a","text":"8"},{"id":"opt_b","text":"15"},{"id":"opt_c","text":"10"},{"id":"opt_d","text":"20"}]'::JSONB,
  'Determine common denominator for prime denominators.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_af_08',
  'adding-fractions',
  'Calculate: 3/10 + 2/5. Express your answer in simplest form.',
  'medium',
  'single_choice',
  '[{"id":"opt_a","text":"5/15"},{"id":"opt_b","text":"7/10"},{"id":"opt_c","text":"5/10"},{"id":"opt_d","text":"1/2"}]'::JSONB,
  'Add fractions where one denominator is a multiple of the other.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_af_09',
  'adding-fractions',
  'A recipe requires 1/3 cup of olive oil and 1/6 cup of lemon juice. What is the total liquid added?',
  'medium',
  'single_choice',
  '[{"id":"opt_a","text":"2/9 cup"},{"id":"opt_b","text":"1/2 cup"},{"id":"opt_c","text":"3/6 cup"},{"id":"opt_d","text":"2/6 cup"}]'::JSONB,
  'Add unlike fractions in real-world cooking measurements.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_af_10',
  'adding-fractions',
  'Evaluate: 5/12 + 7/18. Give your answer in lowest terms.',
  'hard',
  'single_choice',
  '[{"id":"opt_a","text":"12/30"},{"id":"opt_b","text":"29/36"},{"id":"opt_c","text":"31/36"},{"id":"opt_d","text":"17/36"}]'::JSONB,
  'Add unlike fractions requiring composite LCM calculation.'
) ON CONFLICT (id) DO NOTHING;

-- ---- CONCEPT 5: Mixed Fractions ----

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_mf_06',
  'mixed-fractions',
  'Which mixed numeral is equivalent to the improper fraction 7/2?',
  'easy',
  'single_choice',
  '[{"id":"opt_a","text":"3 1/2"},{"id":"opt_b","text":"2 1/2"},{"id":"opt_c","text":"3 1/4"},{"id":"opt_d","text":"4 1/2"}]'::JSONB,
  'Convert improper fraction with denominator 2 to mixed numeral.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_mf_07',
  'mixed-fractions',
  'Convert the mixed fraction 3 2/5 into an improper fraction.',
  'easy',
  'single_choice',
  '[{"id":"opt_a","text":"17/5"},{"id":"opt_b","text":"15/5"},{"id":"opt_c","text":"11/5"},{"id":"opt_d","text":"21/5"}]'::JSONB,
  'Convert mixed numeral to improper fraction.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_mf_08',
  'mixed-fractions',
  'Add the mixed numerals: 2 1/4 + 3 1/4.',
  'medium',
  'single_choice',
  '[{"id":"opt_a","text":"5 1/2"},{"id":"opt_b","text":"5 2/8"},{"id":"opt_c","text":"6 1/4"},{"id":"opt_d","text":"5 1/4"}]'::JSONB,
  'Add mixed numerals with like denominators and simplify.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_mf_09',
  'mixed-fractions',
  'Calculate: 1 2/3 + 2 1/6 = ?',
  'medium',
  'single_choice',
  '[{"id":"opt_a","text":"3 3/9"},{"id":"opt_b","text":"3 5/6"},{"id":"opt_c","text":"4 1/6"},{"id":"opt_d","text":"3 1/2"}]'::JSONB,
  'Add mixed numerals with unlike denominators using LCM.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES (
  'q_mf_10',
  'mixed-fractions',
  'Raman walked 2 1/2 km in the morning and 3 3/4 km in the evening. What is the total distance he walked?',
  'hard',
  'single_choice',
  '[{"id":"opt_a","text":"5 4/6 km"},{"id":"opt_b","text":"6 1/4 km"},{"id":"opt_c","text":"6 1/2 km"},{"id":"opt_d","text":"5 3/4 km"}]'::JSONB,
  'Solve multi-step mixed fraction contextual distance problems.'
) ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- Answer Keys
-- ==============================================================================

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_fb_06', 'opt_b', 'One hour has 60 minutes. 45/60 = 3/4 after dividing by 15.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_fb_07', 'opt_a', '1 meter divided into 10 equal pieces: each = 1/10 m. Seven pieces = 7/10 m.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_fb_08', 'opt_c', 'A fraction > 1 has numerator > denominator. In 9/7, 9 > 7.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_fb_09', 'opt_b', '20 - 5 = 15 red apples. Fraction = 15/20 (= 3/4).')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_fb_10', 'opt_b', 'Girls = 3/8 x 40 = 15. Boys = 40 - 15 = 25.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_cm_06', 'opt_b', '3 and 5 are coprime. LCM = 3 x 5 = 15.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_cm_07', 'opt_a', 'Multiples of 6: 6,12,18. Multiples of 9: 9,18. LCM = 18.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_cm_08', 'opt_b', '6=2x3, 8=2^3, 12=2^2x3. LCM = 2^3 x 3 = 24.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_cm_09', 'opt_b', 'LCM(12,18) = 36 minutes. 9:00 AM + 36 min = 9:36 AM.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_cm_10', 'opt_a', 'LCM = Product / HCF = 180 / 3 = 60.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_ef_06', 'opt_a', '1/2 x (8/8) = 8/16.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_ef_07', 'opt_b', 'HCF(15,25)=5. 15/25 = 3/5.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_ef_08', 'opt_b', '28 = 4x7, so denominator = 9x7 = 63. 4/9 = 28/63.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_ef_09', 'opt_d', '10/22 reduces to 5/11, not 2/5.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_ef_10', 'opt_c', 'HCF(48,72)=24. 48/72 = 2/3.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_af_06', 'opt_b', 'Same denominator: 2+4=6. Result: 6/9.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_af_07', 'opt_b', '5 and 3 are coprime. LCD = 5x3 = 15.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_af_08', 'opt_b', 'LCM(10,5)=10. 2/5=4/10. 3/10+4/10=7/10.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_af_09', 'opt_b', 'LCM(3,6)=6. 1/3=2/6. 2/6+1/6=3/6=1/2 cup.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_af_10', 'opt_b', 'LCM(12,18)=36. 5/12=15/36, 7/18=14/36. Sum=29/36.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_mf_06', 'opt_a', '7 / 2 = 3 remainder 1. So 7/2 = 3 1/2.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_mf_07', 'opt_a', '(3x5+2)/5 = 17/5.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_mf_08', 'opt_a', 'Whole: 2+3=5. Fractions: 1/4+1/4=2/4=1/2. Total: 5 1/2.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_mf_09', 'opt_b', 'Whole: 1+2=3. Fractions: 2/3+1/6=4/6+1/6=5/6. Total: 3 5/6.')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES ('q_mf_10', 'opt_b', '2 1/2 + 3 3/4 = 2 2/4 + 3 3/4 = 5 5/4 = 6 1/4 km.')
ON CONFLICT (question_id) DO NOTHING;

-- Verify counts (run separately to check):
-- SELECT COUNT(*) FROM public.questions;           -- should be 50
-- SELECT COUNT(*) FROM public.question_answer_keys; -- should be 50
