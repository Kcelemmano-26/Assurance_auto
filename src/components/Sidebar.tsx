import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import { 
  Home, 
  Plus, 
  History, 
  FileText, 
  Users, 
  Settings,
  BarChart3,
  CreditCard
} from 'lucide-react'

interface SidebarProps {
  userType: 'client' | 'insurer' | 'admin'
}

const navigationItems = {
  client: [
    { name: 'Tableau de bord', href: '/client', icon: Home },
    { name: 'Nouvelle demande', href: '/client/new-request', icon: Plus },
    { name: 'Historique', href: '/client/history', icon: History },
  ],
  insurer: [
    { name: 'Tableau de bord', href: '/insurer', icon: Home },
    { name: 'Demandes reçues', href: '/insurer/requests', icon: FileText },
    { name: 'Statistiques', href: '/insurer/stats', icon: BarChart3 },
  ],
  admin: [
    { name: 'Tableau de bord', href: '/admin', icon: Home },
    { name: 'Clients', href: '/admin/clients', icon: Users },
    { name: 'Assureurs', href: '/admin/insurers', icon: FileText },
    { name: 'Paiements', href: '/admin/payments', icon: CreditCard },
    { name: 'Paramètres', href: '/admin/settings', icon: Settings },
  ],
}

export function Sidebar({ userType }: SidebarProps) {
  const location = useLocation()
  const items = navigationItems[userType]

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={clsx(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}