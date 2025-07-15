import React, { createContext, useContext, useEffect, useState } from 'react'
import { authAPI, User } from '../lib/api'

interface AuthContextType {
  user: User | null
  profile: User | null
  session: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: { full_name: string; phone: string; role: 'client' | 'insurer' }) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        // Vérifier que le token est toujours valide
        authAPI.getProfile()
          .then(response => {
            setUser(response.user)
          })
          .catch(() => {
            // Token invalide, déconnecter
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
          })
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password)
      const { token, user: userData } = response
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur de connexion')
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    userData: { full_name: string; phone: string; role: 'client' | 'insurer' }
  ) => {
    try {
      const response = await authAPI.register({
        email,
        password,
        ...userData
      })
      
      const { token, user: newUser } = response
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(newUser))
      setUser(newUser)
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la création du compte')
    }
  }

  const signOut = async () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = {
    user,
    profile: user, // Pour compatibilité avec l'ancien code
    session: user ? { user } : null, // Pour compatibilité
    loading,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}