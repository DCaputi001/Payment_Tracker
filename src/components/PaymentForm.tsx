import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Payment } from '../lib/supabase';
import { getDateTimeLocalValueInET, convertLocalDateTimeToUTC } from '../utils/timezone';

/**
 * Props for the PaymentForm component
 */
interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Payment;
  isEdit?: boolean;
}

/**
 * Payment form data structure
 */
export interface PaymentFormData {
  client_name: string;
  payment_method: 'Cash' | 'Zelle' | 'Check' | 'Booker CC';
  amount_paid: number;
  timestamp: string;
  service_type?: string;
}

/**
 * Modal form component for adding and editing payment records.
 * Displays a full-screen overlay with form fields for all payment properties.
 */
export default function PaymentForm({ onSubmit, onCancel, initialData, isEdit }: PaymentFormProps) {
  // Form state with default values for new payments
  const [formData, setFormData] = useState<PaymentFormData>({
    client_name: '',
    payment_method: 'Cash',
    amount_paid: 0,
    timestamp: getDateTimeLocalValueInET(new Date().toISOString()),
    service_type: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form with initial data when editing an existing payment
  useEffect(() => {
    if (initialData) {
      setFormData({
        client_name: initialData.client_name,
        payment_method: initialData.payment_method,
        amount_paid: initialData.amount_paid,
        timestamp: getDateTimeLocalValueInET(initialData.timestamp),
        service_type: initialData.service_type || '',
      });
    }
  }, [initialData]);

  /**
   * Handles form submission.
   * Prevents default form behavior and calls the onSubmit callback.
   * Converts Eastern Time input to UTC for storage.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const utcTimestamp = convertLocalDateTimeToUTC(formData.timestamp);
      await onSubmit({ ...formData, timestamp: utcTimestamp });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Payment' : 'Add New Payment'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-1">
              Client Name
            </label>
            <input
              type="text"
              id="client_name"
              required
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter client name"
            />
          </div>

          <div>
            <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              id="payment_method"
              required
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as 'Cash' | 'Zelle' | 'Check' | 'Booker CC' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="Cash">Cash</option>
              <option value="Zelle">Zelle</option>
              <option value="Check">Check</option>
              <option value="Booker CC">Booker CC</option>
            </select>
          </div>

          <div>
            <label htmlFor="amount_paid" className="block text-sm font-medium text-gray-700 mb-1">
              Amount Paid
            </label>
            <input
              type="number"
              id="amount_paid"
              required
              step="0.01"
              value={formData.amount_paid || ''}
              onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time <span className="text-gray-500 text-xs">(Eastern Time)</span>
            </label>
            <input
              type="datetime-local"
              id="timestamp"
              required
              value={formData.timestamp}
              onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-1">
              Service Type <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              id="service_type"
              value={formData.service_type || ''}
              onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="e.g., Consultation, Treatment, etc."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
