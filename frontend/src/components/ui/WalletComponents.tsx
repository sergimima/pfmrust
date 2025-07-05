'use client';

import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import { formatWalletAddress, copyToClipboard } from '@/lib/solana';
import { useSolana } from '@/components/providers/SolanaProvider';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

export const WalletButton: FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <WalletMultiButton className="!bg-solana-purple hover:!bg-purple-700 !text-white !font-medium !py-2 !px-4 !rounded-lg !transition-colors" />
    </div>
  );
};

export const WalletInfo: FC = () => {
  const { publicKey, connected, wallet } = useWallet();
  const { network, isConnected } = useSolana();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (publicKey) {
      const success = await copyToClipboard(publicKey.toString());
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (!connected || !publicKey) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Wallet Connected
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 dark:text-green-400">Online</span>
        </div>
      </div>

      {/* Wallet Info */}
      <div className="space-y-3">
        {/* Wallet Type */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Wallet:
          </span>
          <span className="text-sm text-gray-900 dark:text-white">
            {wallet?.adapter?.name || 'Unknown'}
          </span>
        </div>

        {/* Network */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Network:
          </span>
          <span className="text-sm text-gray-900 dark:text-white capitalize">
            {network}
          </span>
        </div>

        {/* RPC Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            RPC:
          </span>
          <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Address */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Address:
          </span>
          <div className="flex items-center space-x-2">
            <code className="text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {formatWalletAddress(publicKey.toString(), 6)}
            </code>
            <button
              onClick={handleCopyAddress}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Copy full address"
            >
              {copied ? (
                <CheckIcon className="w-4 h-4 text-green-500" />
              ) : (
                <ClipboardIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Disconnect Button */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <WalletDisconnectButton className="!bg-red-600 hover:!bg-red-700 !text-white !font-medium !py-2 !px-4 !rounded-lg !transition-colors !w-full" />
      </div>
    </div>
  );
};

export const WalletStatus: FC = () => {
  const { connected, connecting, disconnecting } = useWallet();
  const { isConnected } = useSolana();

  let status = 'Disconnected';
  let statusColor = 'text-red-600';

  if (connecting) {
    status = 'Connecting...';
    statusColor = 'text-yellow-600';
  } else if (disconnecting) {
    status = 'Disconnecting...';
    statusColor = 'text-yellow-600';
  } else if (connected && isConnected) {
    status = 'Connected';
    statusColor = 'text-green-600';
  } else if (connected && !isConnected) {
    status = 'Wallet Connected, RPC Failed';
    statusColor = 'text-orange-600';
  }

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${
        connected && isConnected ? 'bg-green-500 animate-pulse' : 
        connecting || disconnecting ? 'bg-yellow-500 animate-pulse' : 
        'bg-red-500'
      }`}></div>
      <span className={`text-sm font-medium ${statusColor}`}>
        {status}
      </span>
    </div>
  );
};
