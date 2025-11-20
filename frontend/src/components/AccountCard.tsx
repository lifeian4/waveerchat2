import React from 'react'
import { Account } from '../types'

interface AccountCardProps {
  account: Account
  onSelect: (account: Account) => void
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, onSelect }) => {
  const initials = account.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <button
      onClick={() => onSelect(account)}
      className="w-full px-6 py-4 rounded-lg border border-waveer-700 bg-waveer-800 hover:bg-waveer-700 transition-all duration-200 text-left group"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {account.avatar_url ? (
            <img
              src={account.avatar_url}
              alt={account.name}
              className="w-12 h-12 rounded-full object-cover border border-waveer-600"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm border border-waveer-600">
              {initials}
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="flex-1 min-w-0">
          <p className="text-waveer-50 font-medium group-hover:text-white transition-colors">
            {account.name}
          </p>
          <p className="text-waveer-400 text-sm truncate">
            {account.email}
          </p>
        </div>

        {/* Checkmark */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </button>
  )
}
