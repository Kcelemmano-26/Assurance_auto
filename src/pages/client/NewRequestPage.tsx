import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Car, Upload, CreditCard, AlertCircle, FileText, CheckCircle2, Shield } from 'lucide-react'
import { clientAPI, paymentAPI } from '../../lib/api'
import toast from 'react-hot-toast'

interface RequestForm {
  vehicle_brand: string
  vehicle_model: string
  vehicle_year: number
  vehicle_registration: string
  previous_insurer: string
  insurer_preference: string
}

export function NewRequestPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<File[]>([])
  const [requestId, setRequestId] = useState<number | null>(null)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const navigate = useNavigate()
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RequestForm>()

  const currentYear = new Date().getFullYear()
  const commissionRate = 5 // 5%
  const baseAmount = 20000 // Montant de base
  const commissionAmount = (baseAmount * commissionRate) / 100
  const totalAmount = baseAmount + commissionAmount

  const requiredDocuments = [
    { name: 'Carte grise du véhicule', required: true, description: 'Document officiel d\'immatriculation' },
    { name: 'Attestation de contrôle technique valide', required: true, description: 'Obligatoire selon la réglementation CIMA' },
    { name: 'Reçu de paiement de la TVM (Taxe sur les Véhicules à Moteur)', required: true, description: 'Preuve de paiement à jour' },
    { name: 'Permis de conduire', required: true, description: 'Permis valide du conducteur principal' },
    { name: 'Pièce d\'identité du propriétaire', required: true, description: 'CNI, passeport ou autre pièce officielle' },
    { name: 'Ancienne attestation d\'assurance', required: false, description: 'Si disponible, pour faciliter le traitement' }
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    // Vérifier la taille des fichiers (max 5MB chacun)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast.error('Certains fichiers dépassent 5MB')
      return
    }

    // Vérifier les types de fichiers
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type))
    if (invalidFiles.length > 0) {
      toast.error('Seuls les fichiers PDF, JPG, JPEG et PNG sont autorisés')
      return
    }

    setDocuments(prev => [...prev, ...files])
    toast.success(`${files.length} fichier(s) ajouté(s)`)
  }

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
    toast.info('Fichier supprimé')
  }

  const onSubmit = async (data: RequestForm) => {
    if (step === 1) {
      setStep(2)
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      
      // Ajouter les données du formulaire
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString())
      })
      
      // Ajouter les documents
      documents.forEach((file) => {
        formData.append('documents', file)
      })
      
      const response = await clientAPI.createRequest(formData)
      setRequestId(response.requestId)
      toast.success('Demande soumise avec succès !')
      setStep(3) // Aller au paiement
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la soumission')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!requestId) {
      toast.error('Erreur: ID de demande manquant')
      return
    }

    setLoading(true)
    try {
      const paymentResponse = await paymentAPI.initiatePayment(requestId)
      
      if (paymentResponse.payment_url) {
        setPaymentUrl(paymentResponse.payment_url)
        toast.success('Lien de paiement généré avec succès!')
        
        // Ouvrir FedaPay dans un nouvel onglet
        window.open(paymentResponse.payment_url, '_blank', 'noopener,noreferrer')
        
        // Rediriger vers le dashboard après un délai
        setTimeout(() => {
          navigate('/client')
        }, 3000)
      } else {
        toast.error('Erreur lors de l\'initialisation du paiement')
      }
    } catch (error: any) {
      console.error('Erreur paiement:', error)
      toast.error(error.response?.data?.error || 'Erreur lors du paiement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Nouvelle demande de renouvellement</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8 mb-8">
        {[
          { number: 1, title: 'Informations véhicule', active: step >= 1, completed: step > 1 },
          { number: 2, title: 'Documents obligatoires', active: step >= 2, completed: step > 2 },
          { number: 3, title: 'Paiement sécurisé', active: step >= 3, completed: step > 3 }
        ].map((stepItem) => (
          <div key={stepItem.number} className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
              ${stepItem.completed 
                ? 'bg-success-600 text-white' 
                : stepItem.active 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }
            `}>
              {stepItem.completed ? <CheckCircle2 className="h-5 w-5" /> : stepItem.number}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              stepItem.active ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {stepItem.title}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Vehicle Information */}
      {step === 1 && (
        <div className="card">
          <div className="flex items-center mb-6">
            <Car className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Informations du véhicule</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marque du véhicule *
                </label>
                <input
                  {...register('vehicle_brand', { required: 'La marque est requise' })}
                  type="text"
                  className="input"
                  placeholder="Toyota, Honda, Nissan, etc."
                />
                {errors.vehicle_brand && (
                  <p className="text-error-600 text-sm mt-1">{errors.vehicle_brand.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modèle *
                </label>
                <input
                  {...register('vehicle_model', { required: 'Le modèle est requis' })}
                  type="text"
                  className="input"
                  placeholder="Camry, Civic, Sentra, etc."
                />
                {errors.vehicle_model && (
                  <p className="text-error-600 text-sm mt-1">{errors.vehicle_model.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Année de fabrication *
                </label>
                <select
                  {...register('vehicle_year', { 
                    required: 'L\'année est requise',
                    valueAsNumber: true,
                    min: { value: 1990, message: 'Année minimum: 1990' },
                    max: { value: currentYear, message: `Année maximum: ${currentYear}` }
                  })}
                  className="input"
                >
                  <option value="">Sélectionner l'année</option>
                  {Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.vehicle_year && (
                  <p className="text-error-600 text-sm mt-1">{errors.vehicle_year.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro d'immatriculation *
                </label>
                <input
                  {...register('vehicle_registration', { required: 'L\'immatriculation est requise' })}
                  type="text"
                  className="input"
                  placeholder="AB-123-CD"
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.vehicle_registration && (
                  <p className="text-error-600 text-sm mt-1">{errors.vehicle_registration.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assureur précédent (optionnel)
              </label>
              <input
                {...register('previous_insurer')}
                type="text"
                className="input"
                placeholder="Nom de votre ancienne compagnie d'assurance"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Préférence d'assureur
              </label>
              <select
                {...register('insurer_preference')}
                className="input"
              >
                <option value="">Laisser le système choisir automatiquement</option>
                <option value="allianz">Allianz Bénin</option>
                <option value="axa">AXA Assurances</option>
                <option value="nsia">NSIA Assurances</option>
                <option value="saham">Saham Assurance</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary">
                Continuer vers les documents
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Documents */}
      {step === 2 && (
        <div className="card">
          <div className="flex items-center mb-6">
            <Upload className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Documents obligatoires</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Documents requis selon la réglementation béninoise</h3>
                  <div className="text-sm text-blue-700 mt-2 space-y-2">
                    {requiredDocuments.map((doc, index) => (
                      <div key={index} className="flex items-start">
                        <span className={`mr-2 mt-1 ${doc.required ? 'text-red-600' : 'text-gray-500'}`}>
                          {doc.required ? '●' : '○'}
                        </span>
                        <div>
                          <span className="font-medium">{doc.name}</span>
                          {doc.required && <span className="text-red-600 ml-1">*</span>}
                          <p className="text-xs text-blue-600 mt-1">{doc.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2 bg-blue-100 rounded">
                    <p className="text-xs text-blue-800 font-medium">
                      ⚠️ Important: Sans l'attestation de contrôle technique valide et le reçu TVM à jour, 
                      l'assureur ne pourra pas procéder au renouvellement selon le Code CIMA.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Télécharger vos documents (PDF, JPG, PNG - Max 5MB par fichier)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Cliquez pour sélectionner ou glissez-déposez vos fichiers
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="btn-secondary cursor-pointer">
                  Sélectionner des fichiers
                </label>
              </div>
            </div>

            {documents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Fichiers sélectionnés ({documents.length})
                </h3>
                <div className="space-y-2">
                  {documents.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeDocument(index)}
                        className="text-error-600 hover:text-error-700 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary"
              >
                Retour
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={loading || documents.length < 5} // Au minimum 5 documents obligatoires
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Traitement...
                  </>
                ) : documents.length < 5 ? (
                  `Ajoutez au moins ${5 - documents.length} document(s) obligatoire(s)`
                ) : (
                  'Continuer vers le paiement'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div className="card">
          <div className="flex items-center mb-6">
            <CreditCard className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Paiement sécurisé</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif de votre demande</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant de base de l'assurance</span>
                  <span className="text-gray-900">{baseAmount.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Commission de service ({commissionRate}%)</span>
                  <span className="text-gray-900">{commissionAmount.toLocaleString()} FCFA</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900">Total à payer</span>
                    <span className="text-primary-600 text-lg">{totalAmount.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Informations importantes</h3>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Paiement sécurisé via FedaPay (carte bancaire ou mobile money)</li>
                    <li>• Commission transparente de {commissionRate}% pour le traitement</li>
                    <li>• Délai de traitement : 24 à 48h ouvrées après paiement</li>
                    <li>• Vous recevrez votre attestation par email</li>
                  </ul>
                </div>
              </div>
            </div>

            {paymentUrl && (
              <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-success-600 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-success-800">Lien de paiement généré</h3>
                    <p className="text-sm text-success-700 mt-1">
                      Le lien de paiement FedaPay a été ouvert dans un nouvel onglet. 
                      Si ce n'est pas le cas, cliquez sur le bouton ci-dessous.
                    </p>
                    <a
                      href={paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-success text-xs mt-2 inline-block"
                    >
                      Ouvrir le paiement FedaPay
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-success-50 border border-success-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-success-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-success-800">Votre demande est prête</h3>
                  <p className="text-sm text-success-700 mt-1">
                    Tous vos documents ont été vérifiés. Procédez au paiement pour finaliser votre demande.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="btn-secondary"
                disabled={loading}
              >
                Retour
              </button>
              <div className="flex space-x-3">
                {paymentUrl && (
                  <button
                    onClick={() => navigate('/client')}
                    className="btn-secondary"
                  >
                    Retour au tableau de bord
                  </button>
                )}
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="btn-primary flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Génération du lien...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payer {totalAmount.toLocaleString()} FCFA avec FedaPay
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}