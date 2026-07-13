import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useLanguage } from '../auth/LanguageContext';

export default function Expenses() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ amount: '', category: '', description: '', date: new Date().toISOString().slice(0, 10), location_id: '' });

  useEffect(() => {
    let c = false;
    Promise.all([api.get('/expenses'), api.get('/locations')])
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
      await api.post('/expenses', { ...form, employee_id: 1, amount: Number(form.amount) });
      setForm({ amount: '', category: '', description: '', date: new Date().toISOString().slice(0, 10), location_id: '' });
      const res = await api.get('/expenses');
      setItems(res.data?.data?.data || res.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t('expenses.title')}</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('expenses.amount')}</label>
          <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('expenses.category')}</label>
          <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('expenses.date')}</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('inventory.tabTransfer').includes('Transfer') ? 'Location' : 'Location'}</label>
          <select value={form.location_id} onChange={e => setForm({ ...form, location_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
            <option value="">--</option>
            {locations.map(l => <option key={l.location_id || l.id} value={l.location_id || l.id}>{l.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('expenses.description')}</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
        <div className="md:col-span-3">
          <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg">{t('expenses.createExpense')}</button>
        </div>
      </form>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4"><h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('common.list')}</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-4 py-3 text-left text-sm">ID</th><th className="px-4 py-3 text-left text-sm">{t('expenses.amount')}</th><th className="px-4 py-3 text-left text-sm">{t('expenses.category')}</th><th className="px-4 py-3 text-left text-sm">{t('expenses.date')}</th></tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={4} className="px-4 py-6 text-center">{t('common.loading')}</td></tr> : items.length === 0 ? <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">{t('common.noData')}</td></tr> : items.map(x => (
                <tr key={x.expense_id || x.id}><td className="px-4 py-3 text-sm">{x.expense_id || x.id}</td><td className="px-4 py-3 text-sm">Rp {Number(x.amount || 0).toLocaleString()}</td><td className="px-4 py-3 text-sm">{x.category || '-'}</td><td className="px-4 py-3 text-sm">{x.date || '-'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
