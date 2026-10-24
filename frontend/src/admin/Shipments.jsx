import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Filter, Plus, Eye, Trash2, ArrowUpDown } from 'lucide-react';
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

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userRole, setUserRole] = useState('');

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
          <h1 className="text-2xl font-extrabold text-gray-900">Gestion des Expéditions</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pagination.total} expédition{pagination.total > 1 ? 's' : ''} au total en France
          </p>
        </div>
        <Link
          to="/admin/expeditions/nouveau"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nouvelle expédition
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par N° suivi, expéditeur, destinataire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
          >
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="collecte">Collecté</option>
            <option value="en_transit">En transit</option>
            <option value="au_hub">Au hub</option>
            <option value="en_livraison">En livraison</option>
            <option value="livre">Livré</option>
            <option value="retourne">Retourné</option>
            <option value="annule">Annulé</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">N° Suivi</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expéditeur</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Destinataire</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trajet (France)</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prix</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
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
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg">
                        {s.tracking_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{s.sender_name}</div>
                      <div className="text-xs text-gray-400">{s.sender_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{s.receiver_name}</div>
                      <div className="text-xs text-gray-400">{s.receiver_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {s.sender_city_name} → {s.receiver_city_name}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">{s.package_type} • {s.weight} kg</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${statusConfig[s.status]?.color || 'bg-gray-100'}`}>
                        {statusConfig[s.status]?.label || s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {s.price} €
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <Link
                        to={`/admin/expeditions/${s.id}`}
                        className="inline-flex p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Détails & mise à jour"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {userRole === 'admin' && (
                        <button
                          onClick={() => handleDelete(s.id, s.tracking_number)}
                          className="inline-flex p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
    </div>
  );
}
