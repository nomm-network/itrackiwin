-- Add language_code column to exercise_aliases table for bilingual support
ALTER TABLE exercise_aliases 
ADD COLUMN IF NOT EXISTS language_code text DEFAULT 'en';

-- Update existing aliases to have 'en' as default language
UPDATE exercise_aliases 
SET language_code = 'en' 
WHERE language_code IS NULL;

-- Add index for better performance on language-based queries
CREATE INDEX IF NOT EXISTS idx_exercise_aliases_language_code 
ON exercise_aliases(language_code);

-- Now seed Romanian aliases for the 20 core lifts

-- Bench Press Family
INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'împins la piept','bancă orizontală','bench presa','piept bară','presa pe bancă'
]), 'ro' FROM exercises e WHERE e.slug = 'flat-bench-press'
ON CONFLICT (exercise_id, alias) DO NOTHING;

INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'bancă înclinată','împins înclinat','presa înclinată','piept sus','bench înclinat'
]), 'ro' FROM exercises e WHERE e.slug = 'incline-bench-press'
ON CONFLICT (exercise_id, alias) DO NOTHING;

INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'bancă declinată','împins declinat','presa negativă','piept jos','bench negativ'
]), 'ro' FROM exercises e WHERE e.slug = 'decline-bench-press'
ON CONFLICT (exercise_id, alias) DO NOTHING;

-- Pull-up Family
INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'tracțiuni','pullup','tracțiuni late','tracțiuni apropiate','tracțiuni la bară'
]), 'ro' FROM exercises e WHERE e.slug = 'pull-up'
ON CONFLICT (exercise_id, alias) DO NOTHING;

INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'tracțiuni inverse','chinups','pullup supinat','tracțiuni sub priză','tracțiuni biceps'
]), 'ro' FROM exercises e WHERE e.slug = 'chin-up'
ON CONFLICT (exercise_id, alias) DO NOTHING;

INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'tras la helcometru','lat pulldown','tras la cablu','tras spate','tras la aparat'
]), 'ro' FROM exercises e WHERE e.slug = 'lat-pulldown'
ON CONFLICT (exercise_id, alias) DO NOTHING;

-- Biceps Curls
INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'flexii cu bară','biceps bară dreaptă','bb curl','flexii clasice','biceps bară'
]), 'ro' FROM exercises e WHERE e.slug = 'barbell-curl'
ON CONFLICT (exercise_id, alias) DO NOTHING;

INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'flexii cu bară ez','biceps ez','ez curl','flexii bară îndoită','biceps bară curbată'
]), 'ro' FROM exercises e WHERE e.slug = 'ez-bar-curl'
ON CONFLICT (exercise_id, alias) DO NOTHING;

INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'flexii la bancă scott','biceps scott','preacher curl','flexii izolate','biceps pe bancă'
]), 'ro' FROM exercises e WHERE e.slug = 'preacher-curl'
ON CONFLICT (exercise_id, alias) DO NOTHING;

-- Rows
INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'rămas bară','barbell row','rămas cu bară','row clasic','îndreptări la bară pentru spate'
]), 'ro' FROM exercises e WHERE e.slug = 'barbell-row'
ON CONFLICT (exercise_id, alias) DO NOTHING;

INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'rămas cu gantera','row cu gantera','dumbbell row','rămas o mână','rămas pe bancă'
]), 'ro' FROM exercises e WHERE e.slug = 'dumbbell-row'
ON CONFLICT (exercise_id, alias) DO NOTHING;

INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'rămas t-bar','tbar row','landmine row','rămas cu bară T','row pe aparat T'
]), 'ro' FROM exercises e WHERE e.slug = 't-bar-row'
ON CONFLICT (exercise_id, alias) DO NOTHING;

-- Pressing Overhead
INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'presa deasupra capului','shoulder press','presa militară','presa umeri','ohp'
]), 'ro' FROM exercises e WHERE e.slug = 'overhead-press'
ON CONFLICT (exercise_id, alias) DO NOTHING;

INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'presa militară strictă','front press','military press','presa frontală','presa umeri frontal'
]), 'ro' FROM exercises e WHERE e.slug = 'military-press'
ON CONFLICT (exercise_id, alias) DO NOTHING;

INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'presa arnold','arnold dumbbell press','presa arnold cu gantere','arnold shoulder press'
]), 'ro' FROM exercises e WHERE e.slug = 'arnold-press'
ON CONFLICT (exercise_id, alias) DO NOTHING;

-- Deadlifts
INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'îndreptări clasice','deadlift','îndreptări cu bară','tras bară de pe podea','îndreptări standard'
]), 'ro' FROM exercises e WHERE e.slug = 'deadlift'
ON CONFLICT (exercise_id, alias) DO NOTHING;

INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'îndreptări românești','romanian dl','rdl','îndreptări hamstring','rdl cu bară'
]), 'ro' FROM exercises e WHERE e.slug = 'romanian-deadlift'
ON CONFLICT (exercise_id, alias) DO NOTHING;

INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'îndreptări cu picioare drepte','stiff leg dl','îndreptări hamstring','îndreptări sldl'
]), 'ro' FROM exercises e WHERE e.slug = 'stiff-leg-deadlift'
ON CONFLICT (exercise_id, alias) DO NOTHING;

-- Squats
INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'genuflexiuni','back squat','squat','genuflexiuni cu bară','squat clasic'
]), 'ro' FROM exercises e WHERE e.slug = 'squat'
ON CONFLICT (exercise_id, alias) DO NOTHING;

INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'genuflexiuni frontale','front squat','squat olimpic','genuflexiuni olimpice','squat frontal'
]), 'ro' FROM exercises e WHERE e.slug = 'front-squat'
ON CONFLICT (exercise_id, alias) DO NOTHING;

INSERT INTO exercise_aliases (exercise_id, alias, language_code)
SELECT e.id, unnest(ARRAY[
  'presa picioare','leg press','aparat presa picioare','presa pentru coapse','sled press'
]), 'ro' FROM exercises e WHERE e.slug = 'leg-press'
ON CONFLICT (exercise_id, alias) DO NOTHING;