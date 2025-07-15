import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Shield, CheckCircle, Clock, CreditCard, Users, ArrowRight } from 'lucide-react'

export function HomePage() {
  const { profile } = useAuth()

  const features = [
    {
      icon: Clock,
      title: 'Traitement rapide',
      description: 'Renouvellement en 24-48h ouvrées après paiement'
    },
    {
      icon: CreditCard,
      title: 'Paiement sécurisé',
      description: 'Paiement en ligne via FedaPay avec carte ou mobile money'
    },
    {
      icon: CheckCircle,
      title: 'Process simplifié',
      description: 'Interface intuitive pour soumettre votre demande'
    },
    {
      icon: Users,
      title: 'Assureurs partenaires',
      description: 'Réseau de compagnies d\'assurance de confiance'
    }
  ]

  if (profile) {
    const dashboardPath = `/${profile.role}`
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Bonjour";
      if (hour < 18) return "Bon après-midi";
      return "Bonsoir";
    };
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  AssuranceRenew
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {getGreeting()}, {profile.full_name || profile.email}
                </span>
                <span className="badge badge-primary">
                  {profile.role}
                </span>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <Shield className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bienvenue sur AssuranceRenew
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {getGreeting()} {profile.full_name || profile.email} !
            </p>
          </div>
          
          <Link
            to={dashboardPath}
            className="btn-primary text-lg px-8 py-3 inline-flex items-center"
          >
            Accéder à mon espace
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-blue-700 text-white">
        <nav className="bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-white" />
                <span className="ml-2 text-xl font-bold text-white">
                  AssuranceRenew
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-white hover:text-blue-100 transition-colors"
                >
                  Se connecter
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  S'inscrire
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-6 text-white" />
            <h1 className="text-5xl font-bold mb-6 text-balance">
              Renouvelez votre assurance auto en ligne
            </h1>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto text-balance">
              Plateforme sécurisée pour renouveler votre assurance automobile 
              rapidement et facilement avec nos assureurs partenaires.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-3 inline-flex items-center justify-center">
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/login" className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3 inline-flex items-center justify-center">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir AssuranceRenew ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une solution complète pour simplifier le renouvellement de votre assurance automobile
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Soumettez votre demande
              </h3>
              <p className="text-gray-600">
                Remplissez le formulaire avec les informations de votre véhicule et téléchargez vos documents
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Payez en ligne
              </h3>
              <p className="text-gray-600">
                Effectuez le paiement sécurisé via FedaPay. Le montant inclut une commission de service transparente
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Recevez votre attestation
              </h3>
              <p className="text-gray-600">
                Téléchargez votre attestation d'assurance dans les 24-48h ouvrées après traitement
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à renouveler votre assurance ?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Rejoignez des milliers de conducteurs qui nous font confiance
          </p>
          <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-3 inline-flex items-center">
            Créer un compte gratuitement
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}