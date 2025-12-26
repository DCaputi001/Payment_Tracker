import { Edit2, Trash2 } from 'lucide-react';
import { Payment } from '../lib/supabase';
import { formatDateInET } from '../utils/timezone';

/**
 * Props for the PaymentsTable component
 */
interface PaymentsTableProps {
  payments: Payment[];
  onEdit: (payment: Payment) => void;
  onDelete: (id: string) => void;
}

/**
 * Displays payment records in a responsive table format.
 * Includes formatting utilities for dates, currency, and payment method badges.
 * Provides edit and delete actions for each payment record.
 * All dates and times are displayed in Eastern Time (ET).
 */
export default function PaymentsTable({ payments, onEdit, onDelete }: PaymentsTableProps) {
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

  /**
   * Returns Tailwind CSS classes for payment method badges.
   * Each payment method has a distinct color scheme for visual identification.
   */
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'Cash':
        return 'bg-green-100 text-green-800';
      case 'Zelle':
        return 'bg-blue-100 text-blue-800';
      case 'Check':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Display empty state when no payments match the current filters
  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No payments found</p>
        <p className="text-gray-400 text-sm mt-2">Add your first payment to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service Type</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment Method</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date & Time</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 text-gray-900">{payment.client_name}</td>
              <td className="py-3 px-4 text-gray-600 text-sm">
                {payment.service_type || <span className="text-gray-400 italic">-</span>}
              </td>
              <td className="py-3 px-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(payment.payment_method)}`}>
                  {payment.payment_method}
                </span>
              </td>
              <td className="py-3 px-4 text-right font-semibold text-gray-900">
                {formatCurrency(payment.amount_paid)}
              </td>
              <td className="py-3 px-4 text-gray-600 text-sm">
                {formatDateInET(payment.timestamp)} <span className="text-gray-400">ET</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(payment)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit payment"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this payment?')) {
                        onDelete(payment.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete payment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
