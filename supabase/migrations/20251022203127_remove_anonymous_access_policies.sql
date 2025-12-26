/*
  # Remove Anonymous Access to Payments Table

  1. Security Changes
    - Drop all anonymous user policies from `payments` table
    - Restrict access to authenticated users only
    - Maintain full CRUD access for authenticated users

  2. Impact
    - Anonymous users will no longer have any access to payment data
    - Only users who sign in with valid credentials can view, create, update, or delete payments
    - This enforces the login-only access pattern
    
  3. Important Notes
    - After this migration, only authenticated users can access the payments table
    - New users must be created manually through the Supabase dashboard
    - Self-registration is disabled at the application level
*/

-- Drop all anonymous access policies
DROP POLICY IF EXISTS "Anonymous users can view all payments" ON payments;
DROP POLICY IF EXISTS "Anonymous users can insert payments" ON payments;
DROP POLICY IF EXISTS "Anonymous users can update payments" ON payments;
DROP POLICY IF EXISTS "Anonymous users can delete payments" ON payments;
