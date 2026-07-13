import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    totalProducts: 0,
    lowStock: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    // TODO: Fetch real stats from API
    setStats({
      todaySales: 1250000,
      totalProducts: 145,
      lowStock: 8,
      totalCustomers: 89,
    });
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
          title="Customers"
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
    </div>
  );
}
