import { useState, useEffect } from 'react';
import { FileText, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    try {
      const res = await API.get('/admin/quotes');
      setQuotes(res.data);
    } catch (err) {
      toast.error('Erreur lors du chargement des devis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/admin/quotes/${id}/status`, { status });
      setQuotes(quotes.map(q => q.id === id ? { ...q, status } : q));
      toast.success('Statut du devis mis à jour');
    } catch (err) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Demandes de Devis</h1>
        <p className="text-gray-500 text-sm mt-1">Estimations et devis soumis par les clients pour le territoire français</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Chargement des devis...</div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Aucune demande de devis en attente.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Demandeur</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Trajet envisagé</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Colis</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{q.name}</div>
                      <div className="text-xs text-gray-500">{q.email} • {q.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {q.origin_city_name || 'France'} → {q.destination_city_name || 'France'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800 capitalize">{q.package_type}</div>
                      <div className="text-xs text-gray-400">
                        {q.weight ? `${q.weight} kg` : ''} {q.dimensions ? `• ${q.dimensions}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        q.status === 'nouveau' ? 'bg-blue-100 text-blue-800' :
                        q.status === 'traite' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {q.status !== 'traite' && (
                        <button
                          onClick={() => updateStatus(q.id, 'traite')}
                          className="px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100"
                        >
                          Traiter
                        </button>
                      )}
                      {q.status !== 'refuse' && (
                        <button
                          onClick={() => updateStatus(q.id, 'refuse')}
                          className="px-2.5 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100"
                        >
                          Refuser
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
