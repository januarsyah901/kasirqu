import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import POSScreen from './components/POSScreen';
import Settings from './components/Settings';
import Reports from './components/Reports';
import Login from './components/Login';
import Receivings from './components/Receivings';
import Expenses from './components/Expenses';
import CashUp from './components/CashUp';
import Inventory from './components/Inventory';
import Giftcards from './components/Giftcards';
import ItemKits from './components/ItemKits';
import Products from './components/Products';
import SuspendedSales from './components/SuspendedSales';
import { LanguageProvider, useLanguage } from './auth/LanguageContext';
import './index.css';

function Sidebar() {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const links = [
    { to: '/', emoji: '📊', label: t('nav.dashboard') },
    { to: '/pos', emoji: '💳', label: t('nav.pos') },
    { to: '/reports', emoji: '📈', label: t('nav.reports') },
    { to: '/receivings', emoji: '📦', label: t('nav.receivings') },
    { to: '/expenses', emoji: '💸', label: t('nav.expenses') },
    { to: '/cashup', emoji: '💰', label: t('nav.cashup') },
    { to: '/inventory', emoji: '🗃️', label: t('nav.inventory') },
    { to: '/giftcards', emoji: '🎁', label: t('nav.giftcards') },
    { to: '/itemkits', emoji: '🧩', label: t('nav.itemkits') },
    { to: '/products', emoji: '🛒', label: t('nav.products') },
    { to: '/suspended', emoji: '⏸️', label: t('nav.suspended') },
    { to: '/settings', emoji: '⚙️', label: t('nav.settings') },
  ];
  return (
    <aside className={`bg-blue-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>KasirQu</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-blue-800 rounded">{sidebarOpen ? '←' : '→'}</button>
        </div>
        <nav className="space-y-2">
          {links.map(l => (
            <Link key={l.to} to={l.to} className="flex items-center space-x-3 p-3 hover:bg-blue-800 rounded transition-colors">
              <span className="text-xl">{l.emoji}</span>
              {sidebarOpen && <span>{l.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}

function Shell() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sanctum_token') : null;
  if (!token) return <Login />;
  return (
    <Router>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pos" element={<POSScreen />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/receivings" element={<Receivings />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/cashup" element={<CashUp />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/giftcards" element={<Giftcards />} />
            <Route path="/itemkits" element={<ItemKits />} />
            <Route path="/products" element={<Products />} />
            <Route path="/suspended" element={<SuspendedSales />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Shell />
    </LanguageProvider>
  );
}

export default App;
