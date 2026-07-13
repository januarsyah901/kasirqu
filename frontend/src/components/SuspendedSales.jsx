import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useLanguage } from '../auth/LanguageContext';

export default function SuspendedSales() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let c = false;
    api.get('/sales', { params: { suspended: 1 } })
      .then(r => !c && setItems(r.data?.data?.data || r.data?.data || []))
      .catch(() => !c && setError(t('common.loading')))
      .finally(() => !c && setLoading(false));
    return () => { c = true; };
  }, []);

  const resume = async (id) => {
    try {
      await api.post('/sales/' + id + '/resume');
      const res = await api.get('/sales', { params: { suspended: 1 } });
      setItems(res.data?.data?.data || res.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t('suspended.title')}</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-4 py-3 text-left text-sm">ID</th><th className="px-4 py-3 text-left text-sm">Total</th><th className="px-4 py-3 text-left text-sm">#</th></tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={3} className="px-4 py-6 text-center">{t('common.loading')}</td></tr> : items.length === 0 ? <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">{t('common.noData')}</td></tr> : items.map(s => (
                <tr key={s.sale_id || s.id}>
                  <td className="px-4 py-3 text-sm">{s.sale_id || s.id}</td>
                  <td className="px-4 py-3 text-sm">Rp {Number(s.total || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm"><button onClick={() => resume(s.sale_id || s.id)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">{t('suspended.resume')}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
