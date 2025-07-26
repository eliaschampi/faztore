-- =====================================================
-- Faztore Database Functions
-- =====================================================

-- Timestamp updater function
CREATE OR REPLACE FUNCTION public.timestamp_updater () RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;