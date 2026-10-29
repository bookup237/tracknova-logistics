import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/public/contact', form);
      setSent(true);
      toast.success('Message envoyé avec succès !');
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
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Message envoyé !</h2>
          <p className="text-gray-500 max-w-md">Notre équipe vous répondra dans les plus brefs délais. Merci de votre confiance.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="hero-gradient py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Contactez-nous</h1>
          <p className="text-blue-200 text-lg">Notre équipe est à votre disposition pour répondre à toutes vos questions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Info cards */}
          <div className="space-y-6">
            {[
              { icon: <Phone />, title: 'Téléphone', lines: ['01 23 45 67 89', 'Lun-Ven 8h-19h'] },
              { icon: <Mail />, title: 'Email', lines: ['contact@franceexpress.fr', 'Réponse sous 24h'] },
              { icon: <MapPin />, title: 'Adresse', lines: ['12 Rue de la Logistique', '75001 Paris, France'] },
              { icon: <Clock />, title: 'Horaires', lines: ['Lun-Ven : 8h-19h', 'Sam : 9h-13h'] },
            ].map(info => (
              <div key={info.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  {info.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{info.title}</h3>
                  {info.lines.map(l => <p key={l} className="text-sm text-gray-500">{l}</p>)}
                </div>
              </div>
            ))}
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                    <input name="name" value={form.name} onChange={handleChange} required
                      className="w-full px-4 py-3 text-slate-900 bg-white font-medium border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required
                      className="w-full px-4 py-3 text-slate-900 bg-white font-medium border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <input name="phone" value={form.phone} onChange={handleChange}
                      className="w-full px-4 py-3 text-slate-900 bg-white font-medium border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sujet *</label>
                    <input name="subject" value={form.subject} onChange={handleChange} required
                      className="w-full px-4 py-3 text-slate-900 bg-white font-medium border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                    className="w-full px-4 py-3 text-slate-900 bg-white font-medium border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  <Send className="h-5 w-5" />
                  {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
