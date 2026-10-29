import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Send, ArrowLeft, MapPin, Search, ChevronDown, Check, Copy, ExternalLink, CheckCircle2, PlusCircle, ArrowRight } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const INPUT_STYLE = {
  color: '#0f172a',
  backgroundColor: '#ffffff',
  WebkitTextFillColor: '#0f172a'
};

const ALL_FRENCH_CITIES = [
  { id: 1, name: 'Paris', code_postal: '75000', region: 'Île-de-France' },
  { id: 2, name: 'Marseille', code_postal: '13000', region: 'Provence-Alpes-Côte d\'Azur' },
  { id: 3, name: 'Lyon', code_postal: '69000', region: 'Auvergne-Rhône-Alpes' },
  { id: 4, name: 'Toulouse', code_postal: '31000', region: 'Occitanie' },
  { id: 5, name: 'Nice', code_postal: '06000', region: 'Provence-Alpes-Côte d\'Azur' },
  { id: 6, name: 'Nantes', code_postal: '44000', region: 'Pays de la Loire' },
  { id: 7, name: 'Montpellier', code_postal: '34000', region: 'Occitanie' },
  { id: 8, name: 'Strasbourg', code_postal: '67000', region: 'Grand Est' },
  { id: 9, name: 'Bordeaux', code_postal: '33000', region: 'Nouvelle-Aquitaine' },
  { id: 10, name: 'Lille', code_postal: '59000', region: 'Hauts-de-France' },
  { id: 11, name: 'Rennes', code_postal: '35000', region: 'Bretagne' },
  { id: 12, name: 'Reims', code_postal: '51100', region: 'Grand Est' },
  { id: 13, name: 'Saint-Étienne', code_postal: '42000', region: 'Auvergne-Rhône-Alpes' },
  { id: 14, name: 'Toulon', code_postal: '83000', region: 'Provence-Alpes-Côte d\'Azur' },
  { id: 15, name: 'Le Havre', code_postal: '76600', region: 'Normandie' },
  { id: 16, name: 'Grenoble', code_postal: '38000', region: 'Auvergne-Rhône-Alpes' },
  { id: 17, name: 'Dijon', code_postal: '21000', region: 'Bourgogne-Franche-Comté' },
  { id: 18, name: 'Angers', code_postal: '49000', region: 'Pays de la Loire' },
  { id: 19, name: 'Nîmes', code_postal: '30000', region: 'Occitanie' },
  { id: 20, name: 'Villeurbanne', code_postal: '69100', region: 'Auvergne-Rhône-Alpes' },
  { id: 21, name: 'Clermont-Ferrand', code_postal: '63000', region: 'Auvergne-Rhône-Alpes' },
  { id: 22, name: 'Aix-en-Provence', code_postal: '13100', region: 'Provence-Alpes-Côte d\'Azur' },
  { id: 23, name: 'Brest', code_postal: '29200', region: 'Bretagne' },
  { id: 24, name: 'Tours', code_postal: '37000', region: 'Centre-Val de Loire' },
  { id: 25, name: 'Amiens', code_postal: '80000', region: 'Hauts-de-France' },
  { id: 26, name: 'Limoges', code_postal: '87000', region: 'Nouvelle-Aquitaine' },
  { id: 27, name: 'Annecy', code_postal: '74000', region: 'Auvergne-Rhône-Alpes' },
  { id: 28, name: 'Perpignan', code_postal: '66000', region: 'Occitanie' },
  { id: 29, name: 'Boulogne-Billancourt', code_postal: '92100', region: 'Île-de-France' },
  { id: 30, name: 'Metz', code_postal: '57000', region: 'Grand Est' },
  { id: 31, name: 'Besançon', code_postal: '25000', region: 'Bourgogne-Franche-Comté' },
  { id: 32, name: 'Orléans', code_postal: '45000', region: 'Centre-Val de Loire' },
  { id: 33, name: 'Saint-Denis', code_postal: '93200', region: 'Île-de-France' },
  { id: 34, name: 'Rouen', code_postal: '76000', region: 'Normandie' },
  { id: 35, name: 'Argenteuil', code_postal: '95100', region: 'Île-de-France' },
  { id: 36, name: 'Montreuil', code_postal: '93100', region: 'Île-de-France' },
  { id: 37, name: 'Mulhouse', code_postal: '68100', region: 'Grand Est' },
  { id: 38, name: 'Caen', code_postal: '14000', region: 'Normandie' },
  { id: 39, name: 'Nancy', code_postal: '54000', region: 'Grand Est' },
  { id: 40, name: 'Tourcoing', code_postal: '59200', region: 'Hauts-de-France' },
  { id: 41, name: 'Roubaix', code_postal: '59100', region: 'Hauts-de-France' },
  { id: 42, name: 'Nanterre', code_postal: '92000', region: 'Île-de-France' },
  { id: 43, name: 'Vitry-sur-Seine', code_postal: '94400', region: 'Île-de-France' },
  { id: 44, name: 'Avignon', code_postal: '84000', region: 'Provence-Alpes-Côte d\'Azur' },
  { id: 45, name: 'Créteil', code_postal: '94000', region: 'Île-de-France' },
  { id: 46, name: 'Dunkerque', code_postal: '59140', region: 'Hauts-de-France' },
  { id: 47, name: 'Poitiers', code_postal: '86000', region: 'Nouvelle-Aquitaine' },
  { id: 48, name: 'Aubervilliers', code_postal: '93300', region: 'Île-de-France' },
  { id: 49, name: 'Calais', code_postal: '62100', region: 'Hauts-de-France' },
  { id: 50, name: 'Cannes', code_postal: '06400', region: 'Provence-Alpes-Côte d\'Azur' },
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

function CitySelector({ label, selectedId, onSelect, allCities }) {
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

  const filtered = searchTerm.trim() === ''
    ? allCities.slice(0, 15)
    : allCities.filter(c => {
        const q = searchTerm.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.code_postal.includes(q) ||
          (c.region && c.region.toLowerCase().includes(q))
        );
      }).slice(0, 15);

  return (
    <div className="space-y-1.5 relative" ref={wrapperRef}>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{label} *</label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3.5 py-2.5 text-left bg-white border-2 border-slate-300 hover:border-sky-500 rounded-xl flex items-center justify-between text-slate-900 font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4 text-sky-600 flex-shrink-0" />
            <span className="text-slate-900 font-bold text-sm">
              {selectedCity ? `${selectedCity.name} (${selectedCity.code_postal})` : 'Sélectionnez la ville'}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400 ml-1" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrer par nom ou code postal..."
                autoFocus
                className="w-full px-2 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
              />
            </div>

            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
              {filtered.map(city => {
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
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-sky-50 transition-colors ${
                      isSelected ? 'bg-sky-100/70 font-bold text-sky-900' : 'text-slate-800'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900">{city.name}</span>
                      <span className="text-slate-500 text-[11px] ml-1.5">({city.code_postal})</span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-sky-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Raccourcis métropoles */}
      <div className="flex flex-wrap items-center gap-1 pt-1">
        {POPULAR_QUICK_CITIES.map(quick => (
          <button
            key={quick.id}
            type="button"
            onClick={() => onSelect(quick.id)}
            className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-colors ${
              Number(selectedId) === Number(quick.id)
                ? 'bg-sky-600 text-white'
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

export default function ShipmentForm() {
  const navigate = useNavigate();
  const [cities, setCities] = useState(ALL_FRENCH_CITIES);
  const [loading, setLoading] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_phone: '',
    sender_email: '',
    sender_address: '',
    sender_city_id: 1, // Paris par défaut
    receiver_name: '',
    receiver_phone: '',
    receiver_email: '',
    receiver_address: '',
    receiver_city_id: 3, // Lyon par défaut
    package_description: '',
    weight: '2.5',
    dimensions: '30x20x15',
    package_type: 'express',
    notes: '',
  });

  useEffect(() => {
    API.get('/public/cities')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCities(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/shipments', formData);
      setCreatedResult({
        tracking_number: res.data.tracking_number,
        id: res.data.id,
        sender: formData.sender_name,
        receiver: formData.receiver_name,
      });
      toast.success(`Colis créé avec succès ! N° ${res.data.tracking_number}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (createdResult) {
    return (
      <div className="max-w-2xl mx-auto my-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-emerald-500/30 shadow-2xl space-y-6 text-slate-900">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="text-center space-y-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-black uppercase tracking-wider">
              ✓ Synchronisé dans le Cloud & Prêt pour le client
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Colis enregistré avec succès !
            </h2>
            <p className="text-sm text-slate-600">
              Ce numéro de suivi est immédiatement consultable par le client sur la page publique de suivi.
            </p>
          </div>

          {/* Numéro de suivi officiel */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 text-center space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Numéro de suivi officiel généré
            </div>
            <div className="text-3xl sm:text-4xl font-mono font-black text-sky-700 tracking-wider select-all">
              {createdResult.tracking_number}
            </div>
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(createdResult.tracking_number);
                  setCopied(true);
                  toast.success('Numéro de suivi copié !');
                  setTimeout(() => setCopied(false), 2500);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copié dans le presse-papier !' : 'Copier le numéro de suivi'}</span>
              </button>
            </div>
          </div>

          {/* Informations récapitulatives */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block mb-0.5">Expéditeur :</span>
              <strong className="text-slate-900 font-bold">{createdResult.sender}</strong>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Destinataire :</span>
              <strong className="text-slate-900 font-bold">{createdResult.receiver}</strong>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="space-y-3 pt-2">
            <a
              href={`/suivi?numero=${createdResult.tracking_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Tester et vérifier le suivi client en direct (Nouvel onglet)</span>
            </a>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setCreatedResult(null);
                  setFormData({
                    sender_name: '', sender_phone: '', sender_email: '', sender_address: '', sender_city_id: 1,
                    receiver_name: '', receiver_phone: '', receiver_email: '', receiver_address: '', receiver_city_id: 3,
                    package_description: '', weight: '2.5', dimensions: '30x20x15', package_type: 'express', notes: ''
                  });
                }}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4 text-sky-600" />
                <span>Créer un autre colis</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/backoffice-portal/expeditions')}
                className="flex-1 py-3 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Voir la liste des colis</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-900">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/backoffice-portal/expeditions')}
          className="p-2 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">Nouvelle Expédition</h1>
          <p className="text-slate-400 text-sm">Enregistrez un nouveau colis pour le réseau France</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Expéditeur */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 text-xs flex items-center justify-center font-bold">1</span>
            Informations Expéditeur (Départ France)
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nom / Société *</label>
              <input
                type="text"
                name="sender_name"
                value={formData.sender_name}
                onChange={handleChange}
                required
                style={INPUT_STYLE}
                placeholder="Ex : Boutique Parisienne"
                className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Téléphone *</label>
              <input
                type="text"
                name="sender_phone"
                value={formData.sender_phone}
                onChange={handleChange}
                required
                style={INPUT_STYLE}
                placeholder="06 12 34 56 78"
                className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
              <input
                type="email"
                name="sender_email"
                value={formData.sender_email}
                onChange={handleChange}
                style={INPUT_STYLE}
                placeholder="contact@societe.fr"
                className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>
            
            <CitySelector
              label="Ville de départ (France)"
              selectedId={formData.sender_city_id}
              onSelect={(id) => setFormData({ ...formData, sender_city_id: id })}
              allCities={cities}
            />

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Adresse complète *</label>
              <input
                type="text"
                name="sender_address"
                value={formData.sender_address}
                onChange={handleChange}
                required
                style={INPUT_STYLE}
                placeholder="15 Rue de Paris"
                className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Destinataire */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 text-xs flex items-center justify-center font-bold">2</span>
            Informations Destinataire (Arrivée France)
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nom du destinataire *</label>
              <input
                type="text"
                name="receiver_name"
                value={formData.receiver_name}
                onChange={handleChange}
                required
                style={INPUT_STYLE}
                placeholder="Ex : M. Paul Bernard"
                className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Téléphone *</label>
              <input
                type="text"
                name="receiver_phone"
                value={formData.receiver_phone}
                onChange={handleChange}
                required
                style={INPUT_STYLE}
                placeholder="07 98 76 54 32"
                className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
              <input
                type="email"
                name="receiver_email"
                value={formData.receiver_email}
                onChange={handleChange}
                style={INPUT_STYLE}
                placeholder="destinataire@email.fr"
                className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>

            <CitySelector
              label="Ville d'arrivée (France)"
              selectedId={formData.receiver_city_id}
              onSelect={(id) => setFormData({ ...formData, receiver_city_id: id })}
              allCities={cities}
            />

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Adresse complète *</label>
              <input
                type="text"
                name="receiver_address"
                value={formData.receiver_address}
                onChange={handleChange}
                required
                style={INPUT_STYLE}
                placeholder="24 Avenue de Lyon"
                className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Détails du colis */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 text-xs flex items-center justify-center font-bold">3</span>
            Caractéristiques du Colis
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Formule de transport</label>
              <select
                name="package_type"
                value={formData.package_type}
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
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Poids (kg) *</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
                style={INPUT_STYLE}
                className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dimensions (L×l×H cm)</label>
              <input
                type="text"
                name="dimensions"
                placeholder="30x20x15"
                value={formData.dimensions}
                onChange={handleChange}
                style={INPUT_STYLE}
                className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description du contenu</label>
              <input
                type="text"
                name="package_description"
                placeholder="Documents administratifs, vêtements, pièces techniques..."
                value={formData.package_description}
                onChange={handleChange}
                style={INPUT_STYLE}
                className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes internes (instructions)</label>
              <textarea
                name="notes"
                rows="2"
                value={formData.notes}
                onChange={handleChange}
                style={INPUT_STYLE}
                placeholder="Consignes de livraison, code porte, étage..."
                className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate('/backoffice-portal/expeditions')}
            className="px-6 py-3 border border-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-black text-sm rounded-xl transition-colors shadow-lg shadow-sky-600/30 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Création en cours...' : 'Créer et générer le N° de suivi'}
          </button>
        </div>
      </form>
    </div>
  );
}
