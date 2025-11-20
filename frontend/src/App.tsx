import React, { useState } from 'react'
import { AccountPicker } from './components/AccountPicker'
import { LoginForm } from './components/LoginForm'
import { Account } from './types'

type View = 'accounts' | 'login'

function App() {
  const [view, setView] = useState<View>('accounts')
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: '1',
      email: 'aymian2050@gmail.com',
      name: 'aym_ian',
      avatar_url: 'https://ui-avatars.com/api/?name=aym+ian&background=random',
    },
    {
      id: '2',
      email: 'yyeshimwe20252026@gmail.com',
      name: 'Yves Ishimwe',
      avatar_url: 'https://ui-avatars.com/api/?name=Yves+Ishimwe&background=random',
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAccountSelect = async (account: Account) => {
    setIsLoading(true)
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Here you would normally:
      // 1. Validate the account token
      // 2. Redirect to dashboard or next page
      console.log('Selected account:', account)

      // For demo, just show success
      alert(`Logged in as ${account.name}`)
    } catch (err) {
      setError('Failed to sign in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseAnotherAccount = () => {
    setView('login')
    setError('')
  }

  const handleLoginSubmit = async (email: string, password: string) => {
    setIsLoading(true)
    setError('')

    try {
      // Simulate API call to OAuth server
      const response = await fetch('http://localhost:3000/oauth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          state: 'test_state',
          client_id: 'waveerchat_client_123',
        }),
      })

      if (!response.ok) {
        throw new Error('Invalid credentials')
      }

      // Add new account to list
      const newAccount: Account = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        avatar_url: `https://ui-avatars.com/api/?name=${email}&background=random`,
      }

      setAccounts([newAccount, ...accounts])
      setView('accounts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {view === 'accounts' ? (
        <AccountPicker
          accounts={accounts}
          onAccountSelect={handleAccountSelect}
          onUseAnotherAccount={handleUseAnotherAccount}
          isLoading={isLoading}
        />
      ) : (
        <LoginForm
          onSubmit={handleLoginSubmit}
          isLoading={isLoading}
          error={error}
        />
      )}
    </>
  )
}

export default App
