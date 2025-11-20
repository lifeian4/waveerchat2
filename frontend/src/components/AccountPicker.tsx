import React, { useState } from 'react'
import { LogOut } from 'lucide-react'
import { Account } from '../types'
import { AccountCard } from './AccountCard'

interface AccountPickerProps {
  accounts: Account[]
  onAccountSelect: (account: Account) => void
  onUseAnotherAccount: () => void
  isLoading?: boolean
}

export const AccountPicker: React.FC<AccountPickerProps> = ({
  accounts,
  onAccountSelect,
  onUseAnotherAccount,
  isLoading = false,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleSelect = (account: Account) => {
    setSelectedId(account.id)
    setTimeout(() => {
      onAccountSelect(account)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-waveer-900 to-waveer-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-waveer-800 border border-waveer-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <h1 className="text-2xl font-bold text-waveer-50">Waveer</h1>
            </div>

            <h2 className="text-3xl font-bold text-waveer-50 mb-2">
              Choose an account
            </h2>
            <p className="text-waveer-400 text-sm">
              to continue to waveerchat
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-waveer-700 via-waveer-600 to-waveer-700"></div>

          {/* Accounts List */}
          <div className="px-8 py-6 space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className={`transform transition-all duration-300 ${
                  selectedId === account.id ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
                }`}
              >
                <AccountCard
                  account={account}
                  onSelect={handleSelect}
                />
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-waveer-700 via-waveer-600 to-waveer-700"></div>

          {/* Use Another Account */}
          <div className="px-8 py-4">
            <button
              onClick={onUseAnotherAccount}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border border-waveer-600 bg-waveer-800 hover:bg-waveer-700 text-waveer-300 hover:text-waveer-100 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut size={18} />
              Use another account
            </button>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-waveer-900/50 border-t border-waveer-700">
            <p className="text-waveer-500 text-xs text-center">
              Secure authentication powered by WaveerChat
            </p>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-waveer-800 rounded-lg p-6">
              <div className="w-8 h-8 border-4 border-waveer-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-waveer-300 text-sm mt-4 text-center">Signing in...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
