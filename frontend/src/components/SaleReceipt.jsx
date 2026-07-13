import { useLanguage } from '../auth/LanguageContext';

// Printable receipt. Forces a light (white) layout regardless of dark mode.
export default function SaleReceipt({ sale, store }) {
  const { t } = useLanguage();
  const items = sale?.items || [];
  const total = items.reduce((s, it) => s + (it.unit_price || it.price || 0) * (it.quantity || 1), 0);
  const payment = sale?.payment_type || (sale?.payments?.[0]?.payment_type) || 'Cash';
  return (
    <div className="receipt-print bg-white text-black p-6 w-[320px] mx-auto" style={{ fontFamily: 'monospace', color: '#000' }}>
      <h2 className="text-center text-lg font-bold mb-1">{store?.name || 'KasirQu Store'}</h2>
      {store?.address && <p className="text-center text-xs mb-1">{store.address}</p>}
      {store?.phone && <p className="text-center text-xs mb-2">{store.phone}</p>}
      <hr className="border-black my-2" />
      <p className="text-xs">Invoice: {sale?.invoice_number || '-'}</p>
      <p className="text-xs mb-2">Date: {sale?.sale_time || new Date().toLocaleString()}</p>
      <hr className="border-black my-2" />
      <table className="w-full text-xs">
        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td className="py-1">{it.name}</td>
              <td className="text-right py-1">{it.quantity} x Rp {(it.unit_price || it.price || 0).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr className="border-black my-2" />
      <div className="flex justify-between text-sm font-bold">
        <span>Total</span>
        <span>Rp {total.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span>Payment</span>
        <span>{payment}</span>
      </div>
      <hr className="border-black my-2" />
      <p className="text-center text-xs">*** Thank you ***</p>
    </div>
  );
}
