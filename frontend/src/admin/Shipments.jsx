import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Filter, Plus, Eye, Trash2, RefreshCw, X, Check, MapPin, ExternalLink } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const INPUT_STYLE = {
  color: '#0f172a',
  backgroundColor: '#ffffff',
  WebkitTextFillColor: '#0f172a'
};

const statusConfig = {
  en_attente: { label: "En attente d'expédition", shortLabel: 'En attente', color: 'bg-amber-100 text-amber-900 border border-amber-300' },
  collecte: { label: 'Collecté / Pris en charge', shortLabel: 'Collecté', color: 'bg-sky-100 text-sky-900 border border-sky-300' },
  en_transit: { label: 'En acheminement / Transit', shortLabel: 'En transit', color: 'bg-indigo-100 text-indigo-900 border border-indigo-300' },
  au_hub: { label: 'Au centre de tri (Hub)', shortLabel: 'Au hub', color: 'bg-purple-100 text-purple-900 border border-purple-300' },
  en_livraison: { label: 'En cours de livraison', shortLabel: 'En livraison', color: 'bg-orange-100 text-orange-900 border border-orange-300' },
  livre: { label: 'Livré au destinataire', shortLabel: 'Livré', color: 'bg-emerald-100 text-emerald-900 border border-emerald-300' },
  retourne: { label: 'Retourné à l\'expéditeur', shortLabel: 'Retourné', color: 'bg-rose-100 text-rose-900 border border-rose-300' },
  annule: { label: 'Expédition annulée', shortLabel: 'Annulé', color: 'bg-slate-200 text-slate-800 border border-slate-300' },
};

