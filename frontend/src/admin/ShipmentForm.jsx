import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Send, ArrowLeft } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function ShipmentForm() {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_phone: '',
    sender_email: '',
    sender_address: '',
    sender_city_id: '',
    receiver_name: '',
    receiver_phone: '',
    receiver_email: '',
    receiver_address: '',
    receiver_city_id: '',
    package_description: '',
    weight: '1',
    dimensions: '',
    package_type: 'standard',
    notes: '',
  });

  useEffect(() => {
    API.get('/public/cities')
      .then(res => setCities(res.data))
      .catch(() => toast.error('Erreur lors du chargement des villes'));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/shipments', formData);
      toast.success(`Colis créé avec succès ! N° ${res.data.tracking_number}`);
      navigate('/admin/expeditions');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/expeditions')}
          className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Nouvelle Expédition</h1>
          <p className="text-gray-500 text-sm">Enregistrez un nouveau colis pour le réseau France</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Expéditeur */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 text-xs flex items-center justify-center font-bold">1</span>
            Informations Expéditeur (Départ France)
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nom / Société *</label>
              <input
                type="text"
                name="sender_name"
                value={formData.sender_name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Téléphone *</label>
              <input
                type="text"
                name="sender_phone"
                value={formData.sender_phone}
                onChange={handleChange}
                required
                placeholder="06 12 34 56 78"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email</label>
              <input
                type="email"
                name="sender_email"
                value={formData.sender_email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Ville de départ (France) *</label>
              <select
                name="sender_city_id"
                value={formData.sender_city_id}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionnez la ville</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code_postal}) - {c.region}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Adresse complète *</label>
              <input
                type="text"
                name="sender_address"
                value={formData.sender_address}
                onChange={handleChange}
                required
                placeholder="15 Rue de Paris"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Destinataire */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 text-xs flex items-center justify-center font-bold">2</span>
            Informations Destinataire (Arrivée France)
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nom du destinataire *</label>
              <input
                type="text"
                name="receiver_name"
                value={formData.receiver_name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Téléphone *</label>
              <input
                type="text"
                name="receiver_phone"
                value={formData.receiver_phone}
                onChange={handleChange}
                required
                placeholder="07 98 76 54 32"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email</label>
              <input
                type="email"
                name="receiver_email"
                value={formData.receiver_email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Ville d'arrivée (France) *</label>
              <select
                name="receiver_city_id"
                value={formData.receiver_city_id}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionnez la ville</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code_postal}) - {c.region}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Adresse complète *</label>
              <input
                type="text"
                name="receiver_address"
                value={formData.receiver_address}
                onChange={handleChange}
                required
                placeholder="24 Avenue de Lyon"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Détails du colis */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 text-xs flex items-center justify-center font-bold">3</span>
            Caractéristiques du Colis
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Type d'envoi</label>
              <select
                name="package_type"
                value={formData.package_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="standard">Standard (3-5 jours)</option>
                <option value="express">Express 24h</option>
                <option value="fragile">Fragile</option>
                <option value="volumineux">Volumineux</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Poids (kg) *</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Dimensions (L×l×H cm)</label>
              <input
                type="text"
                name="dimensions"
                placeholder="30x20x15"
                value={formData.dimensions}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Description du contenu</label>
              <input
                type="text"
                name="package_description"
                placeholder="Documents administratifs, vêtements..."
                value={formData.package_description}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Notes internes (instructions)</label>
              <textarea
                name="notes"
                rows="2"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/expeditions')}
            className="px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? 'Création en cours...' : 'Créer l\'expédition'}
          </button>
        </div>
      </form>
    </div>
  );
}
