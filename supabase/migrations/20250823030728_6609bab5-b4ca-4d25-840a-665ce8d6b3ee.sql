-- Setup cron job to run data quality checks nightly at 2 AM
SELECT cron.schedule(
  'nightly-data-quality-check',
  '0 2 * * *', -- Run at 2 AM every day
  $$
  SELECT
    net.http_post(
        url:='https://fsayiuhncisevhipbrak.supabase.co/functions/v1/data-quality-check',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzYXlpdWhuY2lzZXZoaXBicmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTc1ODAsImV4cCI6MjA3MDI3MzU4MH0.m6Q6-kyLfctBMaoUvuOOaAH2T6GP8T8MRy_ctSzmszw"}'::jsonb,
        body:='{"action": "run_check"}'::jsonb
    ) as request_id;
  $$
);