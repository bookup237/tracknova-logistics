import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Send, ShieldCheck, Clock, Truck } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

// Liste de secours immédiate pour que le formulaire ne soit JAMAIS vide
const DEFAULT_CITIES = [
  { id: 1, name: 'Paris', code_postal: '75000' },
  { id: 2, name: 'Marseille', code_postal: '13000' },
  { id: 3, name: 'Lyon', code_postal: '69000' },
  { id: 4, name: 'Toulouse', code_postal: '31000' },
  { id: 5, name: 'Nice', code_postal: '06000' },
  { id: 6, name: 'Nantes', code_postal: '44000' },
  { id: 7, name: 'Strasbourg', code_postal: '67000' },
  { id: 8, name: 'Montpellier', code_postal: '34000' },
  { id: 9, name: 'Bordeaux', code_postal: '33000' },
  { id: 10, name: 'Lille', code_postal: '59000' },
  { id: 11, name: 'Rennes', code_postal: '35000' },
  { id: 12, name: 'Reims', code_postal: '51100' },
  { id: 13, name: 'Saint-Étienne', code_postal: '42000' },
  { id: 14, name: 'Toulon', code_postal: '83000' },
  { id: 15, name: 'Le Havre', code_postal: '76600' },
  { id: 16, name: 'Grenoble', code_postal: '38000' },
  { id: 17, name: 'Dijon', code_postal: '21000' },
  { id: 18, name: 'Angers', code_postal: '49000' },
  { id: 19, name: 'Nîmes', code_postal: '30000' },
  { id: 20, name: 'Clermont-Ferrand', code_postal: '63000' },
  { id: 21, name: 'Aix-en-Provence', code_postal: '13100' },
  { id: 22, name: 'Brest', code_postal: '29200' },
  { id: 23, name: 'Tours', code_postal: '37000' },
  { id: 24, name: 'Amiens', code_postal: '80000' },
  { id: 25, name: 'Limoges', code_postal: '87000' },
  { id: 26, name: 'Annecy', code_postal: '74000' },
  { id: 27, name: 'Perpignan', code_postal: '66000' },
  { id: 28, name: 'Metz', code_postal: '57000' },
  { id: 29, name: 'Besançon', code_postal: '25000' },
  { id: 30, name: 'Orléans', code_postal: '45000' },
  { id: 31, name: 'Rouen', code_postal: '76000' },
  { id: 32, name: 'Caen', code_postal: '14000' },
  { id: 33, name: 'Nancy', code_postal: '54000' },
];

export default function Quote() {
  const [searchParams] = useSearchParams();
  const initialOffer = searchParams.get('offre') || 'standard';
  const initialWeight = searchParams.get('poids') || '';

  const [cities, setCities] = useState(DEFAULT_CITIES);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    origin_city_id: '1',
    destination_city_id: '3',
    weight: initialWeight,
    dimensions: '',
    package_type: initialOffer,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    API.get('/public/cities')
      .then(r => {
        if (Array.isArray(r.data) && r.data.length > 0) {
          setCities(r.data);
        }
      })
      .catch(() => {
        // En cas d'erreur réseau, DEFAULT_CITIES reste actif
      });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/public/quote', form);
      setSent(true);
      toast.success('Demande de devis transmise avec succès !');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-slate-50 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-lg w-full text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Demande de devis enregistrée !</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Merci <strong>{form.name}</strong>. Nos conseillers logistiques en France étudient votre demande et vous enverront une proposition chiffrée par email sous 24 heures.
          </p>
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setSent(false);
                setForm({
                  name: '', email: '', phone: '', origin_city_id: '1', destination_city_id: '3',
                  weight: '', dimensions: '', package_type: 'standard', description: ''
                });
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
            >
              Autre estimation
            </button>
            <Link
              to="/suivi"
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Accéder au suivi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* En-tête sobre et clair */}
        <div className="text-center space-y-2">
          <div className="inline-block text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded">
            Service Commercial TrackNova France
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Demander un devis d'expédition gratuit
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Remplissez ce formulaire pour recevoir une tarification personnalisée pour l'envoi de vos colis ou palettes en France.
          </p>
        </div>

        {/* Formulaire complet */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1 : Coordonnées */}
            <div>
              <h2 className="text-base font-bold text-slate-900 border-b border-gray-100 pb-3 mb-4">
                1. Vos coordonnées de contact
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom complet *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Jean Dupont"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email professionnel ou perso *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="jean.dupont@email.fr"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Téléphone *</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="06 12 34 56 78"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2 : Villes d'acheminement */}
            <div>
              <h2 className="text-base font-bold text-slate-900 border-b border-gray-100 pb-3 mb-4">
                2. Trajet & Villes en France
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ville de départ (Expéditeur)</label>
                  <select
                    name="origin_city_id"
                    value={form.origin_city_id}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code_postal})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ville d'arrivée (Destinataire)</label>
                  <select
                    name="destination_city_id"
                    value={form.destination_city_id}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code_postal})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3 : Caractéristiques du colis */}
            <div>
              <h2 className="text-base font-bold text-slate-900 border-b border-gray-100 pb-3 mb-4">
                3. Caractéristiques du colis
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Poids estimé (kg)</label>
                  <input
                    name="weight"
                    type="number"
                    step="0.1"
                    placeholder="Ex : 2.5"
                    value={form.weight}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Dimensions (L × l × H cm)</label>
                  <input
                    name="dimensions"
                    placeholder="Ex : 30 × 20 × 15"
                    value={form.dimensions}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Formule de livraison</label>
                  <select
                    name="package_type"
                    value={form.package_type}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="standard">Standard (48h - 72h)</option>
                    <option value="express">Express 24h prioritaire</option>
                    <option value="fragile">Fragile & Sécurisé</option>
                    <option value="volumineux">Fret Volumineux (&gt; 30kg)</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description ou consignes particulières</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Marchandise fragile, besoin d'un créneau horaire, accès difficile..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>
            </div>

            {/* Garanties & Bouton de validation */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-sky-600" /> Devis 100% gratuit et sans engagement
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-sky-600" /> Réponse sous 24h ouvrées
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-sky-600" /> Prise en charge partout en France
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{loading ? 'Transmission en cours...' : 'Demander mon devis gratuit'}</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
