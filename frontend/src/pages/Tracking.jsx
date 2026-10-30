import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, MapPin, Clock, CheckCircle, Truck, AlertCircle, RotateCcw, XCircle, ArrowDown } from 'lucide-react';
import API from '../api/axios';

const statusConfig = {
  en_attente: { label: 'En attente', icon: <Clock className="h-5 w-5" />, color: 'text-yellow-600', bg: 'bg-yellow-100', step: 0 },
  collecte: { label: 'Collecté', icon: <Package className="h-5 w-5" />, color: 'text-blue-600', bg: 'bg-blue-100', step: 1 },
  en_transit: { label: 'En transit', icon: <Truck className="h-5 w-5" />, color: 'text-indigo-600', bg: 'bg-indigo-100', step: 2 },
  au_hub: { label: 'Au centre de tri', icon: <MapPin className="h-5 w-5" />, color: 'text-purple-600', bg: 'bg-purple-100', step: 3 },
  en_livraison: { label: 'En livraison', icon: <Truck className="h-5 w-5" />, color: 'text-orange-600', bg: 'bg-orange-100', step: 4 },
  livre: { label: 'Livré', icon: <CheckCircle className="h-5 w-5" />, color: 'text-green-600', bg: 'bg-green-100', step: 5 },
  retourne: { label: 'Retourné', icon: <RotateCcw className="h-5 w-5" />, color: 'text-red-600', bg: 'bg-red-100', step: -1 },
  annule: { label: 'Annulé', icon: <XCircle className="h-5 w-5" />, color: 'text-gray-600', bg: 'bg-gray-100', step: -1 },
};

export default function Tracking() {
  const [searchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get('numero') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const numero = searchParams.get('numero');
    if (numero) {
      setTrackingNumber(numero);
      searchShipment(numero);
    }
  }, [searchParams]);

  const searchShipment = async (number) => {
    const num = number || trackingNumber;
    if (!num.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await API.get(`/tracking/${num.trim().toUpperCase()}`);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Aucun colis trouvé avec ce numéro');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Veuillez entrer votre numéro de suivi.');
      return;
    }
    searchShipment();
  };

  const currentStatus = result ? (statusConfig[result.shipment.status] || {
    label: result.shipment.status,
    icon: <Clock className="h-5 w-5" />,
    color: 'text-sky-600',
    bg: 'bg-sky-100',
    step: 1
  }) : null;
  const steps = ['en_attente', 'collecte', 'en_transit', 'au_hub', 'en_livraison', 'livre'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec contraste net et lisibilité parfaite */}
      <div className="bg-slate-900 hero-gradient py-14 sm:py-16 border-b border-slate-800 text-white shadow-inner">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block text-xs font-bold text-sky-400 bg-slate-800/80 border border-sky-800/50 px-3.5 py-1 rounded-full mb-3 tracking-wide">
            Acheminement National & Suivi en Direct
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
            Suivi de colis TrackNova
          </h1>
          <p className="text-slate-200 text-sm sm:text-base font-medium max-w-xl mx-auto mb-8">
            Entrez votre numéro de suivi pour connaître l'acheminement de votre colis en temps réel
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Ex: FR-A1B2C3D4"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a' }}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-slate-900 bg-white font-bold border-2 border-slate-300 focus:outline-none focus:ring-4 focus:ring-sky-500 shadow-lg text-base"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 cursor-pointer text-base"
            >
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </form>

          {/* Information d'aide au suivi */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Le numéro de suivi est indiqué dans votre email ou SMS de confirmation d'expédition</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">Colis non trouvé</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-8">
            {/* Status card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Numéro de suivi</p>
                  <h2 className="text-2xl font-extrabold text-gray-900">{result.shipment.tracking_number}</h2>
                </div>
                <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl ${currentStatus.bg} ${currentStatus.color} font-semibold`}>
                  {currentStatus.icon}
                  {currentStatus.label}
                </div>
              </div>

              {/* Progress bar */}
              {currentStatus.step >= 0 && (
                <div className="mb-8">
                  <div className="flex justify-between mb-3">
                    {steps.map((step, index) => {
                      const config = statusConfig[step];
                      const isActive = index <= currentStatus.step;
                      const isCurrent = index === currentStatus.step;
                      return (
                        <div key={step} className="flex flex-col items-center flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                            isCurrent ? 'bg-blue-900 text-white scale-110 ring-4 ring-blue-200' :
                            isActive ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-400'
                          }`}>
                            {isActive ? '✓' : index + 1}
                          </div>
                          <span className={`text-xs mt-2 text-center hidden sm:block ${isActive ? 'text-blue-900 font-semibold' : 'text-gray-400'}`}>
                            {config.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-900 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${(currentStatus.step / (steps.length - 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Expéditeur</p>
                  <p className="font-semibold text-gray-800">{result.shipment.sender_name}</p>
                  <p className="text-sm text-gray-500">{result.shipment.sender_city}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Destinataire</p>
                  <p className="font-semibold text-gray-800">{result.shipment.receiver_name}</p>
                  <p className="text-sm text-gray-500">{result.shipment.receiver_city}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Type</p>
                  <p className="font-semibold text-gray-800 capitalize">{result.shipment.package_type}</p>
                  <p className="text-sm text-gray-500">{result.shipment.weight} kg</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Livraison estimée</p>
                  <p className="font-semibold text-gray-800">
                    {result.shipment.estimated_delivery ? new Date(result.shipment.estimated_delivery).toLocaleDateString('fr-FR') : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Historique du suivi</h3>
              <div className="space-y-0">
                {result.history.map((entry, index) => {
                  const config = statusConfig[entry.status] || { label: entry.status, color: 'text-gray-600', bg: 'bg-gray-100', icon: <Clock className="h-4 w-4" /> };
                  const isFirst = index === 0;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFirst ? 'bg-blue-900 text-white' : config.bg + ' ' + config.color}`}>
                          {config.icon}
                        </div>
                        {index < result.history.length - 1 && (
                          <div className="w-0.5 h-16 bg-gray-200"></div>
                        )}
                      </div>
                      <div className="pb-8">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isFirst ? 'text-blue-900' : 'text-gray-800'}`}>
                            {config.label}
                          </span>
                          {isFirst && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">Dernier</span>}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{entry.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {entry.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {new Date(entry.created_at).toLocaleString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!result && !error && !loading && (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400">Entrez un numéro de suivi</h3>
            <p className="text-gray-400 text-sm mt-2">Le numéro de suivi commence par FR- suivi de 8 caractères</p>
          </div>
        )}
      </div>
    </div>
  );
}