const QUICK_DESCRIPTIONS = [
  "Colis enregistré dans le système TrackNova Logistics",
  "Colis collecté et pris en charge par notre transporteur",
  "Colis en cours d'acheminement vers la plateforme régionale",
  "Colis arrivé sur la plateforme logistique de tri",
  "Colis en cours de livraison par notre chauffeur-livreur",
  "Colis livré avec succès en main propre contre signature",
  "Destinataire absent, nouvelle présentation prévue demain",
  "Colis retourné à l'expéditeur suite à refus de livraison"
];

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userRole, setUserRole] = useState('');

  // Modal de mise à jour du statut
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [modalStatus, setModalStatus] = useState('en_transit');
  const [modalLocation, setModalLocation] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || '');
  }, []);

  const fetchShipments = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;

      const { data } = await API.get('/shipments', { params });
      setShipments(data.shipments);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Erreur lors du chargement des expéditions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchShipments(1);
  };

  // Changement rapide de statut en 1 clic direct depuis le tableau
  const handleQuickStatusChange = async (shipment, newStatus) => {
    if (shipment.status === newStatus) return;
    try {
      await API.put(`/shipments/${shipment.id || shipment.tracking_number}/status`, {
        status: newStatus
      });
      toast.success(`Statut de ${shipment.tracking_number} mis à jour : ${statusConfig[newStatus]?.label}`);
      setShipments(prev => prev.map(s => s.id === shipment.id ? { ...s, status: newStatus } : s));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la mise à jour du statut');
    }
  };

  const openStatusModal = (shipment) => {
    setSelectedShipment(shipment);
    setModalStatus(shipment.status || 'en_transit');
    setModalLocation(shipment.receiver_city_name || shipment.sender_city_name || 'France');
    setModalDescription('');
  };

  const handleModalStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedShipment) return;
    setModalSubmitting(true);
    try {
      await API.put(`/shipments/${selectedShipment.id || selectedShipment.tracking_number}/status`, {
        status: modalStatus,
        location: modalLocation.trim() || undefined,
        description: modalDescription.trim() || undefined
      });
      toast.success(`✓ Statut de ${selectedShipment.tracking_number} mis à jour avec succès !`);
      setShipments(prev => prev.map(s => s.id === selectedShipment.id ? { ...s, status: modalStatus } : s));
      setSelectedShipment(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDelete = async (id, trackingNumber) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'expédition ${trackingNumber} ?`)) {
      return;
    }
    try {
      await API.delete(`/shipments/${id}`);
      toast.success('Expédition supprimée avec succès');
      fetchShipments(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Gestion des Expéditions</h1>
          <p className="text-slate-400 text-sm mt-1">
            {pagination.total} expédition{pagination.total > 1 ? 's' : ''} au total • Mettez à jour les statuts en 1 clic
          </p>
        </div>
        <Link
          to="/backoffice-portal/expeditions/nouveau"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-sky-600/30"
        >
          <Plus className="h-4 w-4" />
          Nouvelle expédition
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center text-slate-900 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            style={INPUT_STYLE}
            placeholder="Rechercher par N° suivi, expéditeur, destinataire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-slate-900 bg-white font-medium border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </form>

        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={INPUT_STYLE}
            className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-slate-900 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 w-full md:w-auto"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5 text-xs font-black text-slate-700 uppercase tracking-wider">N° Suivi</th>
                <th className="px-5 py-3.5 text-xs font-black text-slate-700 uppercase tracking-wider">Expéditeur</th>
                <th className="px-5 py-3.5 text-xs font-black text-slate-700 uppercase tracking-wider">Destinataire</th>
                <th className="px-5 py-3.5 text-xs font-black text-slate-700 uppercase tracking-wider">Trajet</th>
                <th className="px-5 py-3.5 text-xs font-black text-slate-700 uppercase tracking-wider">Statut (Modifiable en direct)</th>
                <th className="px-5 py-3.5 text-xs font-black text-slate-700 uppercase tracking-wider">Prix</th>
                <th className="px-5 py-3.5 text-right text-xs font-black text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-400">
                    Chargement des expéditions...
                  </td>
                </tr>
              ) : shipments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-400">
                    Aucune expédition trouvée.
                  </td>
                </tr>
              ) : (
                shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-extrabold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
                        {s.tracking_number}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-bold text-slate-900">{s.sender_name}</div>
                      <div className="text-xs text-slate-500">{s.sender_phone}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-bold text-slate-900">{s.receiver_name}</div>
                      <div className="text-xs text-slate-500">{s.receiver_phone}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-semibold text-slate-800">
                        {s.sender_city_name} → {s.receiver_city_name}
                      </div>
                      <div className="text-xs text-slate-500 capitalize">{s.package_type} • {s.weight} kg</div>
                    </td>

                    {/* SÉLECTEUR DE STATUT INTERACTIF EN DIRECT */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={s.status}
                          onChange={(e) => handleQuickStatusChange(s, e.target.value)}
                          style={INPUT_STYLE}
                          className={`text-xs font-black rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-sm transition-all ${statusConfig[s.status]?.color || 'bg-slate-100 text-slate-800 border'}`}
                          title="Cliquez pour changer le statut immédiatement"
                        >
                          {Object.entries(statusConfig).map(([val, cfg]) => (
                            <option key={val} value={val} className="text-slate-900 bg-white font-semibold">
                              {cfg.shortLabel}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => openStatusModal(s)}
                          className="p-1.5 hover:bg-slate-200 rounded-md text-slate-600 hover:text-sky-600 transition-colors cursor-pointer"
                          title="Modifier le statut avec étape et commentaire"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm font-black text-slate-900">
                      {s.price} €
                    </td>

                    <td className="px-5 py-4 text-right space-x-1 whitespace-nowrap">
                      <a
                        href={`/suivi?numero=${s.tracking_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                        title="Voir le suivi public client"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <Link
                        to={`/backoffice-portal/expeditions/${s.id}`}
                        className="inline-flex p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Détails complets & Historique"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {userRole === 'admin' && (
                        <button
                          onClick={() => handleDelete(s.id, s.tracking_number)}
                          className="inline-flex p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Page {pagination.page} sur {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchShipments(pagination.page - 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Précédent
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchShipments(pagination.page + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PROFESSIONNELLE DE MISE À JOUR DE STATUT */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md">
                  Mise à jour d'acheminement
                </span>
                <h3 className="text-lg font-black text-slate-950 mt-1">
                  Colis {selectedShipment.tracking_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedShipment(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleModalStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Nouveau Statut du Colis *
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  style={INPUT_STYLE}
                  className="w-full px-3.5 py-2.5 text-sm font-bold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                >
                  {Object.entries(statusConfig).map(([val, cfg]) => (
                    <option key={val} value={val} className="text-slate-900 bg-white font-semibold">
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Localisation actuelle (Ville, Hub ou Centre de tri)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={modalLocation}
                    onChange={(e) => setModalLocation(e.target.value)}
                    style={INPUT_STYLE}
                    placeholder="Ex : Hub Paris-Sud, Plateforme Lyon Saint-Exupéry..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Message / Description pour le suivi client
                </label>
                <textarea
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  style={INPUT_STYLE}
                  rows={2}
                  placeholder="Ex : Le colis est en cours d'acheminement sur notre plateforme logistique..."
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm resize-none"
                />

                <div className="mt-2 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400">Suggestions rapides :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_DESCRIPTIONS.slice(1, 5).map((desc, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setModalDescription(desc)}
                        className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 rounded-md font-medium transition-colors text-left"
                      >
                        {desc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedShipment(null)}
                  className="flex-1 py-3 px-4 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="flex-1 py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  <span>{modalSubmitting ? 'Mise à jour...' : 'Valider & Publier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
