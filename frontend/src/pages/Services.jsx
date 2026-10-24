import { Package, Zap, Shield, Truck, Clock, MapPin, CheckCircle, Headphones, BarChart3, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Services() {
  return (
    <div>
      {/* Header */}
      <div className="hero-gradient py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Nos Services</h1>
          <p className="text-blue-200 text-lg">Des solutions d'expédition adaptées à tous vos besoins</p>
        </div>
      </div>

      {/* Services détaillés */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {[
              {
                icon: <Package className="h-10 w-10" />,
                title: 'Livraison Standard',
                price: 'À partir de 5,99€',
                delay: '3-5 jours ouvrés',
                color: 'blue',
                features: [
                  'Livraison dans toute la France métropolitaine',
                  'Suivi en temps réel de votre colis',
                  'Assurance incluse jusqu\'à 100€',
                  'Notification SMS/Email à chaque étape',
                  'Dépôt en point relais possible',
                ],
                desc: 'Notre service standard est idéal pour vos envois non urgents. Bénéficiez d\'un excellent rapport qualité-prix avec un suivi complet de votre colis.'
              },
              {
                icon: <Zap className="h-10 w-10" />,
                title: 'Livraison Express 24h',
                price: 'À partir de 10,79€',
                delay: '24-48 heures',
                color: 'orange',
                features: [
                  'Livraison garantie en 24-48h',
                  'Collecte à domicile ou en entreprise',
                  'Suivi prioritaire en temps réel',
                  'Assurance incluse jusqu\'à 500€',
                  'Créneau de livraison au choix',
                  'Service client dédié',
                ],
                desc: 'Pour vos envois urgents, notre service express garantit une livraison en 24 à 48 heures partout en France avec un suivi prioritaire.'
              },
              {
                icon: <Shield className="h-10 w-10" />,
                title: 'Colis Fragiles',
                price: 'À partir de 8,99€',
                delay: '2-4 jours ouvrés',
                color: 'green',
                features: [
                  'Emballage renforcé spécial fragile',
                  'Manipulation avec précaution à chaque étape',
                  'Assurance renforcée incluse',
                  'Étiquetage "FRAGILE" visible',
                  'Transport sur mesure',
                ],
                desc: 'Confiez-nous vos objets fragiles en toute sérénité. Notre service spécialisé garantit un transport sécurisé avec un emballage adapté.'
              },
              {
                icon: <Truck className="h-10 w-10" />,
                title: 'Colis Volumineux',
                price: 'À partir de 11,99€',
                delay: '3-7 jours ouvrés',
                color: 'purple',
                features: [
                  'Prise en charge des colis jusqu\'à 70 kg',
                  'Transport adapté aux grandes dimensions',
                  'Collecte et livraison à l\'adresse',
                  'Manutention par équipe spécialisée',
                  'Devis personnalisé sur demande',
                ],
                desc: 'Pour vos envois encombrants, nous disposons de véhicules adaptés et d\'équipes spécialisées dans la manutention de colis volumineux.'
              },
            ].map((service, i) => (
              <div key={service.title} className={`flex flex-col ${i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}>
                <div className="flex-1">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                    service.color === 'blue' ? 'bg-blue-100 text-blue-900' :
                    service.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                    service.color === 'green' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {service.icon}
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{service.title}</h2>
                  <div className="flex gap-4 mb-4">
                    <span className="text-blue-900 font-bold">{service.price}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 flex items-center gap-1"><Clock className="h-4 w-4" /> {service.delay}</span>
                  </div>
                  <p className="text-gray-500 mb-6 leading-relaxed">{service.desc}</p>
                  <ul className="space-y-3">
                    {service.features.map(f => (
                      <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`flex-1 w-full rounded-3xl p-12 ${
                  service.color === 'blue' ? 'bg-blue-50' :
                  service.color === 'orange' ? 'bg-orange-50' :
                  service.color === 'green' ? 'bg-green-50' :
                  'bg-purple-50'
                } flex items-center justify-center`}>
                  <div className="text-center">
                    <div className="mb-4 opacity-20">{service.icon}</div>
                    <div className="text-4xl font-extrabold text-gray-800 mb-2">{service.delay}</div>
                    <div className="text-lg font-semibold text-gray-600">{service.price}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Extra services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Services complémentaires</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Headphones />, title: 'Support 7j/7', desc: 'Notre équipe est disponible du lundi au dimanche pour répondre à vos questions.' },
              { icon: <BarChart3 />, title: 'Tableau de bord', desc: 'Suivez toutes vos expéditions depuis un tableau de bord centralisé.' },
              { icon: <Globe />, title: 'API Intégration', desc: 'Intégrez nos services directement dans votre e-commerce via notre API.' },
            ].map(s => (
              <div key={s.title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                <div className="w-14 h-14 bg-blue-100 text-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {s.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-6">Besoin d'un devis personnalisé ?</h2>
          <p className="text-blue-200 mb-8">Contactez-nous pour obtenir une offre adaptée à vos besoins</p>
          <Link to="/devis" className="inline-block px-8 py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg">
            Demander un devis gratuit
          </Link>
        </div>
      </section>
    </div>
  );
}
