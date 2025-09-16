-- Create system_info table to store system-wide configuration and metadata
CREATE TABLE public.system_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_info ENABLE ROW LEVEL SECURITY;

-- Only superadmins can read/write system info
CREATE POLICY "Superadmins can manage system info" 
ON public.system_info 
FOR ALL 
USING (is_superadmin_simple());

-- Create admin_notifications table for system notifications
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  is_read BOOLEAN NOT NULL DEFAULT false,
  priority INTEGER NOT NULL DEFAULT 1, -- 1=low, 2=medium, 3=high
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only superadmins can read/write admin notifications
CREATE POLICY "Superadmins can manage admin notifications" 
ON public.admin_notifications 
FOR ALL 
USING (is_superadmin_simple());

-- Create trigger for updated_at
CREATE TRIGGER update_system_info_updated_at
BEFORE UPDATE ON public.system_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_notifications_updated_at
BEFORE UPDATE ON public.admin_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial Apple SIWA key tracking record
INSERT INTO public.system_info (key, value, description)
VALUES (
  'apple_siwa_key_info',
  '{"last_generated_at": null, "expiration_days": 179}',
  'Tracks Apple Sign In With Apple key generation and expiration information'
);

-- Function to check and create expiration notifications
CREATE OR REPLACE FUNCTION public.check_apple_key_expiration()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  key_info JSONB;
  last_generated TIMESTAMP WITH TIME ZONE;
  expiration_date TIMESTAMP WITH TIME ZONE;
  days_until_expiry INTEGER;
  notification_exists BOOLEAN;
BEGIN
  -- Get Apple key info
  SELECT value INTO key_info
  FROM public.system_info
  WHERE key = 'apple_siwa_key_info';

  -- Check if we have a generation date
  IF key_info ? 'last_generated_at' AND key_info->>'last_generated_at' IS NOT NULL THEN
    last_generated := (key_info->>'last_generated_at')::TIMESTAMP WITH TIME ZONE;
    expiration_date := last_generated + INTERVAL '179 days';
    days_until_expiry := EXTRACT(days FROM expiration_date - now());

    -- Check if we need to create a 30-day warning notification
    IF days_until_expiry <= 30 AND days_until_expiry > 0 THEN
      -- Check if notification already exists for this expiration period
      SELECT EXISTS(
        SELECT 1 FROM public.admin_notifications
        WHERE notification_type = 'warning'
          AND metadata->>'key_type' = 'apple_siwa'
          AND (metadata->>'expiration_date')::DATE = expiration_date::DATE
          AND expires_at > now()
      ) INTO notification_exists;

      -- Create notification if it doesn't exist
      IF NOT notification_exists THEN
        INSERT INTO public.admin_notifications (
          title,
          message,
          notification_type,
          priority,
          expires_at,
          metadata
        ) VALUES (
          'Apple SIWA Key Expiring Soon',
          format('Your Apple Sign In With Apple key will expire in %s days on %s. Please regenerate it before expiration.', 
                 days_until_expiry, 
                 expiration_date::DATE),
          'warning',
          2,
          expiration_date,
          jsonb_build_object(
            'key_type', 'apple_siwa',
            'expiration_date', expiration_date,
            'days_until_expiry', days_until_expiry
          )
        );
      END IF;
    END IF;

    -- Create urgent notification if expired or expiring today
    IF days_until_expiry <= 0 THEN
      SELECT EXISTS(
        SELECT 1 FROM public.admin_notifications
        WHERE notification_type = 'error'
          AND metadata->>'key_type' = 'apple_siwa_expired'
          AND created_at::DATE = now()::DATE
      ) INTO notification_exists;

      IF NOT notification_exists THEN
        INSERT INTO public.admin_notifications (
          title,
          message,
          notification_type,
          priority,
          metadata
        ) VALUES (
          'Apple SIWA Key EXPIRED',
          format('Your Apple Sign In With Apple key expired %s days ago. Apple authentication will not work until you regenerate the key.', 
                 ABS(days_until_expiry)),
          'error',
          3,
          jsonb_build_object(
            'key_type', 'apple_siwa_expired',
            'expiration_date', expiration_date,
            'days_overdue', ABS(days_until_expiry)
          )
        );
      END IF;
    END IF;
  END IF;
END;
$$;