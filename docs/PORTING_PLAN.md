# Porting Matrix: v44 (newer) → v46 (current baseline)

| Feature / Area | DB objects present in v46? | DB objects in v44? | Frontend pieces present in v46? | Notes (what to re-add) |
|---|---|---|---|---|
| Mentors/Coaches directory | ❌ | ✅ | ❌ | Need mentors table, mentor_type enum, mentor_profiles, mentorships tables + admin/public listing UI |
| Life categories link for mentors | ✅ | ✅ | ❌ | life_categories table exists, but no mentor FK relationship + UI missing |
| Template "Public/Favorite/Explore" | ❌ | ✅ | ❌ | workout_templates missing public/favorite columns + Training Center card/template picker |
| Readiness pipeline | ❌ | ✅ | ❌ | Missing pre_workout_checkins, readiness_checkins tables, v_latest_readiness view, compute_readiness_for_user/readiness_multiplier funcs + readiness dialog |
| Estimates for first-time exercises | ❌ | ✅ | ❌ | Missing user_exercise_estimates table with rm10/grip support + readiness UI inputs |
| Warmup engine | ✅ | ✅ | ❌ | generate_warmup_steps function exists, but missing triggers + WarmupPanel UI component |
| start_workout RPC | ✅ | ✅ | ✅ | start_workout function exists with target_weight_kg + useStartWorkout hook present |
| Set logging | ✅ | ✅ | ✅ | log_workout_set RPC exists + SetList components present |
| Active workout detection | ❌ | ✅ | ❌ | Missing v_active_workout view + Training Center "Continue" button logic |
| History brief page | ❌ | ✅ | ❌ | Missing lightweight history summary route + card navigation |