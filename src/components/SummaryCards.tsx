import { DollarSign, TrendingUp } from 'lucide-react';
import { Payment } from '../lib/supabase';

/**
 * Props for the SummaryCards component
 */
interface SummaryCardsProps {
  payments: Payment[];
}

/**
 * Displays financial summary cards for payment data.
 * Shows totals broken down by payment method (Cash, Zelle, Check) and overall total.
 */
export default function SummaryCards({ payments }: SummaryCardsProps) {
  /**
   * Calculate payment totals grouped by payment method.
   * Uses reduce to accumulate amounts for each payment type and overall total.
   */
  const summary = payments.reduce(
    (acc, payment) => {
      const amount = Number(payment.amount_paid);
      acc.total += amount;

      switch (payment.payment_method) {
        case 'Cash':
          acc.cash += amount;
          break;
        case 'Zelle':
          acc.zelle += amount;
          break;
        case 'Check':
          acc.check += amount;
          break;
        case 'Booker CC':
          acc.bookerCC += amount;
          break;
      }

      return acc;
    },
    { cash: 0, zelle: 0, check: 0, bookerCC: 0, total: 0 }
  );

  /**
   * Formats a number as USD currency.
   * Example output: "$100.00"
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-green-100 text-sm font-medium">Cash</span>
          <DollarSign className="w-5 h-5 text-green-100" />
        </div>
        <p className="text-3xl font-bold">{formatCurrency(summary.cash)}</p>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-blue-100 text-sm font-medium">Zelle</span>
          <DollarSign className="w-5 h-5 text-blue-100" />
        </div>
        <p className="text-3xl font-bold">{formatCurrency(summary.zelle)}</p>
      </div>

      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-amber-100 text-sm font-medium">Check</span>
          <DollarSign className="w-5 h-5 text-amber-100" />
        </div>
        <p className="text-3xl font-bold">{formatCurrency(summary.check)}</p>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-purple-100 text-sm font-medium">Booker CC</span>
          <DollarSign className="w-5 h-5 text-purple-100" />
        </div>
        <p className="text-3xl font-bold">{formatCurrency(summary.bookerCC)}</p>
      </div>

      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-200 text-sm font-medium">Total</span>
          <TrendingUp className="w-5 h-5 text-slate-200" />
        </div>
        <p className="text-3xl font-bold">{formatCurrency(summary.total)}</p>
        <p className="text-slate-300 text-sm mt-1">{payments.length} payments</p>
      </div>
    </div>
  );
}
