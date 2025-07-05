'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '@/components/ui/WalletComponents';
import ClientOnly from '@/components/ui/ClientOnly';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { connected } = useWallet();
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/user', icon: '🏠' },
    { name: 'Communities', href: '/user/communities', icon: '🏘️' },
    { name: 'Voting', href: '/user/voting', icon: '🗳️' },
    { name: 'Profile', href: '/user/profile', icon: '👤' },
  ];

  const isActive = (href: string) => {
    if (href === '/user') {
      return pathname === '/user';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* User Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/user" className="flex items-center space-x-3">
                <div className="text-2xl">🗳️</div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Solana Voting</h1>
                  <p className="text-xs text-gray-500">Community Governance</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Wallet */}
            <div className="flex items-center space-x-4">
              <ClientOnly fallback={<div className="w-24 h-8 bg-gray-200 animate-pulse rounded"></div>}>
                <WalletButton />
              </ClientOnly>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-3">
            <div className="flex space-x-4 overflow-x-auto">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex-shrink-0 flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* User Content */}
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
              <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
                <div className="text-6xl mb-4">🔗</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Connect Your Wallet
                </h2>
                <p className="text-gray-600 mb-6">
                  Connect your Solana wallet to participate in community voting and governance.
                </p>
                <div className="space-y-4">
                  <ClientOnly fallback={<div className="w-32 h-10 bg-gray-200 animate-pulse rounded mx-auto"></div>}>
                    <WalletButton />
                  </ClientOnly>
                  <p className="text-sm text-gray-500">
                    New to Solana? <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Get Phantom Wallet</a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </ClientOnly>
      </main>
    </div>
  );
}