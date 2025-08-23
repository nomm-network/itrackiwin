-- Create sex enum type
CREATE TYPE public.sex_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- Add sex column to user_profile_fitness table
ALTER TABLE public.user_profile_fitness 
ADD COLUMN sex public.sex_type DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.user_profile_fitness.sex IS 'User biological sex for training personalization (volume biases, progression adjustments)';

-- Create index for queries that filter by sex
CREATE INDEX idx_user_profile_fitness_sex ON public.user_profile_fitness(sex);