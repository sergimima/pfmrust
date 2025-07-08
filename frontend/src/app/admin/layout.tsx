'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '@/components/ui/WalletComponents';
import ClientOnly from '@/components/ui/ClientOnly';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Super Admin wallet address
const SUPER_ADMIN_WALLET = 'GJENwjwdh7rAcZyrYh76SDjwgYrhncfhQKaMNGfSHirw';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { connected, publicKey } = useWallet();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar si el usuario conectado es Super Admin
  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toString();
      const authorized = walletAddress === SUPER_ADMIN_WALLET;
      setIsAuthorized(authorized);
      setLoading(false);
      
      if (!authorized) {
        console.warn('⚠️ Usuario no autorizado para admin panel:', walletAddress);
        console.log('✅ Super Admin wallet requerido:', SUPER_ADMIN_WALLET);
      } else {
        console.log('✅ Super Admin acceso autorizado');
      }
    } else {
      setIsAuthorized(false);
      setLoading(false);
    }
  }, [connected, publicKey]);

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
                href="/admin/tools" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                🛠️ Tools
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
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Validating permissions...</p>
            </div>
          ) : !connected ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🔐</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Admin Access Required
                </h2>
                <p className="text-gray-600 mb-6">
                  Please connect the Super Admin wallet to access the admin panel.
                </p>
                <ClientOnly fallback={<div className="w-32 h-10 bg-gray-200 animate-pulse rounded mx-auto"></div>}>
                  <WalletButton />
                </ClientOnly>
              </div>
            </div>
          ) : !isAuthorized ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-8">
                <div className="text-6xl mb-4">⛔</div>
                <h2 className="text-2xl font-bold text-red-900 mb-4">
                  Access Denied
                </h2>
                <p className="text-red-700 mb-4">
                  Only the Super Admin wallet can access this panel.
                </p>
                <div className="bg-red-100 rounded p-4 mb-6">
                  <p className="text-sm text-red-800"><strong>Your wallet:</strong></p>
                  <code className="text-xs text-red-700">{publicKey?.toString()}</code>
                  <p className="text-sm text-red-800 mt-2"><strong>Required wallet:</strong></p>
                  <code className="text-xs text-red-700">{SUPER_ADMIN_WALLET}</code>
                </div>
                <Link 
                  href="/user" 
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go to User Dashboard
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </ClientOnly>
      </main>
    </div>
  );
}