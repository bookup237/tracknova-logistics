import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, AlertCircle, DollarSign, Users, MessageSquare, FileText, ArrowUpRight, TrendingUp, MapPin } from 'lucide-react';
import API from '../api/axios';

const statusLabels = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  collecte: { label: 'Collecté', color: 'bg-blue-100 text-blue-800' },
  en_transit: { label: 'En transit', color: 'bg-indigo-100 text-indigo-800' },
  au_hub: { label: 'Au hub', color: 'bg-purple-100 text-purple-800' },
  en_livraison: { label: 'En livraison', color: 'bg-orange-100 text-orange-800' },
  livre: { label: 'Livré', color: 'bg-green-100 text-green-800' },
  retourne: { label: 'Retourné', color: 'bg-red-100 text-red-800' },
  annule: { label: 'Annulé', color: 'bg-gray-100 text-gray-800' },
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/admin/stats');
      setData(data);
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-900"></div>
      </div>
    );
  }

  if (!data) return <div className="text-center text-gray-500 py-12">Erreur de chargement</div>;

  const { stats, recentShipments, monthlyStats, topDestinations } = data;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de vos activités</p>
        </div>
        <Link
          to="/admin/expeditions/nouveau"
          className="px-5 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2"
        >
          <Package className="h-4 w-4" />
          Nouvelle expédition
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { label: 'Total expéditions', value: stats.totalShipments, icon: <Package />, color: 'bg-blue-50 text-blue-900', iconBg: 'bg-blue-100' },
          { label: 'En cours', value: stats.inTransitShipments + stats.inDeliveryShipments, icon: <Truck />, color: 'bg-orange-50 text-orange-700', iconBg: 'bg-orange-100' },
          { label: 'Livrés', value: stats.deliveredShipments, icon: <CheckCircle />, color: 'bg-green-50 text-green-700', iconBg: 'bg-green-100' },
          { label: 'Revenus', value: `${stats.totalRevenue.toLocaleString('fr-FR')}€`, icon: <TrendingUp />, color: 'bg-purple-50 text-purple-700', iconBg: 'bg-purple-100' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-2xl p-5 lg:p-6`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold">{stat.value}</div>
            <div className="text-sm opacity-70 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'En attente', value: stats.pendingShipments, icon: <Clock className="h-4 w-4" />, color: 'text-yellow-600' },
          { label: 'Clients', value: stats.totalClients, icon: <Users className="h-4 w-4" />, color: 'text-blue-600' },
          { label: 'Messages non lus', value: stats.unreadMessages, icon: <MessageSquare className="h-4 w-4" />, color: 'text-red-600' },
          { label: 'Nouveaux devis', value: stats.newQuotes, icon: <FileText className="h-4 w-4" />, color: 'text-green-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
            <div className={`${stat.color}`}>{stat.icon}</div>
            <div>
              <div className="text-lg font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent shipments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-900">Expéditions récentes</h2>
            <Link to="/admin/expeditions" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Voir tout <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N° Suivi</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trajet</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Prix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentShipments.slice(0, 8).map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/admin/expeditions/${s.id}`}>
                    <td className="px-6 py-3">
                      <span className="font-mono text-sm font-semibold text-blue-900">{s.tracking_number}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {s.sender_city_name} → {s.receiver_city_name}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${statusLabels[s.status]?.color || 'bg-gray-100'}`}>
                        {statusLabels[s.status]?.label || s.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-semibold text-gray-800">{s.price}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top destinations */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Top destinations</h2>
          </div>
          <div className="p-6 space-y-4">
            {topDestinations.slice(0, 8).map((dest, i) => {
              const maxCount = topDestinations[0]?.count || 1;
              const percentage = Math.round((dest.count / maxCount) * 100);
              return (
                <div key={dest.name}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      {dest.name}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">{dest.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-900 to-blue-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
