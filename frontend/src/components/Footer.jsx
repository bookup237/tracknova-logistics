import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Entreprise */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.jpg" alt="TrackNova Logistics" className="h-10 w-auto rounded" />
              <div>
                <span className="text-lg font-bold text-white block leading-none">TrackNova</span>
                <span className="text-[10px] text-sky-400 font-bold tracking-widest uppercase">LOGISTICS</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Opérateur de transport express et de logistique. Acheminement fiable et suivi de colis sur l’ensemble du territoire français.
            </p>
          </div>

          {/* Liens utiles */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link to="/suivi" className="hover:text-white transition-colors">Suivi des colis</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Formules d'expédition</Link></li>
              <li><Link to="/devis" className="hover:text-white transition-colors">Calculer une expédition</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Service client</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Solutions</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>TrackNova Express 24h</li>
              <li>TrackNova Standard 48/72h</li>
              <li>Prise en charge Objets Fragiles</li>
              <li>Fret encombrant et lourd (jusqu’à 70 kg)</li>
              <li>Contrats professionnels e-commerce</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Support France</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-sky-400 flex-shrink-0" />
                <span className="text-slate-200">01 42 68 55 00</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-sky-400 flex-shrink-0" />
                <span>contact@tracknova-logistics.fr</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <span>Plateforme Logistique Paris Roissy, 95700 Roissy-en-France</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      <div className="border-t border-slate-800 bg-slate-950 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 TrackNova Logistics France. Tous droits réservés.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Conditions Générales de Vente</span>
            <span className="hover:text-slate-400 cursor-pointer">Mentions Légales</span>
            <span className="hover:text-slate-400 cursor-pointer">Confidentialité & Données</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
