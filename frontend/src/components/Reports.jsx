import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Reports() {
  const [dateRange, setDateRange] = useState('today');
  const [reportType, setReportType] = useState('sales');

  const mockSalesData = [
    { id: 1, date: '2026-07-13 09:00', customer: 'Walk-in', total: 45000, items: 3 },
    { id: 2, date: '2026-07-13 09:15', customer: 'John Doe', total: 120000, items: 5 },
    { id: 3, date: '2026-07-13 09:30', customer: 'Walk-in', total: 35000, items: 2 },
    { id: 4, date: '2026-07-13 10:00', customer: 'Jane Smith', total: 85000, items: 4 },
  ];

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
            Rp 285,000
          </p>
          <p className="text-green-600 text-sm mt-1">↑ 12.5% from yesterday</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm">Transactions</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
            4
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
            Rp 71,250
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {mockSalesData.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">
                      {sale.date}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">
                      {sale.customer}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">
                      {sale.items}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">
                      Rp {sale.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
