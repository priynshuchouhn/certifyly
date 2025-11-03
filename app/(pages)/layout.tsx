"use client"

import React, { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import Tour from './components/Tour'
import Link from 'next/link'

function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [showTour, setShowTour] = useState(false)

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar (visible on md+) and mobile drawer when isSidebarOpen */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
  <Topbar onOpenSidebar={() => setSidebarOpen(true)} onStartTour={() => setShowTour(true)} />
  <Tour run={showTour} onClose={() => setShowTour(false)} />
        <main className="flex-1 p-6">
          {children}
        </main>
        <footer className="w-full mt-8 border-t border-border bg-background/50">
          <div className="max-w-7xl mx-auto px-4 py-3 text-center text-sm text-muted-foreground">
            Made with ❤️ by <Link href="https://linkedin.com/in/priynshuchouhn" target='_blank' className='font-semibold text-capitalize text-amber-600'>Priyanshu Chouhan</Link> &nbsp;© {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Layout
