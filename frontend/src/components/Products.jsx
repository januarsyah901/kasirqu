import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useLanguage } from '../auth/LanguageContext';

export default function Products() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', item_number: '', cost_price: '', unit_price: '', supplier_id: '', tax_category: '' });

  useEffect(() => {
    let c = false;
    Promise.all([api.get('/products'), api.get('/suppliers')])
      .then(([r, s]) => {
        if (c) return;
        setItems(r.data?.data?.data || r.data?.data || []);
        setSuppliers(Array.isArray(s.data?.data?.data) ? s.data.data.data : (s.data?.data || []));
      })
      .catch(() => !c && setError(t('common.loading')))
      .finally(() => !c && setLoading(false));
    return () => { c = true; };
  }, []);

  const startEdit = (p) => {
    setEditing(p.item_id || p.id);
    setForm({ name: p.name || '', category: p.category || '', item_number: p.item_number || '', cost_price: p.cost_price || '', unit_price: p.unit_price || '', supplier_id: p.supplier_id || '', tax_category: p.tax_category || '' });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const payload = { ...form, cost_price: Number(form.cost_price), unit_price: Number(form.unit_price), supplier_id: Number(form.supplier_id) || null, tax_category_id: form.tax_category ? Number(form.tax_category) : null };
    try {
      if (editing) {
        await api.put('/products/' + editing, payload);
        setEditing(null);
      } else {
        await api.post('/products', payload);
      }
      setForm({ name: '', category: '', item_number: '', cost_price: '', unit_price: '', supplier_id: '', tax_category: '' });
      const res = await api.get('/products');
      setItems(res.data?.data?.data || res.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImage = async (e, id) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(id);
    try {
      const fd = new FormData();
      fd.append('image', file);
      await api.post('/products/' + id + '/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    } catch (err) {
      setError(err?.response?.data?.message || 'Image upload failed');
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t('products.title')}</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('products.name')}</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('products.itemNumber')}</label><input value={form.item_number} onChange={e => setForm({ ...form, item_number: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('products.category')}</label><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('products.costPrice')}</label><input type="number" min="0" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('products.unitPrice')}</label><input type="number" min="0" value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Supplier</label><select value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"><option value="">--</option>{suppliers.map(s => <option key={s.supplier_id || s.id} value={s.supplier_id || s.id}>{s.person_name || s.name}</option>)}</select></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('products.taxCategory')}</label><input value={form.tax_category} onChange={e => setForm({ ...form, tax_category: e.target.value })} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" /></div>
        <div className="md:col-span-3"><button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg">{editing ? 'Update' : t('products.createProduct')}</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', category: '', item_number: '', cost_price: '', unit_price: '', supplier_id: '', tax_category: '' }); }} className="w-full mt-2 text-gray-600">Cancel</button>}</div>
      </form>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4"><h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('common.list')}</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-4 py-3 text-left text-sm">ID</th><th className="px-4 py-3 text-left text-sm">{t('products.name')}</th><th className="px-4 py-3 text-left text-sm">Price</th><th className="px-4 py-3 text-left text-sm">{t('products.image')}</th><th className="px-4 py-3 text-left text-sm">{t('common.save')}</th></tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={5} className="px-4 py-6 text-center">{t('common.loading')}</td></tr> : items.length === 0 ? <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">{t('common.noData')}</td></tr> : items.map(p => (
                <tr key={p.item_id || p.id}>
                  <td className="px-4 py-3 text-sm">{p.item_id || p.id}</td>
                  <td className="px-4 py-3 text-sm">{p.name}</td>
                  <td className="px-4 py-3 text-sm">Rp {Number(p.unit_price || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm"><input type="file" accept="image/*" onChange={e => handleImage(e, p.item_id || p.id)} disabled={uploadingId === (p.item_id || p.id)} /></td>
                  <td className="px-4 py-3 text-sm"><button onClick={() => startEdit(p)} className="text-blue-600">{t('products.edit')}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
