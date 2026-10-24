import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { to: '/', label: 'Accueil' },
    { to: '/suivi', label: 'Suivre un colis' },
    { to: '/services', label: 'Services & Tarifs' },
    { to: '/devis', label: 'Estimer un tarif' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`sticky top-0 z-50 bg-white transition-all duration-200 ${scrolled ? 'shadow-md border-b border-gray-200' : 'border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo officiel de l'entreprise */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo.jpg" 
              alt="TrackNova Logistics" 
              className="h-12 w-auto object-contain rounded-md"
            />
            <div className="hidden sm:block">
              <div className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                Track<span className="text-sky-600">Nova</span>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase mt-0.5">
                LOGISTICS FRANCE
              </div>
            </div>
          </Link>

          {/* Navigation sobre et pro */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-semibold transition-colors ${
                  isActive(link.to)
                    ? 'text-sky-600'
                    : 'text-slate-700 hover:text-sky-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action principale */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/devis"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <span>Expédier un colis</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2 shadow-lg">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-semibold ${
                isActive(link.to)
                  ? 'bg-sky-50 text-sky-600'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              to="/devis"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-4 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-lg shadow-sm"
            >
              Expédier un colis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
