import React from 'react'
import { X, Download, FileText, Calendar, User, Car } from 'lucide-react'
import { RequestDetail } from '../lib/api'

interface RequestDetailModalProps {
  request: RequestDetail | null
  isOpen: boolean
  onClose: () => void
  onDownload?: (request: RequestDetail) => void
}

export function RequestDetailModal({ request, isOpen, onClose, onDownload }: RequestDetailModalProps) {
  if (!isOpen || !request) return null

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

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="badge badge-success">Payé</span>
      case 'pending':
        return <span className="badge badge-warning">En attente</span>
      case 'failed':
        return <span className="badge badge-error">Échec</span>
      default:
        return <span className="badge badge-gray">{status}</span>
    }
  }

  const documents = request.documents ? JSON.parse(request.documents) : []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Détails de la demande #{request.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Véhicule</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Marque et modèle:</span>
                  <p className="text-gray-900">{request.vehicle_brand} {request.vehicle_model}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Année:</span>
                  <p className="text-gray-900">{request.vehicle_year}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Immatriculation:</span>
                  <p className="text-gray-900 font-mono">{request.vehicle_registration}</p>
                </div>
                {request.previous_insurer && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Ancien assureur:</span>
                    <p className="text-gray-900">{request.previous_insurer}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Statut</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Statut de la demande:</span>
                  <div className="mt-1">{getStatusBadge(request.status)}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Statut du paiement:</span>
                  <div className="mt-1">{getPaymentStatusBadge(request.payment_status)}</div>
                </div>
                {request.insurer_name && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Assureur assigné:</span>
                    <p className="text-gray-900">{request.insurer_name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Montants */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Détail des montants</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Montant de base:</span>
                <span className="text-gray-900">{request.net_amount.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Commission de service:</span>
                <span className="text-gray-900">{request.commission_amount.toLocaleString()} FCFA</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-primary-600">{request.total_amount.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          {documents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Documents fournis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents.map((doc: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{doc.originalname}</p>
                      <p className="text-xs text-gray-500">Fichier uploadé</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {request.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">{request.notes}</p>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Créé le {new Date(request.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Modifié le {new Date(request.updated_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            {request.status === 'completed' && request.certificate_url && onDownload && (
              <button
                onClick={() => onDownload(request)}
                className="btn-success flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger l'attestation
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}