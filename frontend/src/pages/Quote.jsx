import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Send, ShieldCheck, Clock, Truck, MapPin, Search, ChevronDown, Check } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

// Base de données des 70 principales villes et départements de France
const ALL_FRENCH_CITIES = [
  { id: 1, name: 'Paris', code_postal: '75000', departement: 'Paris (75)' },
  { id: 2, name: 'Marseille', code_postal: '13000', departement: 'Bouches-du-Rhône (13)' },
  { id: 3, name: 'Lyon', code_postal: '69000', departement: 'Rhône (69)' },
  { id: 4, name: 'Toulouse', code_postal: '31000', departement: 'Haute-Garonne (31)' },
  { id: 5, name: 'Nice', code_postal: '06000', departement: 'Alpes-Maritimes (06)' },
  { id: 6, name: 'Nantes', code_postal: '44000', departement: 'Loire-Atlantique (44)' },
  { id: 7, name: 'Montpellier', code_postal: '34000', departement: 'Hérault (34)' },
  { id: 8, name: 'Strasbourg', code_postal: '67000', departement: 'Bas-Rhin (67)' },
  { id: 9, name: 'Bordeaux', code_postal: '33000', departement: 'Gironde (33)' },
  { id: 10, name: 'Lille', code_postal: '59000', departement: 'Nord (59)' },
  { id: 11, name: 'Rennes', code_postal: '35000', departement: 'Ille-et-Vilaine (35)' },
  { id: 12, name: 'Reims', code_postal: '51100', departement: 'Marne (51)' },
  { id: 13, name: 'Saint-Étienne', code_postal: '42000', departement: 'Loire (42)' },
  { id: 14, name: 'Toulon', code_postal: '83000', departement: 'Var (83)' },
  { id: 15, name: 'Le Havre', code_postal: '76600', departement: 'Seine-Maritime (76)' },
  { id: 16, name: 'Grenoble', code_postal: '38000', departement: 'Isère (38)' },
  { id: 17, name: 'Dijon', code_postal: '21000', departement: 'Côte-d\'Or (21)' },
  { id: 18, name: 'Angers', code_postal: '49000', departement: 'Maine-et-Loire (49)' },
  { id: 19, name: 'Nîmes', code_postal: '30000', departement: 'Gard (30)' },
  { id: 20, name: 'Villeurbanne', code_postal: '69100', departement: 'Rhône (69)' },
  { id: 21, name: 'Clermont-Ferrand', code_postal: '63000', departement: 'Puy-de-Dôme (63)' },
  { id: 22, name: 'Aix-en-Provence', code_postal: '13100', departement: 'Bouches-du-Rhône (13)' },
  { id: 23, name: 'Brest', code_postal: '29200', departement: 'Finistère (29)' },
  { id: 24, name: 'Tours', code_postal: '37000', departement: 'Indre-et-Loire (37)' },
  { id: 25, name: 'Amiens', code_postal: '80000', departement: 'Somme (80)' },
  { id: 26, name: 'Limoges', code_postal: '87000', departement: 'Haute-Vienne (87)' },
  { id: 27, name: 'Annecy', code_postal: '74000', departement: 'Haute-Savoie (74)' },
  { id: 28, name: 'Perpignan', code_postal: '66000', departement: 'Pyrénées-Orientales (66)' },
  { id: 29, name: 'Boulogne-Billancourt', code_postal: '92100', departement: 'Hauts-de-Seine (92)' },
  { id: 30, name: 'Metz', code_postal: '57000', departement: 'Moselle (57)' },
  { id: 31, name: 'Besançon', code_postal: '25000', departement: 'Doubs (25)' },
  { id: 32, name: 'Orléans', code_postal: '45000', departement: 'Loiret (45)' },
  { id: 33, name: 'Saint-Denis', code_postal: '93200', departement: 'Seine-Saint-Denis (93)' },
  { id: 34, name: 'Rouen', code_postal: '76000', departement: 'Seine-Maritime (76)' },
  { id: 35, name: 'Argenteuil', code_postal: '95100', departement: 'Val-d\'Oise (95)' },
  { id: 36, name: 'Montreuil', code_postal: '93100', departement: 'Seine-Saint-Denis (93)' },
  { id: 37, name: 'Mulhouse', code_postal: '68100', departement: 'Haut-Rhin (68)' },
  { id: 38, name: 'Caen', code_postal: '14000', departement: 'Calvados (14)' },
  { id: 39, name: 'Nancy', code_postal: '54000', departement: 'Meurthe-et-Moselle (54)' },
  { id: 40, name: 'Tourcoing', code_postal: '59200', departement: 'Nord (59)' },
  { id: 41, name: 'Roubaix', code_postal: '59100', departement: 'Nord (59)' },
  { id: 42, name: 'Nanterre', code_postal: '92000', departement: 'Hauts-de-Seine (92)' },
  { id: 43, name: 'Vitry-sur-Seine', code_postal: '94400', departement: 'Val-de-Marne (94)' },
  { id: 44, name: 'Avignon', code_postal: '84000', departement: 'Vaucluse (84)' },
  { id: 45, name: 'Créteil', code_postal: '94000', departement: 'Val-de-Marne (94)' },
  { id: 46, name: 'Dunkerque', code_postal: '59140', departement: 'Nord (59)' },
  { id: 47, name: 'Poitiers', code_postal: '86000', departement: 'Vienne (86)' },
  { id: 48, name: 'Aubervilliers', code_postal: '93300', departement: 'Seine-Saint-Denis (93)' },
  { id: 49, name: 'Calais', code_postal: '62100', departement: 'Pas-de-Calais (62)' },
  { id: 50, name: 'Cannes', code_postal: '06400', departement: 'Alpes-Maritimes (06)' },
  { id: 51, name: 'Antibes', code_postal: '06600', departement: 'Alpes-Maritimes (06)' },
  { id: 52, name: 'Béziers', code_postal: '34500', departement: 'Hérault (34)' },
  { id: 53, name: 'Bourges', code_postal: '18000', departement: 'Cher (18)' },
  { id: 54, name: 'La Rochelle', code_postal: '17000', departement: 'Charente-Maritime (17)' },
  { id: 55, name: 'Pau', code_postal: '64000', departement: 'Pyrénées-Atlantiques (64)' },
  { id: 56, name: 'Saint-Nazaire', code_postal: '44600', departement: 'Loire-Atlantique (44)' },
  { id: 57, name: 'Valence', code_postal: '26000', departement: 'Drôme (26)' },
  { id: 58, name: 'Lorient', code_postal: '56100', departement: 'Morbihan (56)' },
  { id: 59, name: 'Troyes', code_postal: '10000', departement: 'Aube (10)' },
  { id: 60, name: 'Chambéry', code_postal: '73000', departement: 'Savoie (73)' },
  { id: 61, name: 'Niort', code_postal: '79000', departement: 'Deux-Sèvres (79)' },
  { id: 62, name: 'Colmar', code_postal: '68000', departement: 'Haut-Rhin (68)' },
  { id: 63, name: 'Vannes', code_postal: '56000', departement: 'Morbihan (56)' },
  { id: 64, name: 'Saint-Malo', code_postal: '35400', departement: 'Ille-et-Vilaine (35)' },
  { id: 65, name: 'Ajaccio', code_postal: '20000', departement: 'Corse-du-Sud (2A)' },
  { id: 66, name: 'Bastia', code_postal: '20200', departement: 'Haute-Corse (2B)' },
  { id: 67, name: 'Bayonne', code_postal: '64100', departement: 'Pyrénées-Atlantiques (64)' },
  { id: 68, name: 'Angoulême', code_postal: '16000', departement: 'Charente (16)' },
  { id: 69, name: 'Albi', code_postal: '81000', departement: 'Tarn (81)' },
  { id: 70, name: 'Carcassonne', code_postal: '11000', departement: 'Aude (11)' },
];

