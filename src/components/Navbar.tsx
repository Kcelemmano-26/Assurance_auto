import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Shield, User, LogOut } from 'lucide-react'

export function Navbar() {
  const { profile, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">
                AssuranceRenew
              </span>
            </Link>
          </div>

          {profile && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {profile.full_name || profile.email}
                </span>
                <span className="badge badge-primary">
                  {profile.role}
                </span>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                <span className="text-sm">Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}