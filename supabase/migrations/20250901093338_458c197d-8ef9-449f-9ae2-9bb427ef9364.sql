-- Delete all existing handle translations
DELETE FROM public.handles_translations;

-- Insert English translations for all handles
INSERT INTO public.handles_translations (handle_id, language_code, name, description) VALUES
-- Cable Handle
('8d033f28-cada-4eeb-be0d-c5962ebffc1d', 'en', 'Cable Handle', 'Standard single cable handle for unilateral exercises'),
-- Dip Handles
('600176fe-0de5-46ff-8935-cb382dd5b791', 'en', 'Dip Handles', 'Parallel handles for dips and upper body support exercises'),
-- Dual D-Handle
('90b57052-0ac7-4c65-8348-f6ec42dd4da9', 'en', 'Dual D-Handle', 'Two D-shaped handles connected for bilateral cable exercises'),
-- Dumbbell Handle
('d2fb9446-e055-41b2-ba25-63e7c3081241', 'en', 'Dumbbell Handle', 'Individual dumbbell for free weight exercises'),
-- EZ Curl Bar
('71b786ad-09aa-41e9-a328-8b8304728521', 'en', 'EZ Curl Bar', 'Curved barbell designed for comfortable bicep and tricep exercises'),
-- Lat Pulldown Bar
('473e303c-f971-4e71-b8ba-494b1c242ac3', 'en', 'Lat Pulldown Bar', 'Wide bar attachment for lat pulldowns and pull exercises'),
-- Parallel Bars
('a1573461-ee2e-44a0-ae51-efba893d8d6e', 'en', 'Parallel Bars', 'Fixed parallel bars for bodyweight exercises'),
-- Pull-up Bar
('f6997066-bf00-46d4-8bd0-7746205dea3b', 'en', 'Pull-up Bar', 'Fixed horizontal bar for pull-ups and hanging exercises'),
-- Seated Row Bar
('cc2f2cd4-dfa3-4ba7-8f63-578483fb9057', 'en', 'Seated Row Bar', 'Narrow grip bar for seated rowing exercises'),
-- Single Handle
('2f3db93c-a293-40bb-a8b2-10e577da8abd', 'en', 'Single Handle', 'Single grip handle for unilateral cable exercises'),
-- Straight Bar
('ce6aa328-c0f3-404f-8883-2ec992d15fa4', 'en', 'Straight Bar', 'Standard straight Olympic barbell'),
-- Suspension Straps
('30e802d7-54f6-4768-a422-0def7f187181', 'en', 'Suspension Straps', 'TRX-style suspension training straps'),
-- Swiss Bar
('9a561d10-a26e-4919-91c4-6612d92d5bb1', 'en', 'Swiss Bar', 'Multi-grip neutral barbell with various hand positions'),
-- Trap Bar
('549a1c03-6880-4186-846b-17482a102784', 'en', 'Trap Bar', 'Hexagonal deadlift bar for trap and deadlift exercises'),
-- Tricep Rope
('5bfc1611-8204-432b-93bb-8dde7a9587ac', 'en', 'Tricep Rope', 'Rope attachment for tricep and cable exercises');

-- Insert Romanian translations for all handles
INSERT INTO public.handles_translations (handle_id, language_code, name, description) VALUES
-- Cable Handle
('8d033f28-cada-4eeb-be0d-c5962ebffc1d', 'ro', 'Mâner Cablu', 'Mâner standard pentru exerciții unilaterale la cablu'),
-- Dip Handles
('600176fe-0de5-46ff-8935-cb382dd5b791', 'ro', 'Mânere Dips', 'Mânere paralele pentru dips și exerciții de susținere'),
-- Dual D-Handle
('90b57052-0ac7-4c65-8348-f6ec42dd4da9', 'ro', 'Mâner Dublu D', 'Două mânere în formă de D conectate pentru exerciții bilaterale'),
-- Dumbbell Handle
('d2fb9446-e055-41b2-ba25-63e7c3081241', 'ro', 'Mâner Ganteră', 'Ganteră individuală pentru exerciții cu greutăți libere'),
-- EZ Curl Bar
('71b786ad-09aa-41e9-a328-8b8304728521', 'ro', 'Bară EZ Curl', 'Bară curbată pentru exerciții confortabile de biceps și triceps'),
-- Lat Pulldown Bar
('473e303c-f971-4e71-b8ba-494b1c242ac3', 'ro', 'Bară Lat Pulldown', 'Bară largă pentru exerciții de tracțiune dorsală'),
-- Parallel Bars
('a1573461-ee2e-44a0-ae51-efba893d8d6e', 'ro', 'Bare Paralele', 'Bare paralele fixe pentru exerciții cu greutatea corpului'),
-- Pull-up Bar
('f6997066-bf00-46d4-8bd0-7746205dea3b', 'ro', 'Bară Tracțiuni', 'Bară orizontală fixă pentru tracțiuni și exerciții de atârnat'),
-- Seated Row Bar
('cc2f2cd4-dfa3-4ba7-8f63-578483fb9057', 'ro', 'Bară Vâslit Șezând', 'Bară cu priză îngustă pentru exerciții de vâslit șezând'),
-- Single Handle
('2f3db93c-a293-40bb-a8b2-10e577da8abd', 'ro', 'Mâner Simplu', 'Mâner simplu pentru exerciții unilaterale la cablu'),
-- Straight Bar
('ce6aa328-c0f3-404f-8883-2ec992d15fa4', 'ro', 'Bară Dreaptă', 'Bară olimpică dreaptă standard'),
-- Suspension Straps
('30e802d7-54f6-4768-a422-0def7f187181', 'ro', 'Curele Suspensie', 'Curele de antrenament în suspensie tip TRX'),
-- Swiss Bar
('9a561d10-a26e-4919-91c4-6612d92d5bb1', 'ro', 'Bară Elvețiană', 'Bară cu multiple prize neutre pentru diferite poziții ale mâinilor'),
-- Trap Bar
('549a1c03-6880-4186-846b-17482a102784', 'ro', 'Bară Trap', 'Bară hexagonală pentru exerciții de deadlift și trapez'),
-- Tricep Rope
('5bfc1611-8204-432b-93bb-8dde7a9587ac', 'ro', 'Frânghie Triceps', 'Frânghie pentru exerciții de triceps la cablu');