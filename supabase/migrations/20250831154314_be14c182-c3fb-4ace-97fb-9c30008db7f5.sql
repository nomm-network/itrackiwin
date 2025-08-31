-- Delete all exercise translations except for the specified exercise
DELETE FROM public.exercises_translations 
WHERE exercise_id != 'b0bb1fa8-83c4-4f39-a311-74f014d85bec';