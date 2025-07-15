import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { Toaster } from 'react-hot-toast'

// Pages
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ClientDashboard } from './pages/client/ClientDashboard'
import { NewRequestPage } from './pages/client/NewRequestPage'
import { RequestHistoryPage } from './pages/client/RequestHistoryPage'
import { InsurerDashboard } from './pages/insurer/InsurerDashboard'
import { AdminDashboard } from './pages/admin/AdminDashboard'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route path="/client/*" element={
            <ProtectedRoute allowedRoles={['client']}>
              <Layout userType="client">
                <Routes>
                  <Route index element={<ClientDashboard />} />
                  <Route path="new-request" element={<NewRequestPage />} />
                  <Route path="history" element={<RequestHistoryPage />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/insurer/*" element={
            <ProtectedRoute allowedRoles={['insurer']}>
              <Layout userType="insurer">
                <Routes>
                  <Route index element={<InsurerDashboard />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout userType="admin">
                <Routes>
                  <Route index element={<AdminDashboard />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </AuthProvider>
  )
}

export default App