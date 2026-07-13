import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useLanguage } from '../auth/LanguageContext';

export default function Giftcards() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ number: '', value: '', customer_id: '' });
  const [checkNumber, setCheckNumber] = useState('');
  const [balanceResult, setBalanceResult] = useState(null);

  useEffect(() => {
    let c = false;
    api.get('/giftcards').then(r => !c && setItems(r.data?.data?.data || r.data?.data || [])).catch(() => !c && setError(t('common.loading'))).finally(() => !c && setLoading(false));
    return () => { c = true; };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/giftcards', { giftcard_number: form.number ? Number(form.number) : null, value: Number(form.value), person_id: form.customer_id ? Number(form.customer_id) : null });
      setForm({ number: '', value: '', customer_id: '' });
      const res = await api.get('/giftcards');
      setItems(res.data?.data?.data || res.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const checkBalance = async (e) => {
    e.preventDefault();
    setBalanceResult(null);
    try {
      const res = await api.get('/giftcards/check', { params: { number: checkNumber } });
      setBalanceResult(res.data?.data || res.data);
    } catch {
      setBalanceResult({ error: 'Not found or invalid' });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t('giftcards.title')}</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('giftcards.number')}</label><input value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('giftcards.value')}</label><input type="number" min="0" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('giftcards.customer')}</label><input value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" /></div>
        <div className="flex items-end"><button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg">{t('giftcards.createGiftcard')}</button></div>
      </form>
      <form onSubmit={checkBalance} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 flex items-end gap-4">
        <div className="flex-1"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('giftcards.checkBalance')}</label><input value={checkNumber} onChange={e => setCheckNumber(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required /></div>
        <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg">{t('giftcards.checkBalance')}</button>
      </form>
      {balanceResult && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <p className="text-gray-700 dark:text-gray-300">{balanceResult.error ? balanceResult.error : `${t('giftcards.balance')}: Rp ${Number(balanceResult.value ?? balanceResult.balance ?? 0).toLocaleString()}`}</p>
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4"><h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('common.list')}</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-4 py-3 text-left text-sm">ID</th><th className="px-4 py-3 text-left text-sm">{t('giftcards.number')}</th><th className="px-4 py-3 text-left text-sm">{t('giftcards.value')}</th></tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={3} className="px-4 py-6 text-center">{t('common.loading')}</td></tr> : items.length === 0 ? <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">{t('common.noData')}</td></tr> : items.map(x => (
                <tr key={x.giftcard_id || x.id}><td className="px-4 py-3 text-sm">{x.giftcard_id || x.id}</td><td className="px-4 py-3 text-sm">{x.giftcard_number || x.number}</td><td className="px-4 py-3 text-sm">Rp {Number(x.value || 0).toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
