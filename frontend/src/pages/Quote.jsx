import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Send, ShieldCheck, Clock, Truck, MapPin, Search, ChevronDown, Check } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { ALL_FRENCH_CITIES, POPULAR_QUICK_CITIES } from '../data/cities';

/**
 * Composant de sélection de ville avec recherche instantanée et suggestions visuelles
 */
function CityAutocomplete({ label, selectedId, onSelect, allCities = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  const safeCities = Array.isArray(allCities) && allCities.length > 0 ? allCities : ALL_FRENCH_CITIES;
  const selectedCity = safeCities.find(c => Number(c?.id) === Number(selectedId)) || safeCities[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrer les propositions selon la recherche
  const filtered = searchTerm.trim() === ''
    ? safeCities.slice(0, 15)
    : safeCities.filter(c => {
        if (!c) return false;
        const q = searchTerm.toLowerCase();
        const nameMatch = c.name && c.name.toLowerCase().includes(q);
        const postalMatch = c.code_postal && String(c.code_postal).includes(q);
        const depMatch = c.departement && c.departement.toLowerCase().includes(q);
        return Boolean(nameMatch || postalMatch || depMatch);
      }).slice(0, 15);

  return (
    <div className="space-y-1.5 relative" ref={wrapperRef}>
      <label className="block text-xs font-bold text-slate-800">{label}</label>

      {/* Champ principal cliquable */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3.5 py-3 text-left bg-white border-2 border-slate-300 hover:border-sky-500 rounded-xl flex items-center justify-between text-slate-900 font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4 text-sky-600 flex-shrink-0" />
            <span className="text-slate-900 font-bold text-sm">
              {selectedCity ? `${selectedCity.name} (${selectedCity.code_postal})` : 'Sélectionner une ville'}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Menu déroulant des propositions avec recherche en direct */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
            
            {/* Barre de recherche interne */}
            <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400 ml-1" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tapez le nom ou code postal (ex : Lyon, 69)..."
                autoFocus
                className="w-full px-2 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
              />
            </div>

            {/* Liste scrollable des villes proposées */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <div className="p-4 text-xs text-slate-500 text-center">
                  Aucune ville trouvée pour "{searchTerm}".
                </div>
              ) : (
                filtered.map(city => {
                  const isSelected = Number(city.id) === Number(selectedId);
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => {
                        onSelect(city.id);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-sky-50 transition-colors ${
                        isSelected ? 'bg-sky-100/60 font-bold text-sky-900' : 'text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{city.name}</div>
                        <div className="text-[11px] text-slate-500">{city.departement || city.code_postal}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                          {city.code_postal}
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-sky-600" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

          </div>
        )}
      </div>

      {/* Raccourcis 1 clic vers les grandes métropoles */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] text-slate-500 font-medium mr-1">Grandes villes :</span>
        {POPULAR_QUICK_CITIES.map(quick => {
          const matchingCity = allCities.find(c => c.name.toLowerCase() === quick.name.toLowerCase());
          const isSelected = matchingCity && Number(selectedId) === Number(matchingCity.id);
          return (
            <button
              key={quick.name}
              type="button"
              onClick={() => {
                if (matchingCity) {
                  onSelect(matchingCity.id);
                }
              }}
              className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-colors ${
                isSelected
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-sky-100 hover:text-sky-800 border border-slate-200'
              }`}
            >
              {quick.name} ({quick.code})
            </button>
          );
        })}
      </div>

    </div>
  );
}

const INPUT_STYLE = {
  color: '#0f172a',
  backgroundColor: '#ffffff',
  WebkitTextFillColor: '#0f172a'
};

export default function Quote() {
  const [searchParams] = useSearchParams();
  const initialOffer = searchParams.get('offre') || 'standard';
  const initialWeight = searchParams.get('poids') || '';

  const [cities, setCities] = useState(ALL_FRENCH_CITIES);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    origin_city_id: 1, // Paris par défaut
    destination_city_id: 10, // Lyon par défaut (ID 10)
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
        // En cas de souci réseau, ALL_FRENCH_CITIES reste immédiatement disponible
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-lg w-full text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Demande de devis enregistrée !</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Merci <strong>{form.name}</strong>. Nos conseillers logistiques en France étudient votre demande et vous enverront une proposition chiffrée par email sous 24 heures ouvrées.
          </p>
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setSent(false);
                setForm({
                  name: '', email: '', phone: '', origin_city_id: 1, destination_city_id: 3,
                  weight: '', dimensions: '', package_type: 'standard', description: ''
                });
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Faire une autre estimation
            </button>
            <Link
              to="/suivi"
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Accéder au suivi en direct
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* En-tête sobre et clair */}
        <div className="text-center space-y-2">
          <div className="inline-block text-xs font-bold text-sky-800 bg-sky-100 border border-sky-300 px-3 py-1 rounded">
            Service Commercial TrackNova France
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Demander un devis d'expédition gratuit
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto font-normal">
            Remplissez ce formulaire pour recevoir une tarification personnalisée pour l'envoi de vos colis ou palettes en France.
          </p>
        </div>

        {/* Formulaire complet à fond blanc avec texte noir garanti */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1 : Coordonnées */}
            <div>
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-3 mb-4">
                1. Vos coordonnées de contact
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Nom complet *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    style={INPUT_STYLE}
                    placeholder="Jean Dupont"
                    className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Email professionnel ou perso *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    style={INPUT_STYLE}
                    placeholder="jean.dupont@email.fr"
                    className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Téléphone *</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    style={INPUT_STYLE}
                    placeholder="06 12 34 56 78"
                    className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 2 : Villes d'acheminement avec propositions en direct */}
            <div>
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-3 mb-4">
                2. Trajet & Villes en France
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <CityAutocomplete
                  label="Ville de départ (Expéditeur)"
                  selectedId={form.origin_city_id}
                  onSelect={(id) => setForm({ ...form, origin_city_id: id })}
                  allCities={cities}
                />
                <CityAutocomplete
                  label="Ville d'arrivée (Destinataire)"
                  selectedId={form.destination_city_id}
                  onSelect={(id) => setForm({ ...form, destination_city_id: id })}
                  allCities={cities}
                />
              </div>
            </div>

            {/* Section 3 : Caractéristiques du colis */}
            <div>
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-3 mb-4">
                3. Caractéristiques du colis
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Poids estimé (kg)</label>
                  <input
                    name="weight"
                    type="number"
                    step="0.1"
                    placeholder="Ex : 2.5"
                    value={form.weight}
                    onChange={handleChange}
                    style={INPUT_STYLE}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Dimensions (L × l × H cm)</label>
                  <input
                    name="dimensions"
                    placeholder="Ex : 30 × 20 × 15"
                    value={form.dimensions}
                    onChange={handleChange}
                    style={INPUT_STYLE}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Formule de livraison</label>
                  <select
                    name="package_type"
                    value={form.package_type}
                    onChange={handleChange}
                    style={INPUT_STYLE}
                    className="w-full px-3.5 py-2.5 text-sm font-bold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                  >
                    <option value="standard" className="text-slate-900 bg-white">Standard (48h - 72h)</option>
                    <option value="express" className="text-slate-900 bg-white">Express 24h prioritaire</option>
                    <option value="fragile" className="text-slate-900 bg-white">Fragile & Sécurisé</option>
                    <option value="volumineux" className="text-slate-900 bg-white">Fret Volumineux (&gt; 30kg)</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Description ou consignes particulières</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  style={INPUT_STYLE}
                  placeholder="Marchandise fragile, besoin d'un créneau horaire, accès difficile..."
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm resize-none"
                />
              </div>
            </div>

            {/* Garanties & Bouton de validation */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 font-medium">
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
                className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white font-black text-sm rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
