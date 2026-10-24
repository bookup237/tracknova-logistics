import { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, Clock, Check, CheckCheck } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await API.get('/admin/messages');
      setMessages(res.data);
    } catch (err) {
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.put(`/admin/messages/${id}/read`);
      setMessages(messages.map(m => m.id === id ? { ...m, is_read: 1 } : m));
      toast.success('Marqué comme lu');
    } catch (err) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Boîte de Messages</h1>
        <p className="text-gray-500 text-sm mt-1">Messages reçus depuis le formulaire de contact</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Chargement des messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Aucun message pour le moment.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-6 transition-colors ${m.is_read ? 'bg-white' : 'bg-blue-50/40'}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 text-sm">{m.name}</span>
                    {!m.is_read && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white">
                        Nouveau
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(m.created_at).toLocaleString('fr-FR')}
                    </span>
                    {!m.is_read && (
                      <button
                        onClick={() => markAsRead(m.id)}
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                      >
                        <Check className="h-3.5 w-3.5" /> Marquer comme lu
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-gray-400" /> {m.email}
                  </span>
                  {m.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-gray-400" /> {m.phone}
                    </span>
                  )}
                  <span className="font-semibold text-gray-700">Objet : {m.subject}</span>
                </div>

                <p className="text-sm text-gray-700 whitespace-pre-line bg-white/70 p-3 rounded-xl border border-gray-100">
                  {m.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
