'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export function AuthDemoWithGithub() {
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

  const handleGithubSignIn = async () => {
    setIsLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.href,
      },
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
        onClick={handleGithubSignIn}
        disabled={isLoading}
        className="w-full py-2 bg-zinc-800 text-white rounded font-medium hover:bg-zinc-700 disabled:opacity-50 flex items-center justify-center gap-2 border border-zinc-700"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        {isLoading ? 'Signing in...' : 'Continue with GitHub'}
      </button>

      {message && (
        <p className={`mt-4 text-sm ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
