import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import POSScreen from './components/POSScreen';
import Settings from './components/Settings';
import Reports from './components/Reports';
import Login from './components/Login';
import './index.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('sanctum_token') : null;

  if (!token) {
    return <Login />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <aside className={`bg-blue-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-8">
              <h1 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>
                KasirQu
              </h1>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-blue-800 rounded"
              >
                {sidebarOpen ? '←' : '→'}
              </button>
            </div>
            <nav className="space-y-2">
              <Link
                to="/"
                className="flex items-center space-x-3 p-3 hover:bg-blue-800 rounded transition-colors"
              >
                <span className="text-xl">📊</span>
                {sidebarOpen && <span>Dashboard</span>}
              </Link>
              <Link
                to="/pos"
                className="flex items-center space-x-3 p-3 hover:bg-blue-800 rounded transition-colors"
              >
                <span className="text-xl">💳</span>
                {sidebarOpen && <span>Point of Sale</span>}
              </Link>
              <Link
                to="/reports"
                className="flex items-center space-x-3 p-3 hover:bg-blue-800 rounded transition-colors"
              >
                <span className="text-xl">📈</span>
                {sidebarOpen && <span>Reports</span>}
              </Link>
              <Link
                to="/settings"
                className="flex items-center space-x-3 p-3 hover:bg-blue-800 rounded transition-colors"
              >
                <span className="text-xl">⚙️</span>
                {sidebarOpen && <span>Settings</span>}
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pos" element={<POSScreen />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
