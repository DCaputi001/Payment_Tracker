/*
  # Add Booker CC Payment Method

  1. Changes
    - Drop existing payment_method CHECK constraint
    - Add new CHECK constraint that includes 'Booker CC' as a valid payment method
    - Valid payment methods are now: 'Cash', 'Zelle', 'Check', 'Booker CC'

  2. Security
    - No changes to RLS policies
    - Existing policies continue to apply

  3. Important Notes
    - This migration safely updates the constraint to allow the new payment method
    - Existing data is not affected as it already complies with the constraint
*/

-- Drop the existing constraint
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_method_check;

-- Add new constraint with Booker CC included
ALTER TABLE payments ADD CONSTRAINT payments_payment_method_check 
  CHECK (payment_method IN ('Cash', 'Zelle', 'Check', 'Booker CC'));
