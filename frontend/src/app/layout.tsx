import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SolanaWalletProvider } from '@/components/providers/SolanaWalletProvider'
import { SolanaProvider } from '@/components/providers/SolanaProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Solana Voting System',
  description: 'Decentralized voting platform built on Solana',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SolanaWalletProvider>
          <SolanaProvider>
            <div id="root">
              {children}
            </div>
          </SolanaProvider>
        </SolanaWalletProvider>
      </body>
    </html>
  )
}
