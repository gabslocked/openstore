'use client'

import { UserAccountPage } from './user-account-page'

export default function ContaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Minha Conta
        </h1>
        <UserAccountPage />
      </div>
    </div>
  )
}