const POPULAR_QUICK_CITIES = [
  { id: 1, name: 'Paris', code: '75' },
  { id: 3, name: 'Lyon', code: '69' },
  { id: 2, name: 'Marseille', code: '13' },
  { id: 4, name: 'Toulouse', code: '31' },
  { id: 9, name: 'Bordeaux', code: '33' },
  { id: 6, name: 'Nantes', code: '44' },
  { id: 10, name: 'Lille', code: '59' },
  { id: 8, name: 'Strasbourg', code: '67' },
  { id: 5, name: 'Nice', code: '06' },
];

/**
 * Composant de sélection de ville avec recherche instantanée et suggestions visuelles
 */
function CityAutocomplete({ label, selectedId, onSelect, allCities }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  const selectedCity = allCities.find(c => Number(c.id) === Number(selectedId)) || allCities[0];

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
    ? allCities.slice(0, 15)
    : allCities.filter(c => {
        const q = searchTerm.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.code_postal.includes(q) ||
          (c.departement && c.departement.toLowerCase().includes(q))
        );
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
        {POPULAR_QUICK_CITIES.map(quick => (
          <button
            key={quick.id}
            type="button"
            onClick={() => onSelect(quick.id)}
            className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-colors ${
              Number(selectedId) === Number(quick.id)
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-sky-100 hover:text-sky-800 border border-slate-200'
            }`}
          >
            {quick.name} ({quick.code})
          </button>
        ))}
      </div>

    </div>
  );
}

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
    destination_city_id: 3, // Lyon par défaut
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
                    className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Formule de livraison</label>
                  <select
                    name="package_type"
                    value={form.package_type}
                    onChange={handleChange}
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
