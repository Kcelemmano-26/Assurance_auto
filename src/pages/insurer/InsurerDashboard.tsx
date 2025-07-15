import React, { useState, useEffect } from 'react'
import { FileText, Clock, CheckCircle, AlertCircle, Eye, Upload } from 'lucide-react'
import { insurerAPI } from '../../lib/api'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

interface InsurerStats {
  company: {
    id: number
    name: string
  }
  total_requests: number
  new_requests: number
  processing_requests: number
  completed_requests: number
}

interface InsurerRequest {
  id: number
  client_name: string
  client_email: string
  client_phone: string
  vehicle_brand: string
  vehicle_model: string
  vehicle_year: number
  vehicle_registration: string
  total_amount: number
  status: string
  created_at: string
  documents: string
}

export function InsurerDashboard() {
  const [stats, setStats] = useState<InsurerStats | null>(null)
  const [requests, setRequests] = useState<InsurerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState<number | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, requestsData] = await Promise.all([
        insurerAPI.getDashboard(),
        insurerAPI.getRequests()
      ])
      
      setStats(statsData)
      setRequests(requestsData)
    } catch (error) {
      console.error('Erreur chargement données:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (requestId: number, status: string, notes?: string) => {
    try {
      setProcessingRequest(requestId)
      await insurerAPI.updateRequestStatus(requestId, status, notes)
      toast.success('Statut mis à jour avec succès')
      loadDashboardData() // Recharger les données
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setProcessingRequest(null)
    }
  }

  const handleUploadCertificate = async (requestId: number, file: File) => {
    try {
      setProcessingRequest(requestId)
      await insurerAPI.uploadCertificate(requestId, file)
      toast.success('Attestation uploadée avec succès')
      loadDashboardData() // Recharger les données
    } catch (error) {
      toast.error('Erreur lors de l\'upload')
    } finally {
      setProcessingRequest(null)
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
      case 'rejected':
        return <span className="badge badge-error">Rejeté</span>
      default:
        return <span className="badge badge-gray">{status}</span>
    }
  }

  const getPriorityLevel = (createdAt: string) => {
    const daysSinceCreation = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceCreation > 2) return 'high'
    if (daysSinceCreation > 1) return 'normal'
    return 'low'
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="badge badge-error">Urgent</span>
      case 'normal':
        return <span className="badge badge-warning">Normal</span>
      case 'low':
        return <span className="badge badge-gray">Récent</span>
      default:
        return <span className="badge badge-gray">{priority}</span>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Assureur</h1>
          {stats?.company && (
            <p className="text-gray-600 mt-1">{stats.company.name}</p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-error-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nouvelles demandes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.new_requests}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-warning-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En traitement</p>
                <p className="text-2xl font-bold text-gray-900">{stats.processing_requests}</p>
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
              <FileText className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_requests}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requests Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Demandes assignées</h2>
        </div>

        {requests.length > 0 ? (
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
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priorité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => {
                  const priority = getPriorityLevel(request.created_at)
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.client_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.client_email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.client_phone}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.total_amount.toLocaleString()} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {request.status === 'assigned' && (
                            <button 
                              onClick={() => handleUpdateStatus(request.id, 'processing', 'Traitement en cours')}
                              disabled={processingRequest === request.id}
                              className="btn-primary text-xs px-3 py-1"
                            >
                              {processingRequest === request.id ? 'En cours...' : 'Commencer'}
                            </button>
                          )}
                          
                          {request.status === 'processing' && (
                            <div className="flex space-x-1">
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    handleUploadCertificate(request.id, file)
                                  }
                                }}
                                className="hidden"
                                id={`upload-${request.id}`}
                              />
                              <label
                                htmlFor={`upload-${request.id}`}
                                className="btn-success text-xs px-3 py-1 cursor-pointer inline-flex items-center"
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                Attestation
                              </label>
                              <button 
                                onClick={() => handleUpdateStatus(request.id, 'rejected', 'Demande rejetée')}
                                className="btn-error text-xs px-3 py-1"
                              >
                                Rejeter
                              </button>
                            </div>
                          )}
                          
                          <button 
                            onClick={() => {
                              // Voir les documents
                              if (request.documents) {
                                try {
                                  const docs = JSON.parse(request.documents)
                                  console.log('Documents:', docs)
                                  toast.info('Voir la console pour les documents')
                                } catch (e) {
                                  toast.error('Erreur lors du chargement des documents')
                                }
                              }
                            }}
                            className="text-primary-600 hover:text-primary-900"
                            title="Voir les documents"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune demande assignée</p>
          </div>
        )}
      </div>
    </div>
  )
}