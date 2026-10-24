import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Truck, CheckCircle, Package, AlertCircle, RefreshCw } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const statusConfig = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  collecte: { label: 'Collecté', color: 'bg-blue-100 text-blue-800' },
  en_transit: { label: 'En transit', color: 'bg-indigo-100 text-indigo-800' },
  au_hub: { label: 'Au hub', color: 'bg-purple-100 text-purple-800' },
  en_livraison: { label: 'En livraison', color: 'bg-orange-100 text-orange-800' },
  livre: { label: 'Livré', color: 'bg-green-100 text-green-800' },
  retourne: { label: 'Retourné', color: 'bg-red-100 text-red-800' },
  annule: { label: 'Annulé', color: 'bg-gray-100 text-gray-800' },
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
    } catch (err) {
      toast.error('Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await API.put(`/shipments/${id}/status`, {
        status: newStatus,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
      });
      toast.success('Statut et historique mis à jour !');
      setLocation('');
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
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-900"></div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-gray-500">Expédition introuvable</div>;

  const { shipment, history } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/expeditions')}
            className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-gray-900">{shipment.tracking_number}</h1>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${statusConfig[shipment.status]?.color}`}>
                {statusConfig[shipment.status]?.label}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">
              Enregistré le {new Date(shipment.created_at).toLocaleDateString('fr-FR')} par {shipment.created_by_name || 'Admin'}
            </p>
          </div>
        </div>

        <Link
          to={`/suivi?numero=${shipment.tracking_number}`}
          target="_blank"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
        >
          Voir page publique de suivi ↗
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left col: Details + Update Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Trajet & Adresses en France
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/60">
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">Expéditeur (Départ)</p>
                <div className="text-sm font-bold text-gray-900">{shipment.sender_name}</div>
                <div className="text-sm text-gray-600 mt-1">{shipment.sender_address}</div>
                <div className="text-sm font-medium text-gray-700 mt-1">
                  {shipment.sender_city_name} ({shipment.sender_postal})
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Tél: {shipment.sender_phone} {shipment.sender_email && `• ${shipment.sender_email}`}
                </div>
              </div>

              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100/60">
                <p className="text-xs font-bold text-orange-900 uppercase tracking-wider mb-2">Destinataire (Arrivée)</p>
                <div className="text-sm font-bold text-gray-900">{shipment.receiver_name}</div>
                <div className="text-sm text-gray-600 mt-1">{shipment.receiver_address}</div>
                <div className="text-sm font-medium text-gray-700 mt-1">
                  {shipment.receiver_city_name} ({shipment.receiver_postal})
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Tél: {shipment.receiver_phone} {shipment.receiver_email && `• ${shipment.receiver_email}`}
                </div>
              </div>
            </div>

            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Caractéristiques du Paquet
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3.5 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-semibold">Type</p>
                <p className="text-sm font-bold text-gray-900 capitalize mt-1">{shipment.package_type}</p>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-semibold">Poids</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{shipment.weight} kg</p>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-semibold">Dimensions</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{shipment.dimensions || '-'}</p>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-semibold">Tarif facturé</p>
                <p className="text-sm font-bold text-blue-900 mt-1">{shipment.price} €</p>
              </div>
            </div>

            {shipment.package_description && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Description</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">{shipment.package_description}</p>
              </div>
            )}
          </div>

          {/* Update Status form */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-900" />
              Mettre à jour l'état du colis
            </h2>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nouveau Statut *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="en_attente">En attente</option>
                    <option value="collecte">Collecté</option>
                    <option value="en_transit">En transit</option>
                    <option value="au_hub">Au hub / centre de tri</option>
                    <option value="en_livraison">En cours de livraison</option>
                    <option value="livre">Livré au destinataire</option>
                    <option value="retourne">Retourné</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Localisation actuelle</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Hub Régional Paris Sud, Lyon..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Description / Commentaire</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Le colis a quitté le centre logistique..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {updating ? 'Enregistrement...' : 'Valider la mise à jour'}
              </button>
            </form>
          </div>
        </div>

        {/* Right col: Timeline history */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-fit">
          <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            Journal des événements ({history.length})
          </h2>

          <div className="space-y-6">
            {history.map((h, idx) => (
              <div key={h.id || idx} className="relative pl-6 pb-2 border-l-2 border-gray-200 last:border-l-0 last:pb-0">
                <span className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-blue-900 border-2 border-white"></span>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${statusConfig[h.status]?.color || 'bg-gray-100'}`}>
                    {statusConfig[h.status]?.label || h.status}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(h.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <p className="text-xs text-gray-700 font-medium mt-1.5">{h.description}</p>
                <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {h.location || 'France'}
                  {h.updated_by_name && ` • Par ${h.updated_by_name}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
