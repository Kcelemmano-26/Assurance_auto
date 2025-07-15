import React, { useState, useEffect } from 'react'
import { Users, FileText, CreditCard, TrendingUp, AlertCircle, Eye, UserCheck, Building } from 'lucide-react'
import { adminAPI } from '../../lib/api'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

interface DashboardStats {
  total_clients: number
  total_insurers: number
  total_requests: number
  pending_requests: number
  completed_requests: number
  total_revenue: number
}

interface Client {
  id: number
  email: string
  full_name: string
  phone: string
  is_active: boolean
  created_at: string
  total_requests: number
}

interface Insurer {
  id: number
  name: string
  contact_email: string
  contact_phone: string
  commission_rate: number
  is_active: boolean
  created_at: string
  manager_name: string
  total_requests: number
}

interface Request {
  id: number
  client_name: string
  client_email: string
  vehicle_brand: string
  vehicle_model: string
  vehicle_year: number
  vehicle_registration: string
  status: string
  total_amount: number
  created_at: string
  insurer_name: string
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [insurers, setInsurers] = useState<Insurer[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, clientsData, insurersData, requestsData] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getClients(),
        adminAPI.getInsurers(),
        adminAPI.getRequests()
      ])
      
      setStats(statsData)
      setClients(clientsData)
      setInsurers(insurersData)
      setRequests(requestsData)
    } catch (error) {
      console.error('Erreur chargement données:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRequest = async (requestId: number, insurerId: number) => {
    try {
      await adminAPI.assignRequest(requestId, insurerId)
      toast.success('Demande assignée avec succès')
      loadDashboardData() // Recharger les données
    } catch (error) {
      toast.error('Erreur lors de l\'assignation')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Terminé</span>
      case 'processing':
        return <span className="badge badge-warning">En cours</span>
      case 'assigned':
        return <span className="badge badge-primary">Assigné</span>
      case 'pending':
        return <span className="badge badge-gray">En attente</span>
      case 'rejected':
        return <span className="badge badge-error">Rejeté</span>
      default:
        return <span className="badge badge-gray">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Administrateur</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_clients}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-warning-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assureurs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_insurers}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-error-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Demandes totales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_requests}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-success-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenus</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_revenue.toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Demandes en attente</h3>
            <p className="text-3xl font-bold text-warning-600">{stats.pending_requests}</p>
            <p className="text-sm text-gray-500 mt-1">Nécessitent une assignation</p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Demandes terminées</h3>
            <p className="text-3xl font-bold text-success-600">{stats.completed_requests}</p>
            <p className="text-sm text-gray-500 mt-1">Ce mois-ci</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Vue d\'ensemble', icon: TrendingUp },
            { id: 'clients', name: 'Clients', icon: Users },
            { id: 'insurers', name: 'Assureurs', icon: Building },
            { id: 'requests', name: 'Demandes', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-hover">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gérer les clients
            </h3>
            <p className="text-gray-600 mb-4">
              Consulter et gérer les comptes clients
            </p>
            <button 
              onClick={() => setActiveTab('clients')}
              className="btn-primary"
            >
              Voir les clients
            </button>
          </div>

          <div className="card-hover">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gérer les assureurs
            </h3>
            <p className="text-gray-600 mb-4">
              Administrer les compagnies partenaires
            </p>
            <button 
              onClick={() => setActiveTab('insurers')}
              className="btn-primary"
            >
              Voir les assureurs
            </button>
          </div>

          <div className="card-hover">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Traiter les demandes
            </h3>
            <p className="text-gray-600 mb-4">
              Assigner et suivre les demandes
            </p>
            <button 
              onClick={() => setActiveTab('requests')}
              className="btn-secondary"
            >
              Voir les demandes
            </button>
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Gestion des clients</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demandes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date inscription
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserCheck className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {client.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {client.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.email}</div>
                      <div className="text-sm text-gray-500">{client.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.total_requests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.is_active ? (
                        <span className="badge badge-success">Actif</span>
                      ) : (
                        <span className="badge badge-error">Inactif</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(client.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'insurers' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Gestion des assureurs</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compagnie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demandes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {insurers.map((insurer) => (
                  <tr key={insurer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {insurer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Gérant: {insurer.manager_name || 'Non assigné'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{insurer.contact_email}</div>
                      <div className="text-sm text-gray-500">{insurer.contact_phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {insurer.commission_rate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {insurer.total_requests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {insurer.is_active ? (
                        <span className="badge badge-success">Actif</span>
                      ) : (
                        <span className="badge badge-error">Inactif</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Gestion des demandes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Véhicule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assureur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.client_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.client_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.vehicle_brand} {request.vehicle_model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.vehicle_year} - {request.vehicle_registration}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.insurer_name || (
                        <select
                          onChange={(e) => handleAssignRequest(request.id, parseInt(e.target.value))}
                          className="text-xs border rounded px-2 py-1"
                          defaultValue=""
                        >
                          <option value="">Assigner...</option>
                          {insurers.filter(i => i.is_active).map(insurer => (
                            <option key={insurer.id} value={insurer.id}>
                              {insurer.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.total_amount.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}