/*
  # Create function to get payments by date in Eastern Time

  1. New Functions
    - `get_payments_by_date_et(target_date text)`: Returns all payments for a specific date in ET timezone
      - Takes a date string in YYYY-MM-DD format
      - Filters payments based on Eastern Time zone conversion
      - Returns all payment fields ordered by timestamp

  2. Security
    - Function respects existing RLS policies on the payments table
    - Uses SECURITY INVOKER to run with caller's privileges
*/

CREATE OR REPLACE FUNCTION get_payments_by_date_et(target_date text)
RETURNS TABLE (
  id uuid,
  client_name text,
  service_type text,
  payment_method text,
  amount_paid numeric,
  payment_timestamp timestamptz
)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT 
    id,
    client_name,
    service_type,
    payment_method,
    amount_paid,
    timestamp as payment_timestamp
  FROM payments
  WHERE to_char(timestamp AT TIME ZONE 'America/New_York', 'YYYY-MM-DD') = target_date
  ORDER BY timestamp ASC;
$$;
