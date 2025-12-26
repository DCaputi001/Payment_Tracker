import { Search, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCurrentDateInET, formatDateOnlyInET, formatShortDateInET, formatShortDateWithYearInET } from '../utils/timezone';

/**
 * Props for the SearchFilter component
 */
interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  paymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
}

/**
 * Advanced filtering component for payment records.
 * Provides search by client name, date range navigation, and payment method selection.
 * Includes quick-access buttons for today's date and all-time view.
 */
export default function SearchFilter({
  searchTerm,
  onSearchChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  paymentMethod,
  onPaymentMethodChange,
}: SearchFilterProps) {
  /**
   * Gets today's date in YYYY-MM-DD format (Eastern Time)
   */
  const getTodayDate = () => {
    return getCurrentDateInET();
  };

  /**
   * Sets both date filters to today's date
   */
  const setToday = () => {
    const today = getTodayDate();
    onDateFromChange(today);
    onDateToChange(today);
  };

  /**
   * Navigates to the previous day in the date range
   */
  const goToPreviousDay = () => {
    if (dateFrom) {
      const date = new Date(dateFrom + 'T12:00:00');
      date.setDate(date.getDate() - 1);
      const newDate = date.toISOString().split('T')[0];
      onDateFromChange(newDate);
      onDateToChange(newDate);
    }
  };

  /**
   * Navigates to the next day in the date range
   */
  const goToNextDay = () => {
    if (dateFrom) {
      const date = new Date(dateFrom + 'T12:00:00');
      date.setDate(date.getDate() + 1);
      const newDate = date.toISOString().split('T')[0];
      onDateFromChange(newDate);
      onDateToChange(newDate);
    }
  };

  /**
   * Clears the date filters to show all-time results
   */
  const clearDates = () => {
    onDateFromChange('');
    onDateToChange('');
  };

  /**
   * Formats the current date range for display in the date navigator.
   * All dates displayed in Eastern Time.
   * Returns: "All Time", "October 19, 2025", or "Oct 18 - Oct 20, 2025"
   */
  const formatDisplayDate = () => {
    if (!dateFrom && !dateTo) return 'All Time';
    if (dateFrom === dateTo && dateFrom) {
      return formatDateOnlyInET(dateFrom + 'T12:00:00');
    }
    if (dateFrom && dateTo) {
      const fromFormatted = formatShortDateInET(dateFrom + 'T12:00:00');
      const toFormatted = formatShortDateWithYearInET(dateTo + 'T12:00:00');
      return `${fromFormatted} - ${toFormatted}`;
    }
    return 'Custom Range';
  };

  // Check if the current date range is set to today
  const isToday = dateFrom === getTodayDate() && dateTo === getTodayDate();

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by client name..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousDay}
            disabled={!dateFrom}
            className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous day"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center gap-2 px-4 py-3 bg-slate-700 text-white rounded-lg min-w-[220px] justify-center">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">{formatDisplayDate()}</span>
          </div>

          <button
            onClick={goToNextDay}
            disabled={!dateFrom}
            className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next day"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          {!isToday && (
            <button
              onClick={setToday}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Today
            </button>
          )}

          {(dateFrom || dateTo) && (
            <button
              onClick={clearDates}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              All Time
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            id="date-from"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            id="date-to"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onPaymentMethodChange('')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              paymentMethod === ''
                ? 'bg-slate-700 text-white shadow-md'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Methods
          </button>
          <button
            onClick={() => onPaymentMethodChange('Cash')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              paymentMethod === 'Cash'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cash
          </button>
          <button
            onClick={() => onPaymentMethodChange('Zelle')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              paymentMethod === 'Zelle'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Zelle
          </button>
          <button
            onClick={() => onPaymentMethodChange('Check')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              paymentMethod === 'Check'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Check
          </button>
          <button
            onClick={() => onPaymentMethodChange('Booker CC')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              paymentMethod === 'Booker CC'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Booker CC
          </button>
        </div>
      </div>
    </div>
  );
}
