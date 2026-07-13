import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useLanguage } from '../auth/LanguageContext';

export default function CashUp() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ open_amount: '', close_amount: '', cash_sales_amount: '', open_date: '', close_date: '', location_id: '' });

  useEffect(() => {
    let c = false;
    Promise.all([api.get('/cash_up'), api.get('/locations')])
      .then(([r, l]) => {
        if (c) return;
        setItems(r.data?.data?.data || r.data?.data || []);
        setLocations(Array.isArray(l.data?.data?.data) ? l.data.data.data : (l.data?.data || []));
      })
      .catch(() => !c && setError(t('common.loading')))
      .finally(() => !c && setLoading(false));
    return () => { c = true; };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/cash_up', { ...form, employee_id: 1, open_amount: Number(form.open_amount), close_amount: Number(form.close_amount), cash_sales_amount: Number(form.cash_sales_amount) });
      setForm({ open_amount: '', close_amount: '', cash_sales_amount: '', open_date: '', close_date: '', location_id: '' });
      const res = await api.get('/cash_up');
      setItems(res.data?.data?.data || res.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t('cashup.title')}</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {['open_amount', 'close_amount', 'cash_sales_amount', 'open_date', 'close_date'].map(k => (
          <div key={k}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('cashup.' + k)}</label>
            <input type={k.includes('date') ? 'date' : 'number'} step="0.01" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
          <select value={form.location_id} onChange={e => setForm({ ...form, location_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required>
            <option value="">--</option>
            {locations.map(l => <option key={l.location_id || l.id} value={l.location_id || l.id}>{l.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-3">
          <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg">{t('cashup.createCashUp')}</button>
        </div>
      </form>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4"><h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('common.list')}</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-4 py-3 text-left text-sm">ID</th><th className="px-4 py-3 text-left text-sm">Open</th><th className="px-4 py-3 text-left text-sm">Close</th><th className="px-4 py-3 text-left text-sm">Cash Sales</th></tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={4} className="px-4 py-6 text-center">{t('common.loading')}</td></tr> : items.length === 0 ? <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">{t('common.noData')}</td></tr> : items.map(x => (
                <tr key={x.cash_up_id || x.id}><td className="px-4 py-3 text-sm">{x.cash_up_id || x.id}</td><td className="px-4 py-3 text-sm">{x.open_amount}</td><td className="px-4 py-3 text-sm">{x.close_amount}</td><td className="px-4 py-3 text-sm">{x.cash_sales_amount}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
