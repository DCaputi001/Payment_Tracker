/*
  # Allow Negative Payment Amounts

  1. Changes
    - Remove CHECK constraint that enforces amount_paid > 0
    - Allow negative, zero, and positive payment amounts
  
  2. Purpose
    - Enable recording of refunds, adjustments, and corrections as negative amounts
    - Maintain numeric precision at 2 decimal places
  
  3. Important Notes
    - This change affects the payments table only
    - All other constraints and indexes remain unchanged
    - Summary calculations will automatically handle negative values
*/

-- Drop the existing CHECK constraint that enforces positive-only amounts
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_amount_paid_check;