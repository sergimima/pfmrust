'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '@/components/ui/WalletComponents';
import ClientOnly from '@/components/ui/ClientOnly';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="text-2xl">🗳️</div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-xs text-gray-500">Solana Voting System</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link 
                href="/admin" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                📊 Dashboard
              </Link>
              <Link 
                href="/admin/communities" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                🏛️ Communities
              </Link>
              <Link 
                href="/admin/moderation" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                ⚖️ Moderation
              </Link>
              <Link 
                href="/admin/analytics" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                📈 Analytics
              </Link>
            </nav>

            {/* Wallet */}
            <div className="flex items-center space-x-4">
              <ClientOnly fallback={<div className="w-24 h-8 bg-gray-200 animate-pulse rounded"></div>}>
                <WalletButton />
              </ClientOnly>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ClientOnly fallback={
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading...</p>
          </div>
        }>
          {connected ? (
            children
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🔐</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Wallet Required
                </h2>
                <p className="text-gray-600 mb-6">
                  Please connect your wallet to access the admin panel.
                </p>
                <ClientOnly fallback={<div className="w-32 h-10 bg-gray-200 animate-pulse rounded mx-auto"></div>}>
                  <WalletButton />
                </ClientOnly>
              </div>
            </div>
          )}
        </ClientOnly>
      </main>
    </div>
  );
}