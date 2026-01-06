'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export function AuthDemoWithTwitter() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes (handles OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setMessage('Signed in successfully!')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.href,
      },
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Check your email for the confirmation link!')
    }
    setIsLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Logged in successfully!')
    }
    setIsLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMessage('')
  }

  const handleTwitterSignIn = async () => {
    setIsLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'x',
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    }
    setIsLoading(false)
  }

  if (user) {
    return (
      <div className="my-8 p-6 border border-zinc-700 rounded-lg bg-zinc-900">
        <p className="text-green-400 mb-4">Signed in as {user.email || user.user_metadata?.name || 'User'}</p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="my-8 p-6 border border-zinc-700 rounded-lg bg-zinc-900">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setMode('signup')}
          className={`px-4 py-2 rounded ${mode === 'signup' ? 'bg-white text-black' : 'bg-zinc-800 text-white'}`}
        >
          Sign Up
        </button>
        <button
          onClick={() => setMode('login')}
          className={`px-4 py-2 rounded ${mode === 'login' ? 'bg-white text-black' : 'bg-zinc-800 text-white'}`}
        >
          Login
        </button>
      </div>

      <form onSubmit={mode === 'signup' ? handleSignUp : handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-white text-black rounded font-medium hover:bg-zinc-200 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : mode === 'signup' ? 'Sign Up' : 'Login'}
        </button>
      </form>

      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-zinc-700" />
        <span className="text-zinc-500 text-sm">or</span>
        <div className="flex-1 h-px bg-zinc-700" />
      </div>

      <button
        onClick={handleTwitterSignIn}
        disabled={isLoading}
        className="w-full py-2 bg-zinc-800 text-white rounded font-medium hover:bg-zinc-700 disabled:opacity-50 flex items-center justify-center gap-2 border border-zinc-700"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        {isLoading ? 'Signing in...' : 'Continue with X'}
      </button>

      {message && (
        <p className={`mt-4 text-sm ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
