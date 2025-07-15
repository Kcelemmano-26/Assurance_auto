import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
  userType: 'client' | 'insurer' | 'admin'
}

export function Layout({ children, userType }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar userType={userType} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}