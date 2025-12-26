/*
  # Add Service Type field to payments table

  1. Changes
    - Add optional `service_type` column to `payments` table
      - `service_type` (text, nullable) - Optional field to categorize the type of service provided
  
  2. Notes
    - Column is nullable to maintain backward compatibility with existing records
    - No default value set as this is an optional field
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'service_type'
  ) THEN
    ALTER TABLE payments ADD COLUMN service_type text;
  END IF;
END $$;
