'use client';

import { useState } from 'react';

export function StripeDemo() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [amount, setAmount] = useState('10.00');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    setSuccess(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setSuccess(false);
      setAmount('10.00');
    }, 3000);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Payment Demo</h3>
        <div className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900/50 dark:text-blue-300">
          TEST MODE
        </div>
      </div>

      {success ? (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 mb-4 text-green-500 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Payment Successful!</h4>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Thank you for your donation.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                required
              />
            </div>
          </div>

          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Card Details</p>
            
            <div className="relative">
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white placeholder-slate-400"
                maxLength={19}
                readOnly
                defaultValue="4242 4242 4242 4242"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <div className="w-8 h-5 bg-blue-600 rounded"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="MM / YY"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white"
                readOnly
                defaultValue="12 / 28"
              />
              <input
                type="text"
                placeholder="CVC"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white"
                readOnly
                defaultValue="123"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${amount}`
            )}
          </button>
          
          <p className="text-xs text-center text-slate-400">
            This is a simulated checkout for demonstration purposes.
          </p>
        </form>
      )}
    </div>
  );
}
