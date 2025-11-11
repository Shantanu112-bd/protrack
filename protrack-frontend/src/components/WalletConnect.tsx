import React, { useState } from 'react'
import { useWallet, formatAddress, getNetworkName } from '../contexts/WalletContext'

const WalletConnect: React.FC<{ isDark?: boolean }> = ({ isDark = true }) => {
  const {
    isConnected,
    address,
    balance,
    chainId,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    signMessage
  } = useWallet()

  const [showDetails, setShowDetails] = useState(false)
  const [signMessageText, setSignMessageText] = useState('')
  const [signedMessage, setSignedMessage] = useState('')
  const [isSigningMessage, setIsSigningMessage] = useState(false)

  const handleSignMessage = async () => {
    if (!signMessageText.trim()) return

    setIsSigningMessage(true)
    try {
      const signature = await signMessage(signMessageText)
      setSignedMessage(signature)
    } catch (error) {
      console.error('Error signing message:', error)
    } finally {
      setIsSigningMessage(false)
    }
  }

  const theme = {
    bg: isDark ? 'bg-gray-900' : 'bg-gray-50',
    card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
    input: isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900',
    button: isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
  }

  if (!isConnected) {
    return (
      <div className={`p-6 rounded-xl border ${theme.card}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          
          <h3 className={`text-xl font-bold mb-2 ${theme.text}`}>Connect Your Wallet</h3>
          <p className={`mb-6 ${theme.textSecondary}`}>
            Connect your MetaMask wallet to access blockchain features
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={connectWallet}
            disabled={isLoading}
            className={`w-full py-3 px-6 ${theme.button} text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Connect MetaMask</span>
              </>
            )}
          </button>

          <div className="mt-4 text-xs text-gray-500">
            <p>Don't have MetaMask? <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">Download here</a></p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 rounded-xl border ${theme.card}`}>
      {/* Wallet Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className={`font-semibold ${theme.text}`}>Wallet Connected</h3>
            <p className={`text-sm ${theme.textSecondary}`}>
              {formatAddress(address || '')}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={`p-2 rounded-lg hover:bg-gray-600 ${theme.textSecondary}`}
        >
          <svg className={`w-5 h-5 transform transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Wallet Details */}
      {showDetails && (
        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme.textSecondary} mb-1`}>Balance</p>
              <p className={`font-semibold ${theme.text}`}>{balance} ETH</p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-xs ${theme.textSecondary} mb-1`}>Network</p>
              <p className={`font-semibold ${theme.text} text-xs`}>
                {chainId ? getNetworkName(chainId) : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Network Switching */}
          <div>
            <p className={`text-sm font-medium mb-2 ${theme.text}`}>Switch Network</p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 1, name: 'Ethereum' },
                { id: 5, name: 'Goerli' },
                { id: 137, name: 'Polygon' },
                { id: 80001, name: 'Mumbai' }
              ].map((network) => (
                <button
                  key={network.id}
                  onClick={() => switchNetwork(network.id)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    chainId === network.id
                      ? 'bg-blue-500 text-white border-blue-500'
                      : `${theme.textSecondary} border-gray-300 hover:border-blue-500`
                  }`}
                >
                  {network.name}
                </button>
              ))}
            </div>
          </div>

          {/* Message Signing */}
          <div>
            <p className={`text-sm font-medium mb-2 ${theme.text}`}>Sign Message</p>
            <div className="space-y-2">
              <input
                type="text"
                value={signMessageText}
                onChange={(e) => setSignMessageText(e.target.value)}
                placeholder="Enter message to sign..."
                className={`w-full px-3 py-2 rounded-lg border text-sm ${theme.input}`}
              />
              <button
                onClick={handleSignMessage}
                disabled={!signMessageText.trim() || isSigningMessage}
                className={`w-full py-2 px-4 ${theme.button} text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSigningMessage ? 'Signing...' : 'Sign Message'}
              </button>
              
              {signedMessage && (
                <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs ${theme.textSecondary} mb-1`}>Signature:</p>
                  <p className={`text-xs font-mono break-all ${theme.text}`}>
                    {signedMessage}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Button */}
      <button
        onClick={disconnectWallet}
        className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        Disconnect Wallet
      </button>
    </div>
  )
}

export default WalletConnect
