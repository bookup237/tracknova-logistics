import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ChevronRight, ArrowRight } from 'lucide-react';

export default function Home() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedOffer, setSelectedOffer] = useState('express');
  const [simWeight, setSimWeight] = useState('2');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      navigate(`/suivi?numero=${trackingNumber.trim()}`);
    }
  };

  const getPrice = () => {
    const w = parseFloat(simWeight) || 1;
    const base = selectedOffer === 'express' ? 10.79 : (selectedOffer === 'fragile' ? 8.99 : 5.99);
    const rate = selectedOffer === 'express' ? 2.7 : 1.5;
    return (base + (w * rate)).toFixed(2);
  };

  return (
    <div className="bg-slate-50 text-slate-900">

      {/* ═══════════ SECTION HERO ÉPURÉE & NATURELLE ═══════════ */}
      <section className="relative bg-white border-b border-gray-200 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Colonne Gauche */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-block text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded">
                Transport & Messagerie Express en France
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                Expédiez et suivez vos colis partout en France avec TrackNova Logistics.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
                Suivez l'acheminement de vos envois étape par étape et bénéficiez d'un réseau de distribution fiable reliant plus de 70 départements français.
              </p>

              {/* Barre de suivi de colis épurée */}
              <div className="bg-slate-100 p-2 rounded-xl border border-gray-200 max-w-xl">
                <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1 flex items-center">
                    <Search className="absolute left-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Numéro de suivi (ex : FR-A1B2C3D4)..."
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 placeholder-gray-500 text-sm font-medium rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-lg transition-colors whitespace-nowrap shadow-sm"
                  >
                    Suivre le colis
                  </button>
                </form>
              </div>

              {/* Engagements simples et clairs */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="text-sky-600 font-bold">✓</span> Livraison 24h à 48h
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-sky-600 font-bold">✓</span> Remise contre signature
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-sky-600 font-bold">✓</span> Couverture nationale
                </span>
              </div>

            </div>

            {/* Colonne Droite - Simulateur Tarifaire Pro */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 space-y-6">
                
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-900">Calculateur d'expédition France</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Estimez vos frais de port instantanément</p>
                </div>

                {/* Formules */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'standard', name: 'Standard', time: '48-72h' },
                    { id: 'express', name: 'Express 24h', time: 'J+1 midi' },
                    { id: 'fragile', name: 'Fragile', time: 'Sécurisé' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedOffer(tab.id)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        selectedOffer === tab.id
                          ? 'border-sky-600 bg-sky-50 text-sky-950 font-bold shadow-sm'
                          : 'border-gray-200 bg-gray-50 text-slate-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-xs">{tab.name}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{tab.time}</div>
                    </button>
                  ))}
                </div>

                {/* Trajet */}
                <div className="space-y-4 text-xs text-slate-600">
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between font-medium">
                    <span>Départ : <strong className="text-slate-900">Paris (75)</strong></span>
                    <span className="text-slate-400">→</span>
                    <span>Arrivée : <strong className="text-slate-900">Lyon / Marseille</strong></span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5 font-medium">
                      <span>Poids estimé :</span>
                      <span className="font-bold text-sky-700">{simWeight} kg</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="30"
                      step="0.5"
                      value={simWeight}
                      onChange={(e) => setSimWeight(e.target.value)}
                      className="w-full accent-sky-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Tarif estimé TTC</div>
                    <div className="text-2xl font-black text-slate-900">
                      {getPrice()} <span className="text-sm font-bold text-sky-600">€</span>
                    </div>
                  </div>

                  <Link
                    to="/devis"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <span>Finaliser mon envoi</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════ SERVICES SÉLECTIONNABLES ═══════════ */}
      <section className="py-16 bg-slate-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Nos solutions d'expédition en France
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Des prestations fiables et adaptées à chaque type de marchandise.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'TrackNova Standard',
                badge: '48h à 72h',
                price: 'Dès 5,99 €',
                desc: 'La formule économique pour les envois réguliers et non urgents dans tous les départements.',
                points: ['Suivi complet en temps réel', 'Remise contre signature', 'Assurance marchandise incluse']
              },
              {
                title: 'TrackNova Express 24h',
                badge: 'Prioritaire',
                price: 'Dès 10,79 €',
                desc: 'Acheminement express garanti le lendemain matin avant 13h dans les principales agglomérations.',
                points: ['Prise en charge prioritaire', 'Notification SMS au destinataire', 'Engagement sur les délais']
              },
              {
                title: 'TrackNova Fragile',
                badge: 'Haute Sécurité',
                price: 'Dès 8,99 €',
                desc: 'Traitement rigoureux pour équipements électroniques, pièces d’art, verrerie et flaconnage.',
                points: ['Étiquetage spécifique', 'Manutention manuelle dédiée', 'Garantie valeur déclarée']
              },
              {
                title: 'Fret & Volumineux',
                badge: 'Jusqu\'à 70 kg',
                price: 'Dès 11,99 €',
                desc: 'Transport de charges lourdes ou encombrantes avec flotte de véhicules adaptée.',
                points: ['Prise de rendez-vous téléphonique', 'Équipe dédiée', 'Livraison sur palette acceptée']
              },
            ].map(s => (
              <div
                key={s.title}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded">
                      {s.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{s.price}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{s.desc}</p>

                  <ul className="space-y-2 text-xs text-slate-600 border-t border-gray-100 pt-3">
                    {s.points.map(p => (
                      <li key={p} className="flex items-center gap-2">
                        <span className="text-sky-600 font-bold">✓</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Link
                    to="/devis"
                    className="w-full py-2.5 bg-slate-900 hover:bg-sky-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Demander un devis</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PLATEFORMES RÉGIONALES EN FRANCE ═══════════ */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Nos hubs et plateformes de tri en France
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Réseau de distribution maillé couvrant l'ensemble du territoire
              </p>
            </div>
            <Link to="/contact" className="text-xs font-bold text-sky-600 hover:underline">
              Contacter l'agence la plus proche →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {[
              { name: 'Paris Île-de-France', desc: 'Plateforme Roissy / Créteil' },
              { name: 'Lyon', desc: 'Plateforme Rhône-Alpes' },
              { name: 'Marseille', desc: 'Plateforme Méditerranée' },
              { name: 'Toulouse', desc: 'Plateforme Occitanie' },
              { name: 'Bordeaux', desc: 'Plateforme Aquitaine' },
              { name: 'Lille', desc: 'Plateforme Hauts-de-France' },
              { name: 'Nantes', desc: 'Plateforme Atlantique' },
              { name: 'Strasbourg', desc: 'Plateforme Grand Est' },
              { name: 'Nice', desc: 'Plateforme Côte d\'Azur' },
              { name: 'Rennes', desc: 'Plateforme Bretagne' },
              { name: 'Montpellier', desc: 'Plateforme Languedoc' },
              { name: 'Clermont-Ferrand', desc: 'Plateforme Massif Central' },
            ].map(h => (
              <div key={h.name} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-left">
                <div className="text-xs font-bold text-slate-900">{h.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{h.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
