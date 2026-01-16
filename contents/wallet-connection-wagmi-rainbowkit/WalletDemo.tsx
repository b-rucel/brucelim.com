'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useChainId, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { mainnet, base, arbitrum, optimism, polygon } from 'wagmi/chains';
import { pulsechain } from '@/lib/wagmi';
import type { Address } from 'viem';
import { parseUnits, formatUnits } from 'viem';

const CHAINS = [mainnet, base, arbitrum, optimism, polygon, pulsechain];

// USDC contract addresses for each supported chain
const USDC_ADDRESSES: Record<number, Address> = {
  [mainnet.id]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  [base.id]: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  [arbitrum.id]: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
  [optimism.id]: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
  [polygon.id]: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
  [pulsechain.id]: '0x15d38573d2feeb82e7ad5187ab8c1d52810b1f07',
};

// Your donation wallet address
const DONATION_ADDRESS: Address = '0x4a5BBCdf73525e26167B7BEaf2129bc62E7E4459'

const ERC20_ABI = [
  {
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export function WalletDemo() {
  const [mounted, setMounted] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balanceData, isLoading: isLoadingBalance } = useBalance({
    address: address as Address,
  });

  const usdcAddress = USDC_ADDRESSES[chainId];

  // Read USDC balance
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!usdcAddress,
    },
  });

  // Write contract hook for USDC transfer
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isConfirmed) {
      setDonationAmount('');
      refetchUsdcBalance();
    }
  }, [isConfirmed, refetchUsdcBalance]);

  const handleDonate = () => {
    if (!donationAmount || !usdcAddress) return;

    try {
      const amount = parseUnits(donationAmount, 6); // USDC has 6 decimals

      writeContract({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [DONATION_ADDRESS, amount],
      });
    } catch (err) {
      console.error('Error preparing transaction:', err);
    }
  };

  if (!mounted) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8 p-6 rounded-lg border border-slate-700 bg-slate-900">
        <div className="h-32 bg-slate-800 rounded animate-pulse" />
      </div>
    );
  }

  const currentChain = CHAINS.find(chain => chain.id === chainId);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-6 rounded-lg border border-slate-700 bg-slate-900">
      <h2 className="text-2xl font-bold mb-4 text-white">Multi-Chain Wallet Connection</h2>

      <div className="mb-6">
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== 'loading';
            const connected = ready && account && chain;

            return (
              <div className="flex flex-wrap gap-3">
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        type="button"
                        style={{
                          borderRadius: '15px',
                          background: 'linear-gradient(145deg, #22d3ee, #3b82f6, #9333ea)',
                          boxShadow: '29px 29px 59px #1e40af, -29px -29px 59px #60a5fa'
                        }}
                        className="cursor-pointer relative px-8 py-4 text-white font-bold transition-all duration-200 hover:shadow-[25px_25px_50px_#1e40af,-25px_-25px_50px_#60a5fa] active:shadow-[inset_20px_20px_40px_#1e40af,inset_-20px_-20px_40px_#60a5fa]"
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                          </svg>
                          Connect Wallet
                        </span>
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg animate-pulse"
                      >
                        ⚠️ Wrong Network
                      </button>
                    );
                  }

                  return (
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="group relative flex items-center gap-4 px-5 py-3 bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700/80 text-white font-medium rounded-xl transition-all duration-200 border-2 border-slate-600/50 hover:border-blue-500/50 shadow-lg hover:shadow-blue-500/20 min-w-[300px]"
                      >
                        {chain.hasIcon && (
                          <div className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-blue-400/50 transition-all">
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                className="w-6 h-6"
                              />
                            )}
                          </div>
                        )}
                        <span className="font-semibold">{chain.name}</span>
                        <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="group relative flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform border border-white/10 min-w-[300px]"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-sm">{account.displayName}</span>
                          {account.displayBalance && (
                            <span className="text-xs text-white/80 font-mono">
                              {account.displayBalance}
                            </span>
                          )}
                        </div>
                        <svg className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>

      {isConnected && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Connected Chain</p>
            <p className="text-lg font-semibold text-white">
              {currentChain?.name || 'Unknown Chain'}
            </p>
          </div>

          <div className="p-4 bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Balance on {currentChain?.name}</p>
            {isLoadingBalance ? (
              <div className="h-8 bg-slate-700 rounded animate-pulse" />
            ) : balanceData ? (
              <p className="text-2xl font-bold text-white">
                {parseFloat(balanceData.formatted).toFixed(4)} {balanceData.symbol}
              </p>
            ) : (
              <p className="text-slate-400">Unable to fetch balance</p>
            )}
          </div>

          <div className="p-4 bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Supported Wallets</p>
            <p className="text-sm text-slate-300">
              MetaMask, Coinbase Wallet, Rabby, Rainbow, WalletConnect, and 100+ more wallets
            </p>
          </div>

          {usdcAddress && (
            <>
              <div className="p-4 bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-400 mb-2">USDC Balance on {currentChain?.name}</p>
                {usdcBalance !== undefined ? (
                  <p className="text-2xl font-bold text-white">
                    {formatUnits(usdcBalance as bigint, 6)} USDC
                  </p>
                ) : (
                  <p className="text-slate-400">Loading USDC balance...</p>
                )}
              </div>

              <div className="p-4 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg border border-green-700/50">
                <p className="text-lg font-semibold text-white mb-4">
                  💚 Support with USDC Donation
                </p>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="donation-amount" className="block text-sm text-slate-300 mb-2">
                      Amount (USDC)
                    </label>
                    <input
                      id="donation-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      placeholder="0.00"
                      disabled={isPending || isConfirming}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 disabled:opacity-50"
                    />
                  </div>

                  <button
                    onClick={handleDonate}
                    disabled={!donationAmount || isPending || isConfirming || parseFloat(donationAmount) <= 0}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending || isConfirming ? 'Processing...' : 'Send Donation'}
                  </button>

                  {hash && (
                    <div className="mt-3 p-3 bg-slate-900 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Transaction Hash:</p>
                      <a
                        href={`${currentChain?.blockExplorers?.default.url}/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-400 hover:text-green-300 font-mono break-all"
                      >
                        {hash}
                      </a>
                      {isConfirming && (
                        <p className="text-xs text-yellow-400 mt-2">Waiting for confirmation...</p>
                      )}
                      {isConfirmed && (
                        <p className="text-xs text-green-400 mt-2">✓ Transaction confirmed! Thank you!</p>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="mt-3 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                      <p className="text-xs text-red-400">Error: {error.message}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
