-- Create enums for structured fitness data
CREATE TYPE training_focus AS ENUM ('muscle','strength','general','power');
CREATE TYPE primary_weight_goal AS ENUM ('lose','maintain','recomp','gain');
CREATE TYPE experience_level AS ENUM ('new','returning','intermediate','advanced');
CREATE TYPE progression_model AS ENUM ('double_progression','linear_load','rep_targets','percent_1rm','rpe_based');