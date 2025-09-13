-- Add default plates for Continental Fitness SPA gym
-- Using gym ID from the query above
INSERT INTO user_gym_plates (user_gym_id, weight, unit, quantity) VALUES
-- Continental Fitness SPA (default gym) - Standard plate set
('746f46cb-b54d-43db-8a4a-5b15d300a802', 1.25, 'kg', 4),  -- Micro plates
('746f46cb-b54d-43db-8a4a-5b15d300a802', 2.5, 'kg', 4),   -- Small plates
('746f46cb-b54d-43db-8a4a-5b15d300a802', 5, 'kg', 4),     -- Medium plates
('746f46cb-b54d-43db-8a4a-5b15d300a802', 10, 'kg', 4),    -- Large plates
('746f46cb-b54d-43db-8a4a-5b15d300a802', 15, 'kg', 4),    -- Heavy plates
('746f46cb-b54d-43db-8a4a-5b15d300a802', 20, 'kg', 4),    -- Heaviest plates
('746f46cb-b54d-43db-8a4a-5b15d300a802', 25, 'kg', 2);    -- Max plates