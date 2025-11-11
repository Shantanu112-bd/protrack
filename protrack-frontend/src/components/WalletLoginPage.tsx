import React, { useState, useEffect } from 'react'
import { useWallet, formatAddress } from '../contexts/WalletContext'

interface WalletLoginPageProps {
  onLogin: (loginType: 'wallet' | 'email', data?: any) => void
  isDark?: boolean
}

const WalletLoginPage: React.FC<WalletLoginPageProps> = ({ onLogin, isDark = true }) => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'wallet'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    isConnected,
    address,
    balance,
    chainId,
    isLoading: walletLoading,
    error: walletError,
    connectWallet,
    signMessage
  } = useWallet()

  // Auto-login when wallet is connected and user chooses wallet method
  useEffect(() => {
    if (isConnected && loginMethod === 'wallet' && address) {
      handleWalletLogin()
    }
  }, [isConnected, loginMethod, address])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    
    // Simulate email login
    setTimeout(() => {
      setIsLoading(false)
      onLogin('email', { email, password })
    }, 1500)
  }

  const handleWalletLogin = async () => {
    if (!isConnected || !address) {
      await connectWallet()
      return
    }

    setIsLoading(true)
    
    try {
      // Sign a message to verify wallet ownership
      const message = `Sign in to ProTrack\nAddress: ${address}\nTimestamp: ${Date.now()}`
      const signature = await signMessage(message)
      
      setIsLoading(false)
      onLogin('wallet', {
        address,
        signature,
        message,
        balance,
        chainId
      })
    } catch (error) {
      console.error('Wallet login error:', error)
      setIsLoading(false)
    }
  }

  const theme = {
    bg: isDark 
      ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-black' 
      : 'bg-gradient-to-br from-blue-50 via-white to-purple-50',
    card: isDark 
      ? 'bg-gray-900/50 border-gray-800' 
      : 'bg-white/80 border-gray-200',
    text: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
    input: isDark 
      ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
    button: isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 ${
          isDark ? 'bg-blue-500/10' : 'bg-blue-500/20'
        } rounded-full blur-3xl`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${
          isDark ? 'bg-purple-500/10' : 'bg-purple-500/20'
        } rounded-full blur-3xl`}></div>
      </div>

      {/* Login Card */}
      <div className={`relative z-10 w-full max-w-md p-8 ${theme.card} backdrop-blur-xl rounded-2xl border shadow-2xl`}>
        
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 mx-auto mb-4 ${
            isDark ? 'bg-blue-600' : 'bg-blue-500'
          } rounded-2xl flex items-center justify-center shadow-lg`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className={`text-3xl font-bold ${theme.text} mb-2`}>
            Pro<span className="text-blue-500">Track</span>
          </h1>
          <p className={theme.textSecondary}>
            Web3 Supply Chain Management
          </p>
        </div>

        {/* Login Method Toggle */}
        <div className="flex mb-6 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
          <button
            onClick={() => setLoginMethod('email')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginMethod === 'email'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Email Login
          </button>
          <button
            onClick={() => setLoginMethod('wallet')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginMethod === 'wallet'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Wallet Login
          </button>
        </div>

        {/* Email Login Form */}
        {loginMethod === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme.textSecondary}`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${theme.input}`}
                placeholder="admin@protrack.com"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme.textSecondary}`}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${theme.input}`}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 ${theme.button} text-white font-medium rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In with Email</span>
              )}
            </button>
          </form>
        )}

        {/* Wallet Login */}
        {loginMethod === 'wallet' && (
          <div className="space-y-6">
            {!isConnected ? (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                
                <h3 className={`text-lg font-semibold mb-2 ${theme.text}`}>Connect Your Wallet</h3>
                <p className={`mb-6 text-sm ${theme.textSecondary}`}>
                  Connect your MetaMask wallet to sign in securely
                </p>

                {walletError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                    <p className="text-red-700 text-sm">{walletError}</p>
                  </div>
                )}

                <button
                  onClick={connectWallet}
                  disabled={walletLoading}
                  className={`w-full py-3 px-4 ${theme.button} text-white font-medium rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2`}
                >
                  {walletLoading ? (
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
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h3 className={`text-lg font-semibold mb-2 ${theme.text}`}>Wallet Connected</h3>
                <p className={`mb-2 text-sm ${theme.textSecondary}`}>
                  {formatAddress(address || '')}
                </p>
                <p className={`mb-6 text-xs ${theme.textSecondary}`}>
                  Balance: {balance} ETH
                </p>

                <button
                  onClick={handleWalletLogin}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 ${theme.button} text-white font-medium rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Signing Message...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span>Sign Message to Login</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Demo Credentials for Email Login */}
        {loginMethod === 'email' && (
          <div className={`mt-6 p-4 ${
            isDark ? 'bg-gray-800/30' : 'bg-blue-50'
          } rounded-lg`}>
            <p className={`text-sm ${theme.textSecondary} mb-2`}>Demo Credentials:</p>
            <p className={`text-xs ${theme.text}`}>
              Email: <span className="font-mono">admin@protrack.com</span><br/>
              Password: <span className="font-mono">any password</span>
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className={`w-8 h-8 mx-auto mb-2 ${
              isDark ? 'text-blue-400' : 'text-blue-500'
            }`}>
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className={`text-xs ${theme.textSecondary}`}>Secure</p>
          </div>
          <div>
            <div className={`w-8 h-8 mx-auto mb-2 ${
              isDark ? 'text-green-400' : 'text-green-500'
            }`}>
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className={`text-xs ${theme.textSecondary}`}>Blockchain</p>
          </div>
          <div>
            <div className={`w-8 h-8 mx-auto mb-2 ${
              isDark ? 'text-purple-400' : 'text-purple-500'
            }`}>
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className={`text-xs ${theme.textSecondary}`}>Analytics</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletLoginPage
