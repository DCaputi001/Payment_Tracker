import { useState, useEffect, useMemo } from 'react';
import { Plus, FileText, LogOut } from 'lucide-react';
import { supabase, Payment } from './lib/supabase';
import PaymentForm, { PaymentFormData } from './components/PaymentForm';
import PaymentsTable from './components/PaymentsTable';
import SearchFilter from './components/SearchFilter';
import SummaryCards from './components/SummaryCards';
import { useAuth } from './contexts/AuthContext';
import { getCurrentDateInET } from './utils/timezone';

/**
 * Main application component for the Payment Tracker system.
 * Manages payment records with filtering, CRUD operations, and report generation capabilities.
 */
function App() {
  const { signOut } = useAuth();
  // Payment data and UI state management
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state for search and date range
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState(() => getCurrentDateInET());
  const [dateTo, setDateTo] = useState(() => getCurrentDateInET());
  const [paymentMethod, setPaymentMethod] = useState('');

  // Load payments on component mount
  useEffect(() => {
    loadPayments();
  }, []);

  /**
   * Fetches all payment records from the database.
   * Orders results by timestamp in descending order (newest first).
   */
  const loadPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
      alert('Failed to load payments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filters payments based on search term, date range, and payment method.
   * Uses memoization to prevent unnecessary recalculations.
   * Date filtering strips time components to ensure accurate day-based comparisons.
   */
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // Filter by client name (case-insensitive)
      const matchesSearch = payment.client_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Filter by date range (if specified)
      if (dateFrom || dateTo) {
        // Extract date-only components to avoid timezone issues
        const paymentDate = new Date(payment.timestamp);
        const paymentDateOnly = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), paymentDate.getDate());

        const fromDate = dateFrom ? new Date(dateFrom + 'T00:00:00') : null;
        const fromDateOnly = fromDate ? new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()) : null;

        const toDate = dateTo ? new Date(dateTo + 'T23:59:59') : null;
        const toDateOnly = toDate ? new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate()) : null;

        const matchesDateFrom = !fromDateOnly || paymentDateOnly >= fromDateOnly;
        const matchesDateTo = !toDateOnly || paymentDateOnly <= toDateOnly;

        if (!matchesDateFrom || !matchesDateTo) {
          return false;
        }
      }

      // Filter by payment method (if specified)
      const matchesMethod = !paymentMethod || payment.payment_method === paymentMethod;

      return matchesSearch && matchesMethod;
    });
  }, [payments, searchTerm, dateFrom, dateTo, paymentMethod]);

  /**
   * Handles the creation of a new payment record.
   * Inserts the payment data into the database and refreshes the payment list.
   * @param formData - The payment form data to be saved
   */
  const handleAddPayment = async (formData: PaymentFormData) => {
    try {
      const { error } = await supabase.from('payments').insert([
        {
          client_name: formData.client_name,
          payment_method: formData.payment_method,
          amount_paid: formData.amount_paid,
          timestamp: new Date(formData.timestamp).toISOString(),
          service_type: formData.service_type || null,
        },
      ]);

      if (error) throw error;

      await loadPayments();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Failed to add payment. Please try again.');
    }
  };

  /**
   * Handles updating an existing payment record.
   * Updates the payment in the database and refreshes the payment list.
   * @param formData - The updated payment form data
   */
  const handleUpdatePayment = async (formData: PaymentFormData) => {
    if (!editingPayment) return;

    try {
      const { error } = await supabase
        .from('payments')
        .update({
          client_name: formData.client_name,
          payment_method: formData.payment_method,
          amount_paid: formData.amount_paid,
          timestamp: new Date(formData.timestamp).toISOString(),
          service_type: formData.service_type || null,
        })
        .eq('id', editingPayment.id);

      if (error) throw error;

      await loadPayments();
      setEditingPayment(null);
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment. Please try again.');
    }
  };

  /**
   * Handles deletion of a payment record.
   * Removes the payment from the database and refreshes the payment list.
   * @param id - The unique identifier of the payment to delete
   */
  const handleDeletePayment = async (id: string) => {
    try {
      const { error } = await supabase.from('payments').delete().eq('id', id);

      if (error) throw error;

      await loadPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Failed to delete payment. Please try again.');
    }
  };

  /**
   * Generates and downloads a payment report for the current filters.
   * Calls the Supabase edge function to generate an HTML report matching the dashboard view.
   */
  const handleGenerateCurrentReport = async () => {
    try {
      const fromDate = dateFrom || getCurrentDateInET();
      const toDate = dateTo || getCurrentDateInET();

      const params = new URLSearchParams({
        dateFrom: fromDate,
        dateTo: toDate,
        paymentMethod: paymentMethod,
      });

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-payment-report?${params.toString()}`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) throw new Error('Failed to generate report');

      const html = await response.text();
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = fromDate === toDate
        ? `payment-report-${fromDate}.html`
        : `payment-report-${fromDate}-to-${toDate}.html`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  // Display loading state while fetching initial data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Payment Tracker</h1>
              <p className="text-sm text-gray-500 mt-1">All times displayed in Eastern Time (ET)</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGenerateCurrentReport}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-md"
              >
                <FileText className="w-5 h-5" />
                Generate Report
              </button>
              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <Plus className="w-5 h-5" />
                Add Payment
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <SummaryCards payments={filteredPayments} />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
          />
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Payment Records</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredPayments.length} of {payments.length} payments
            </p>
          </div>
          <PaymentsTable
            payments={filteredPayments}
            onEdit={setEditingPayment}
            onDelete={handleDeletePayment}
          />
        </div>
      </div>

      {isFormOpen && (
        <PaymentForm
          onSubmit={handleAddPayment}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {editingPayment && (
        <PaymentForm
          onSubmit={handleUpdatePayment}
          onCancel={() => setEditingPayment(null)}
          initialData={editingPayment}
          isEdit
        />
      )}
    </div>
  );
}

export default App;
