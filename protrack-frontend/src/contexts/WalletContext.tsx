import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Types for wallet integration
interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string | null
  chainId: number | null
  isLoading: boolean
  error: string | null
}

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>
  signMessage: (message: string) => Promise<string>
  sendTransaction: (to: string, value: string) => Promise<string>
}

// Create context
const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Supported networks
const SUPPORTED_NETWORKS = {
  1: 'Ethereum Mainnet',
  5: 'Goerli Testnet',
  137: 'Polygon Mainnet',
  80001: 'Polygon Mumbai',
  11155111: 'Sepolia Testnet'
}

// Wallet Provider Component
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    isLoading: false,
    error: null
  })

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
  }

  // Get wallet balance
  const getBalance = async (address: string): Promise<string> => {
    if (!window.ethereum) return '0'
    
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      })
      
      // Convert from wei to ETH
      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18)
      return balanceInEth.toFixed(4)
    } catch (error) {
      console.error('Error getting balance:', error)
      return '0'
    }
  }

  // Connect wallet function
  const connectWallet = async (): Promise<void> => {
    if (!isMetaMaskInstalled()) {
      setWalletState(prev => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask to continue.'
      }))
      return
    }

    setWalletState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const address = accounts[0]
      
      // Get chain ID
      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      })

      // Get balance
      const balance = await getBalance(address)

      setWalletState({
        isConnected: true,
        address,
        balance,
        chainId: parseInt(chainId, 16),
        isLoading: false,
        error: null
      })

      // Store connection in localStorage
      localStorage.setItem('walletConnected', 'true')
      localStorage.setItem('walletAddress', address)

    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to connect wallet'
      }))
    }
  }

  // Disconnect wallet function
  const disconnectWallet = (): void => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null,
      isLoading: false,
      error: null
    })

    // Clear localStorage
    localStorage.removeItem('walletConnected')
    localStorage.removeItem('walletAddress')
  }

  // Switch network function
  const switchNetwork = async (targetChainId: number): Promise<void> => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }]
      })
    } catch (error: any) {
      console.error('Error switching network:', error)
      setWalletState(prev => ({
        ...prev,
        error: `Failed to switch to network ${SUPPORTED_NETWORKS[targetChainId as keyof typeof SUPPORTED_NETWORKS] || targetChainId}`
      }))
    }
  }

  // Sign message function
  const signMessage = async (message: string): Promise<string> => {
    if (!window.ethereum || !walletState.address) {
      throw new Error('Wallet not connected')
    }

    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletState.address]
      })
      return signature
    } catch (error: any) {
      console.error('Error signing message:', error)
      throw new Error('Failed to sign message')
    }
  }

  // Send transaction function
  const sendTransaction = async (to: string, value: string): Promise<string> => {
    if (!window.ethereum || !walletState.address) {
      throw new Error('Wallet not connected')
    }

    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletState.address,
          to,
          value: `0x${(parseFloat(value) * Math.pow(10, 18)).toString(16)}`
        }]
      })
      return txHash
    } catch (error: any) {
      console.error('Error sending transaction:', error)
      throw new Error('Failed to send transaction')
    }
  }

  // Handle account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else if (accounts[0] !== walletState.address) {
        // Account changed, reconnect
        connectWallet()
      }
    }

    const handleChainChanged = (chainId: string) => {
      setWalletState(prev => ({
        ...prev,
        chainId: parseInt(chainId, 16)
      }))
    }

    const handleDisconnect = () => {
      disconnectWallet()
    }

    // Add event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)
    window.ethereum.on('disconnect', handleDisconnect)

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
        window.ethereum.removeListener('disconnect', handleDisconnect)
      }
    }
  }, [walletState.address])

  // Auto-connect on page load if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected')
    if (wasConnected === 'true' && isMetaMaskInstalled()) {
      connectWallet()
    }
  }, [])

  const contextValue: WalletContextType = {
    ...walletState,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    signMessage,
    sendTransaction
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

// Custom hook to use wallet context
export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Utility functions
export const formatAddress = (address: string): string => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const getNetworkName = (chainId: number): string => {
  return SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS] || `Unknown Network (${chainId})`
}

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
      isMetaMask?: boolean
    }
  }
}
