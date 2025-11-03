import React from 'react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import Link from 'next/link'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
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
