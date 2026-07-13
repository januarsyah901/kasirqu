import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useLanguage } from '../auth/LanguageContext';

export default function Reports() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('sales');
  const [dateRange, setDateRange] = useState('today');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({ totalSales: 0, transactions: 0, avg: 0 });
  const [invRows, setInvRows] = useState([]);
  const [expTotals, setExpTotals] = useState([]);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'sales') {
        const params = new URLSearchParams();
        if (dateRange === 'custom') {
          params.append('date_from', '2000-01-01');
          params.append('date_to', '2100-01-01');
        }
        const res = await api.get(`/reports/sales?${params.toString()}`);
        const dataRows = res.data?.data?.rows || [];
        setRows(dataRows);
        const totals = res.data?.data?.totals || {};
        const totalSales = Number(totals.total ?? totals.total_paid ?? dataRows.reduce((s, r) => s + Number(r.total || 0), 0));
        const transactions = dataRows.length;
        const avg = transactions ? totalSales / transactions : 0;
        setSummary({ totalSales, transactions, avg });
      } else if (tab === 'inventory') {
        const res = await api.get('/reports/inventory');
        setInvRows(res.data?.data?.rows || res.data?.data || []);
      } else if (tab === 'expenses') {
        const res = await api.get('/reports/expenses');
        setExpTotals(res.data?.data?.rows || res.data?.data || []);
      }
    } catch {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t('reports.title')}</h1>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex space-x-2 mb-4">
          <button onClick={() => setTab('sales')} className={`px-4 py-2 rounded-lg ${tab === 'sales' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t('reports.tabSales')}</button>
          <button onClick={() => setTab('inventory')} className={`px-4 py-2 rounded-lg ${tab === 'inventory' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t('reports.tabInventory')}</button>
          <button onClick={() => setTab('expenses')} className={`px-4 py-2 rounded-lg ${tab === 'expenses' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{t('reports.tabExpenses')}</button>
        </div>
        {tab === 'sales' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
              <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div className="flex items-end"><button onClick={fetchReport} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors">Generate Report</button></div>
          </div>
        )}
      </motion.div>

      {tab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Sales</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">Rp {summary.totalSales.toLocaleString()}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Transactions</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{summary.transactions}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Avg. Transaction</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">Rp {Math.round(summary.avg).toLocaleString()}</p>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Transactions</h2>
              {error && <p className="text-red-600 mb-4">{error}</p>}
              {loading ? <p className="text-gray-600 dark:text-gray-300">Loading...</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Sale ID</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Invoice</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date & Time</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Total</th></tr></thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {rows.map((sale) => (
                        <tr key={sale.sale_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">{sale.sale_id}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">{sale.invoice_number}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">{sale.sale_time}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600 dark:text-green-400">Rp {Number(sale.total || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                      {!rows.length && (<tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">No sales found</td></tr>)}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {tab === 'inventory' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6"><h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{t('reports.lowStock')} / {t('reports.stockValue')}</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Item</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Qty</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Value</th></tr></thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {invRows.map((r, i) => (
                  <tr key={i}><td className="px-4 py-3 text-sm text-gray-800 dark:text-white">{r.item_name || r.name || r.item_id}</td><td className="px-4 py-3 text-sm text-gray-800 dark:text-white">{r.quantity}</td><td className="px-4 py-3 text-sm text-gray-800 dark:text-white">Rp {Number(r.value || 0).toLocaleString()}</td></tr>
                ))}
                {!invRows.length && (<tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">No data</td></tr>)}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === 'expenses' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6"><h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{t('reports.totalByCategory')}</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Category</th><th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Total</th></tr></thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {expTotals.map((r, i) => (
                  <tr key={i}><td className="px-4 py-3 text-sm text-gray-800 dark:text-white">{r.category}</td><td className="px-4 py-3 text-sm text-gray-800 dark:text-white">Rp {Number(r.total || 0).toLocaleString()}</td></tr>
                ))}
                {!expTotals.length && (<tr><td colSpan={2} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">No data</td></tr>)}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
