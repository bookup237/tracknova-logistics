import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Truck, CheckCircle, Package, AlertCircle, RefreshCw, Check, ExternalLink, Send } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const INPUT_STYLE = {
  color: '#0f172a',
  backgroundColor: '#ffffff',
  WebkitTextFillColor: '#0f172a'
};

const statusConfig = {
  en_attente: { label: "En attente d'expédition", short: '1. En attente', color: 'bg-amber-100 text-amber-900 border border-amber-300', step: 0 },
  collecte: { label: 'Collecté / Pris en charge', short: '2. Collecté', color: 'bg-sky-100 text-sky-900 border border-sky-300', step: 1 },
  en_transit: { label: 'En acheminement / Transit', short: '3. En transit', color: 'bg-indigo-100 text-indigo-900 border border-indigo-300', step: 2 },
  au_hub: { label: 'Arrivé au centre de tri (Hub)', short: '4. Au hub', color: 'bg-purple-100 text-purple-900 border border-purple-300', step: 3 },
  en_livraison: { label: 'En cours de livraison', short: '5. En livraison', color: 'bg-orange-100 text-orange-900 border border-orange-300', step: 4 },
  livre: { label: 'Colis livré avec succès', short: '6. Livré', color: 'bg-emerald-100 text-emerald-900 border border-emerald-300', step: 5 },
  retourne: { label: 'Retourné à l\'expéditeur', short: 'Retourné', color: 'bg-rose-100 text-rose-900 border border-rose-300', step: -1 },
  annule: { label: 'Expédition annulée', short: 'Annulé', color: 'bg-slate-200 text-slate-800 border border-slate-300', step: -1 },
};

const STANDARD_STEPS = [
  { key: 'en_attente', label: '1. En attente' },
  { key: 'collecte', label: '2. Collecté' },
  { key: 'en_transit', label: '3. En transit' },
  { key: 'au_hub', label: '4. Au centre de tri' },
  { key: 'en_livraison', label: '5. En livraison' },
  { key: 'livre', label: '6. Livré' },
];

const PRESET_MESSAGES = {
  en_attente: "Colis enregistré dans le système TrackNova Logistics, en attente de collecte.",
  collecte: "Colis pris en charge par l'agence de départ TrackNova.",
  en_transit: "Colis en cours d'acheminement vers le centre de distribution régional.",
  au_hub: "Colis réceptionné et scanné sur la plateforme logistique de tri.",
  en_livraison: "Le colis est en cours de livraison par notre chauffeur-livreur.",
  livre: "Colis remis en main propre au destinataire contre signature électronique.",
  retourne: "Colis retourné à l'expéditeur suite à plusieurs avis de passage sans réponse.",
  annule: "Expédition annulée à la demande de l'expéditeur."
};

