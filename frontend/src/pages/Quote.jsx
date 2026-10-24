import { useState, useEffect } from 'react';
import { CheckCircle, Send } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Quote() {
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', origin_city_id: '', destination_city_id: '',
    weight: '', dimensions: '', package_type: 'standard', description: ''
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    API.get('/public/cities').then(r => setCities(r.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/public/quote', form);
      setSent(true);
      toast.success('Demande de devis envoyée !');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Demande envoyée !</h2>
          <p className="text-gray-500 max-w-md">Nous vous enverrons votre devis personnalisé par email sous 24h.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="hero-gradient py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Demander un devis</h1>
          <p className="text-blue-200 text-lg">Recevez une estimation personnalisée pour votre envoi</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Vos informations</h2>
            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                <input name="phone" value={form.phone} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>

            <hr className="my-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Détails du colis</h2>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville d'origine</label>
                <select name="origin_city_id" value={form.origin_city_id} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Sélectionner une ville</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code_postal})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville de destination</label>
                <select name="destination_city_id" value={form.destination_city_id} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Sélectionner une ville</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code_postal})</option>)}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Poids (kg)</label>
                <input name="weight" type="number" step="0.1" value={form.weight} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (L×l×H cm)</label>
                <input name="dimensions" placeholder="30×20×15" value={form.dimensions} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type d'envoi</label>
                <select name="package_type" value={form.package_type} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="standard">Standard</option>
                  <option value="express">Express 24h</option>
                  <option value="fragile">Fragile</option>
                  <option value="volumineux">Volumineux</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description du contenu</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              <Send className="h-5 w-5" />
              {loading ? 'Envoi...' : 'Demander un devis gratuit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
