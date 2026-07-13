import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';

export default function Reports() {
  const [dateRange, setDateRange] = useState('today');
  const [reportType, setReportType] = useState('sales');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({ totalSales: 0, transactions: 0, avg: 0 });

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (reportType === 'sales') {
        if (dateRange === 'custom') {
          params.append('date_from', '2000-01-01');
          params.append('date_to', '2100-01-01');
        }
      }
      const res = await api.get(`/reports/sales?${params.toString()}`);
      const dataRows = res.data?.data?.rows || [];
      setRows(dataRows);
      const totals = res.data?.data?.totals || {};
      const totalSales = Number(totals.total ?? totals.total_paid ?? dataRows.reduce((s, r) => s + Number(r.total || 0), 0));
      const transactions = dataRows.length;
      const avg = transactions ? totalSales / transactions : 0;
      setSummary({ totalSales, transactions, avg });
    } catch {
      setError('Failed to load reports');
      setRows([]);
      setSummary({ totalSales: 0, transactions: 0, avg: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Reports
      </h1>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="sales">Sales Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="customer">Customer Report</option>
              <option value="profit">Profit & Loss</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchReport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Generate Report
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Sales</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
            Rp {summary.totalSales.toLocaleString()}
          </p>
          <p className="text-green-600 text-sm mt-1">From fetched report</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm">Transactions</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
            {summary.transactions}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Completed</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm">Avg. Transaction</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
            Rp {Math.round(summary.avg).toLocaleString()}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Per sale</p>
        </motion.div>
      </div>

      {/* Sales Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Recent Transactions
            </h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Export CSV
            </button>
          </div>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          {loading ? (
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Sale ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Invoice</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date & Time</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {rows.map((sale) => (
                    <tr key={sale.sale_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">
                        {sale.sale_id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">
                        {sale.invoice_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">
                        {sale.sale_time}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                        Rp {Number(sale.total || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                        No sales found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
