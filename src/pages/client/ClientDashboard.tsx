import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Clock, CheckCircle, Eye, Download } from 'lucide-react'
import { clientAPI, InsuranceRequest, RequestDetail } from '../../lib/api'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { RequestDetailModal } from '../../components/RequestDetailModal'
import toast from 'react-hot-toast'

interface ClientStats {
  total_requests: number
  pending_requests: number
  completed_requests: number
  processing_requests: number
}

export function ClientDashboard() {
  const [stats, setStats] = useState<ClientStats | null>(null)
  const [recentRequests, setRecentRequests] = useState<InsuranceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<RequestDetail | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, requestsData] = await Promise.all([
        clientAPI.getDashboard(),
        clientAPI.getRequests()
      ])
      
      setStats(statsData)
      setRecentRequests(requestsData.slice(0, 5)) // Dernières 5 demandes
    } catch (error) {
      console.error('Erreur chargement données:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
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

  const handleViewRequest = async (requestId: number) => {
    try {
      const request = await clientAPI.getRequest(requestId)
      setSelectedRequest(request)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Erreur lors du chargement des détails')
    }
  }

  const handleDownloadCertificate = (request: InsuranceRequest | RequestDetail) => {
    if (request.certificate_url) {
      const link = document.createElement('a')
      link.href = `http://localhost:3001${request.certificate_url}`
      link.download = `attestation-${request.vehicle_registration}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Téléchargement démarré')
    } else {
      toast.error('Attestation non disponible')
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
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <Link to="/client/new-request" className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle demande
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total demandes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_requests}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-warning-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending_requests}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-success-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Terminées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed_requests}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En traitement</p>
                <p className="text-lg font-bold text-gray-900">{stats.processing_requests}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Requests */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Demandes récentes</h2>
          <Link to="/client/history" className="text-primary-600 hover:text-primary-700 font-medium">
            Voir tout
          </Link>
        </div>

        {recentRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Véhicule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
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
                      {request.total_amount.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewRequest(request.id)}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {request.status === 'completed' && request.certificate_url && (
                          <button 
                            onClick={() => handleDownloadCertificate(request)}
                            className="text-success-600 hover:text-success-900 p-1 rounded hover:bg-success-50"
                            title="Télécharger l'attestation"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aucune demande trouvée</p>
            <Link to="/client/new-request" className="btn-primary">
              Créer votre première demande
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-hover">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nouvelle demande de renouvellement
          </h3>
          <p className="text-gray-600 mb-4">
            Soumettez une nouvelle demande de renouvellement d'assurance automobile
          </p>
          <Link to="/client/new-request" className="btn-primary">
            Commencer
          </Link>
        </div>

        <div className="card-hover">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Consulter l'historique
          </h3>
          <p className="text-gray-600 mb-4">
            Consultez toutes vos demandes passées et téléchargez vos attestations
          </p>
          <Link to="/client/history" className="btn-secondary">
            Voir l'historique
          </Link>
        </div>
      </div>

      {/* Modal */}
      <RequestDetailModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRequest(null)
        }}
        onDownload={handleDownloadCertificate}
      />
    </div>
  )
}