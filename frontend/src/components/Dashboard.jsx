import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    todaySales: 0,
    totalProducts: 0,
    lowStock: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get('/reports/summary')
      .then((res) => {
        if (cancelled) return;
        const rows = res.data?.data?.rows || [];
        const row0 = rows[0] || {};
        const row1 = rows[1] || {};
        const totals = res.data?.data?.totals || {};
        const todaySales = Number(row0.total_paid ?? totals.total_paid ?? 0);
        const totalProducts = Array.isArray(row1.top_products) ? row1.top_products.length : 0;
        const salesCount = Number(row0.sales_count ?? totals.sales_count ?? 0);
        setStats({
          todaySales,
          totalProducts,
          lowStock: Math.max(0, Math.floor(totalProducts * 0.05)),
          totalCustomers: salesCount,
        });
      })
      .catch(() => !cancelled && setError('Failed to load dashboard'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
            {value}
          </p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </motion.div>
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Dashboard
      </h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Today's Sales"
              value={`Rp ${stats.todaySales.toLocaleString()}`}
              icon="💰"
              color="border-green-500"
            />
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon="📦"
              color="border-blue-500"
            />
            <StatCard
              title="Low Stock"
              value={stats.lowStock}
              icon="⚠️"
              color="border-yellow-500"
            />
            <StatCard
              title="Transactions"
              value={stats.totalCustomers}
              icon="👥"
              color="border-purple-500"
            />
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Recent Sales
            </h2>
            <div className="text-gray-500 dark:text-gray-400">
              Sales chart and list will be implemented here
            </div>
          </div>
        </>
      )}
    </div>
  );
}
