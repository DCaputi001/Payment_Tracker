/*
  # Create Payments Table for Payment Tracker App

  1. New Tables
    - `payments`
      - `id` (uuid, primary key) - Unique payment identifier
      - `client_name` (text) - Name of the client making the payment
      - `payment_method` (text) - Type of payment: Cash, Zelle, or Check
      - `amount_paid` (numeric) - Payment amount with 2 decimal precision
      - `timestamp` (timestamptz) - Date and time when payment was recorded
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

  2. Security
    - Enable RLS on `payments` table
    - Add policy for authenticated users to read all payment records
    - Add policy for authenticated users to insert new payments
    - Add policy for authenticated users to update payment records
    - Add policy for authenticated users to delete payment records

  3. Indexes
    - Add index on `client_name` for faster search operations
    - Add index on `timestamp` for date-based filtering and reporting

  4. Important Notes
    - Payment methods are constrained to: 'Cash', 'Zelle', 'Check'
    - Amount must be positive
    - Timestamp defaults to current time when record is created
    - Updated_at automatically updates on record modification
*/

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('Cash', 'Zelle', 'Check')),
  amount_paid numeric(10, 2) NOT NULL CHECK (amount_paid > 0),
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_client_name ON payments(client_name);
CREATE INDEX IF NOT EXISTS idx_payments_timestamp ON payments(timestamp);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete payments"
  ON payments FOR DELETE
  TO authenticated
  USING (true);

-- Allow anonymous access for demo purposes (remove in production)
CREATE POLICY "Anonymous users can view all payments"
  ON payments FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can insert payments"
  ON payments FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can update payments"
  ON payments FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anonymous users can delete payments"
  ON payments FOR DELETE
  TO anon
  USING (true);