export default function ShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Status update form
  const [newStatus, setNewStatus] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const fetchDetail = async () => {
    try {
      const res = await API.get(`/shipments/${id}`);
      setData(res.data);
      setNewStatus(res.data.shipment.status);
      setLocation(res.data.shipment.receiver_city_name || res.data.shipment.sender_city_name || 'France');
    } catch (err) {
      toast.error('Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Changement rapide d'un clic depuis le stepper
  const handleQuickStepClick = async (stepKey) => {
    if (data?.shipment?.status === stepKey) return;
    setUpdating(true);
    try {
      const defaultDesc = PRESET_MESSAGES[stepKey] || statusConfig[stepKey]?.label;
      const defaultLoc = location || data.shipment.sender_city_name || 'France';
      await API.put(`/shipments/${id}/status`, {
        status: stepKey,
        location: defaultLoc,
        description: defaultDesc
      });
      toast.success(`✓ Statut passé à : ${statusConfig[stepKey]?.label}`);
      setNewStatus(stepKey);
      fetchDetail();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors du changement de statut');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await API.put(`/shipments/${id}/status`, {
        status: newStatus,
        location: location.trim() || undefined,
        description: description.trim() || PRESET_MESSAGES[newStatus] || undefined,
      });
      toast.success('✓ Statut et historique synchronisés avec succès !');
      setDescription('');
      fetchDetail();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-200 border-t-sky-600"></div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-slate-400">Expédition introuvable</div>;

  const { shipment, history } = data;
  const currentStepIndex = statusConfig[shipment.status]?.step ?? -1;

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/backoffice-portal/expeditions')}
            className="p-2 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white">{shipment.tracking_number}</h1>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black shadow-sm ${statusConfig[shipment.status]?.color || 'bg-slate-100'}`}>
                {statusConfig[shipment.status]?.label || shipment.status}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Enregistré le {new Date(shipment.created_at).toLocaleDateString('fr-FR')} • Créé par {shipment.created_by_name || 'Admin'}
            </p>
          </div>
        </div>

        <a
          href={`/suivi?numero=${shipment.tracking_number}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Vérifier le suivi public client ↗</span>
        </a>
      </div>

      {/* 🚀 STEPPER INTERACTIF EN 1 CLIC */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Avancement Rapide du Colis (Cliquez pour faire avancer l'étape)
            </h2>
            <p className="text-xs text-slate-500">
              Un clic sur une étape met à jour instantanément le statut pour le client
            </p>
          </div>
          {updating && <span className="text-xs font-bold text-sky-600 animate-pulse">Synchronisation...</span>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STANDARD_STEPS.map((s, idx) => {
            const isCurrent = shipment.status === s.key;
            const isPassed = currentStepIndex > idx && currentStepIndex >= 0;

            return (
              <button
                key={s.key}
                type="button"
                disabled={updating}
                onClick={() => handleQuickStepClick(s.key)}
                className={`p-3 rounded-xl text-left border-2 transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-sky-600 bg-sky-50 text-sky-950 font-black shadow-sm ring-2 ring-sky-500/30'
                    : isPassed
                    ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900 font-bold hover:border-emerald-400'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-sky-400 hover:bg-white font-semibold'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-[10px] text-slate-400">Étape {idx + 1}</span>
                  {isCurrent && <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping"></span>}
                  {isPassed && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                </div>
                <div className="text-xs font-bold truncate">{s.label.replace(/^\d+\.\s*/, '')}</div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 flex flex-wrap gap-2 text-xs">
          <span className="text-slate-400 font-bold">Cas particuliers :</span>
          <button
            type="button"
            onClick={() => handleQuickStepClick('retourne')}
            className={`px-3 py-1 rounded-lg border font-bold transition-colors cursor-pointer ${
              shipment.status === 'retourne' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 border-slate-200'
            }`}
          >
            ↩️ Marquer Retourné à l'expéditeur
          </button>
          <button
            type="button"
            onClick={() => handleQuickStepClick('annule')}
            className={`px-3 py-1 rounded-lg border font-bold transition-colors cursor-pointer ${
              shipment.status === 'annule' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
            }`}
          >
            ❌ Annuler l'expédition
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne gauche : Trajet + Formulaire détaillé */}
        <div className="lg:col-span-2 space-y-6">
          {/* Adresses */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-6">
            <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
              Trajet & Adresses en France
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-[11px] font-black text-sky-800 uppercase tracking-wider mb-2">Expéditeur (Départ)</p>
                <div className="text-sm font-bold text-slate-950">{shipment.sender_name}</div>
                <div className="text-xs text-slate-600 mt-1">{shipment.sender_address}</div>
                <div className="text-xs font-bold text-slate-900 mt-1">
                  {shipment.sender_city_name} {shipment.sender_postal && `(${shipment.sender_postal})`}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Tél : {shipment.sender_phone} {shipment.sender_email && `• ${shipment.sender_email}`}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-[11px] font-black text-orange-800 uppercase tracking-wider mb-2">Destinataire (Arrivée)</p>
                <div className="text-sm font-bold text-slate-950">{shipment.receiver_name}</div>
                <div className="text-xs text-slate-600 mt-1">{shipment.receiver_address}</div>
                <div className="text-xs font-bold text-slate-900 mt-1">
                  {shipment.receiver_city_name} {shipment.receiver_postal && `(${shipment.receiver_postal})`}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Tél : {shipment.receiver_phone} {shipment.receiver_email && `• ${shipment.receiver_email}`}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 uppercase font-black">Formule</p>
                <p className="text-xs font-black text-slate-900 capitalize mt-0.5">{shipment.package_type}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 uppercase font-black">Poids</p>
                <p className="text-xs font-black text-slate-900 mt-0.5">{shipment.weight} kg</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 uppercase font-black">Dimensions</p>
                <p className="text-xs font-black text-slate-900 mt-0.5">{shipment.dimensions || '-'}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 uppercase font-black">Tarif facturé</p>
                <p className="text-xs font-black text-sky-700 mt-0.5">{shipment.price} €</p>
              </div>
            </div>
          </div>

          {/* Formulaire complet de statut avec commentaire personnalisé */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <RefreshCw className="h-4 w-4 text-sky-600" />
              Mettre à jour avec détails & commentaire
            </h2>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Statut du colis *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => {
                      setNewStatus(e.target.value);
                      if (!description) {
                        setDescription(PRESET_MESSAGES[e.target.value] || '');
                      }
                    }}
                    required
                    style={INPUT_STYLE}
                    className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-xl text-sm text-slate-900 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                  >
                    {Object.entries(statusConfig).map(([val, cfg]) => (
                      <option key={val} value={val} className="text-slate-900 bg-white font-semibold">
                        {cfg.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Localisation de l'événement
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={INPUT_STYLE}
                    placeholder="Ex: Hub de tri Paris Sud, Lyon..."
                    className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-xl text-sm text-slate-900 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Commentaire pour le suivi client
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={INPUT_STYLE}
                    placeholder="Description de l'acheminement affichée au client..."
                    className="w-full px-3.5 py-2.5 border-2 border-slate-300 rounded-xl text-sm text-slate-900 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm resize-none"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400">Suggestions :</span>
                    {Object.entries(PRESET_MESSAGES).slice(1, 5).map(([k, msg]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setDescription(msg)}
                        className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-sky-50 text-slate-700 rounded transition-colors"
                      >
                        {statusConfig[k]?.short}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{updating ? 'Enregistrement et synchronisation...' : 'Valider et publier le statut'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Colonne droite : Historique d'acheminement */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md h-fit space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="h-4 w-4 text-sky-600" />
            Historique du Suivi ({history.length})
          </h2>

          <div className="space-y-4">
            {history.map((h, idx) => (
              <div key={h.id || idx} className="relative pl-5 pb-4 border-l-2 border-slate-200 last:border-l-0 last:pb-0">
                <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-sky-600 border-2 border-white"></span>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded ${statusConfig[h.status]?.color || 'bg-slate-100'}`}>
                    {statusConfig[h.status]?.label || h.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(h.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-medium mt-1 leading-snug">{h.description}</p>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-semibold">
                  <MapPin className="h-3 w-3 text-slate-400" /> {h.location || 'France'}
                  {h.updated_by_name && <span className="text-slate-400 font-normal">• Par {h.updated_by_name}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
