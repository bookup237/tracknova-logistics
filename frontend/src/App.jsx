import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages publiques
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tracking from './pages/Tracking';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Quote from './pages/Quote';

// Pages Back-office privé
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import Shipments from './admin/Shipments';
import ShipmentForm from './admin/ShipmentForm';
import ShipmentDetail from './admin/ShipmentDetail';
import Messages from './admin/Messages';
import Quotes from './admin/Quotes';

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        {/* 🌐 Routes publiques (Site Client sans aucun lien admin) */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/suivi" element={<PublicLayout><Tracking /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/devis" element={<PublicLayout><Quote /></PublicLayout>} />

        {/* 🔒 Portail d'administration isolé sous route secrète /backoffice-portal */}
        <Route path="/backoffice-portal/login" element={<AdminLogin />} />
        <Route path="/backoffice-portal" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="expeditions" element={<Shipments />} />
          <Route path="expeditions/nouveau" element={<ShipmentForm />} />
          <Route path="expeditions/:id" element={<ShipmentDetail />} />
          <Route path="messages" element={<Messages />} />
          <Route path="devis" element={<Quotes />} />
        </Route>

        {/* Redirection de sécurité */}
        <Route path="/admin" element={<Navigate to="/backoffice-portal/login" replace />} />
        <Route path="/admin/*" element={<Navigate to="/backoffice-portal/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
