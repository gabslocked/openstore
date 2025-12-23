"use client"

import { usePathname } from 'next/navigation'
import Header from './header'
import Footer from './footer'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminArea = pathname?.startsWith('/admin')

  return (
    <>
      {!isAdminArea && <Header />}
      {children}
      {!isAdminArea && <Footer />}
    </>
  )
}
