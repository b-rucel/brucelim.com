'use client'

import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export function AuthDemo() {
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

    // Listen for auth changes (handles verification redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setMessage('Email verified! You are now signed in.')
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

  if (user) {
    return (
      <div className="my-8 p-6 border border-zinc-700 rounded-lg bg-zinc-900">
        <p className="text-green-400 mb-4">Signed in as {user.email}</p>
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

      {message && (
        <p className={`mt-4 text-sm ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
