import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Plus, MessageSquare, FileText, 
  LogOut, Menu, X, ArrowUpRight
} from 'lucide-react';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      navigate('/backoffice-portal/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/backoffice-portal/login');
  };

  const menuItems = [
    { to: '/backoffice-portal', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Tableau de bord', exact: true },
    { to: '/backoffice-portal/expeditions', icon: <Package className="h-5 w-5" />, label: 'Gestion des Colis' },
    { to: '/backoffice-portal/expeditions/nouveau', icon: <Plus className="h-5 w-5" />, label: 'Nouvelle expédition' },
    { to: '/backoffice-portal/messages', icon: <MessageSquare className="h-5 w-5" />, label: 'Messages reçus' },
    { to: '/backoffice-portal/devis', icon: <FileText className="h-5 w-5" />, label: 'Demandes de devis' },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-slate-900 border-r border-slate-800">
        {/* Logo Backoffice */}
        <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.jpg" alt="TrackNova" className="h-9 w-auto rounded-md object-contain bg-white p-0.5" />
            <div>
              <span className="text-base font-black text-white leading-none">TrackNova</span>
              <span className="block text-[10px] text-sky-400 font-bold tracking-wider uppercase mt-0.5">BACKOFFICE PRO</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive(item)
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User bar */}
        <div className="px-4 py-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              {user.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.full_name}</p>
              <p className="text-[11px] text-emerald-400 font-mono capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 w-full text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-xl transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-72 flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
          <div className="px-6 h-16 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-xl"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="text-sm font-bold text-white hidden lg:block">
              {menuItems.find(item => isActive(item))?.label || 'Administration'}
            </div>

            <div className="flex items-center gap-4">
              <Link to="/" target="_blank" className="text-xs font-semibold text-slate-400 hover:text-orange-400 flex items-center gap-1 transition-colors">
                Ouvrir le site client <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 sm:p-8 flex-1 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
