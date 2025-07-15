import React, { useState, useEffect } from 'react'
import { Download, Eye, Search, Filter } from 'lucide-react'
import { clientAPI, InsuranceRequest, RequestDetail } from '../../lib/api'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { RequestDetailModal } from '../../components/RequestDetailModal'
import toast from 'react-hot-toast'

export function RequestHistoryPage() {
  const [requests, setRequests] = useState<InsuranceRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<InsuranceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<RequestDetail | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, searchTerm, statusFilter])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const data = await clientAPI.getRequests()
      setRequests(data)
    } catch (error) {
      console.error('Erreur chargement demandes:', error)
      toast.error('Erreur lors du chargement des demandes')
    } finally {
      setLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = requests

    if (searchTerm) {
      filtered = filtered.filter(request => 
        `${request.vehicle_brand} ${request.vehicle_model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.vehicle_registration.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter)
    }

    setFilteredRequests(filtered)
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
        <h1 className="text-3xl font-bold text-gray-900">Historique des demandes</h1>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par véhicule ou immatriculation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input pl-10"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="assigned">Assigné</option>
                <option value="processing">En cours</option>
                <option value="completed">Terminé</option>
                <option value="rejected">Rejeté</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card">
        {filteredRequests.length > 0 ? (
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
                    Assureur
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
                {filteredRequests.map((request) => (
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
                      {request.insurer_name || '-'}
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
            <p className="text-gray-500">Aucune demande trouvée</p>
          </div>
        )}
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