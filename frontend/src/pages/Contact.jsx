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

  const INPUT_STYLE = {
    color: '#0f172a',
    backgroundColor: '#ffffff',
    WebkitTextFillColor: '#0f172a'
  };

  return (
    <div>
      {/* Header sombre haute visibilité et lisibilité parfaite */}
      <div className="bg-slate-900 hero-gradient py-14 sm:py-16 border-b border-slate-800 text-white shadow-inner">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block text-xs font-bold text-sky-400 bg-slate-800/80 border border-sky-800/50 px-3.5 py-1 rounded-full mb-3 tracking-wide">
            Service Commercial & Support Client TrackNova France
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
            Contactez-nous
          </h1>
          <p className="text-slate-200 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Notre équipe logistique en France est à votre disposition pour répondre à toutes vos questions
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Info cards */}
          <div className="space-y-6">
            {[
              { icon: <Phone />, title: 'Téléphone & Service Client', lines: ['+33 6 44 69 41 92', 'Lundi au Samedi : 8h - 20h'] },
              { icon: <Mail />, title: 'Email', lines: ['contact@tracknova-logistics.fr', 'Réponse sous 24h'] },
              { icon: <MapPin />, title: 'Plateforme Logistique', lines: ['Plateforme Paris Roissy', '95700 Roissy-en-France'] },
              { icon: <Clock />, title: 'Horaires expéditions', lines: ['Départs quotidiens 24/7', 'Service continu en France'] },
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
                    <label className="block text-sm font-bold text-slate-800 mb-2">Nom complet *</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      style={INPUT_STYLE}
                      placeholder="Jean Dupont"
                      className="w-full px-4 py-3 text-slate-900 bg-white font-semibold border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Email *</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      style={INPUT_STYLE}
                      placeholder="jean.dupont@email.fr"
                      className="w-full px-4 py-3 text-slate-900 bg-white font-semibold border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Téléphone</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      style={INPUT_STYLE}
                      placeholder="06 12 34 56 78"
                      className="w-full px-4 py-3 text-slate-900 bg-white font-semibold border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Sujet *</label>
                    <input
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      style={INPUT_STYLE}
                      placeholder="Information sur un tarif ou une expédition"
                      className="w-full px-4 py-3 text-slate-900 bg-white font-semibold border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    style={INPUT_STYLE}
                    placeholder="Votre message..."
                    className="w-full px-4 py-3 text-slate-900 bg-white font-semibold border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-5 w-5" />
                  <span>{loading ? 'Envoi en cours...' : 'Envoyer le message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
