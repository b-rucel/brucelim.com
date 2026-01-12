'use client';

import { useState, useEffect } from 'react';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from '@coinbase/onchainkit/transaction';
import { useAccount } from 'wagmi';
import { parseUnits, type Address } from 'viem';

// USDC on Base Mainnet
const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address;
const USDC_DECIMALS = 6;

const RECIPIENT_ADDRESS = '0xa95cb331277c85f8D42714B24E4724DA67f205d0' as Address;

// Minimal ERC20 Transfer ABI
const ERC20_TRANSFER_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

export function DonationComponent() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('1');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prepare transaction contracts
  const contracts = [
    {
      address: USDC_BASE_ADDRESS,
      abi: ERC20_TRANSFER_ABI,
      functionName: 'transfer',
      args: [
        RECIPIENT_ADDRESS,
        parseUnits(amount, USDC_DECIMALS),
      ],
    },
  ];

  if (!mounted) {
    return (
      <div className="w-full max-w-md mx-auto mt-8 p-6 rounded-lg border border-slate-700 bg-slate-900">
        <h2 className="text-2xl font-bold mb-4">Support My Work</h2>
        <p className="text-slate-300 mb-6">
          Help me keep writing and building. Donate USDC on Base.
        </p>
        <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-8 p-6 rounded-lg border border-slate-700 bg-slate-900">
      <h2 className="text-2xl font-bold mb-4">Support My Work</h2>
      <p className="text-slate-300 mb-6">
        Help me keep writing and building. Donate USDC on Base.
      </p>

      {/* Wallet Connection */}
      <div className="mb-6">
        {!isConnected ? (
          <ConnectWallet className="w-full" />
        ) : (
          <div className="p-4 bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Connected Wallet</p>
            <p className="font-mono text-sm text-green-400 break-all">
              {address}
            </p>
          </div>
        )}
      </div>

      {/* Donation Form */}
      {isConnected && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Amount (USDC)
            </label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="1.0"
            />
          </div>

          {/* Transaction Component */}
          <Transaction
            address={address!}
            contracts={contracts}
            chainId={8453}
            onSuccess={(response) => {
              console.log('Donation successful:', response);
            }}
            onError={(error) => {
              console.log(error)
              console.error('Donation failed:', error);
            }}
          >
            <TransactionButton
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium"
              disabled={!amount || parseFloat(amount) <= 0}
            />
            <TransactionStatus>
              <TransactionStatusLabel />
              <TransactionStatusAction />
            </TransactionStatus>
          </Transaction>

          <p className="text-xs text-slate-500 text-center mt-4">
            Powered by Base • Secured by OnchainKit
          </p>
        </div>
      )}
    </div>
  );
}
