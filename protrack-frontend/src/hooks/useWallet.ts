/**
 * Wallet Hook
 * Provides Web3 wallet functionality
 */

import { useState, useEffect, useCallback } from 'react'
import { web3Service, WalletConnection } from '../services/wallet/web3'

interface UseWalletReturn {
  wallet: WalletConnection | null
  isConnecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  signMessage: (message: string) => Promise<string>
}

export const useWallet = (): UseWalletReturn => {
  const [wallet, setWallet] = useState<WalletConnection | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const account = await web3Service.getAccount()
        if (account) {
          // Wallet is already connected, get full connection info
          const connection = await web3Service.connectWallet()
          setWallet(connection)
        }
      } catch (err) {
        // Wallet not connected or error occurred
        console.log('Wallet not connected')
      }
    }

    checkConnection()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          setWallet(null)
        } else {
          // Account changed, reconnect
          connect()
        }
      }

      const handleChainChanged = () => {
        // Chain changed, reconnect to get updated info
        if (wallet) {
          connect()
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
        }
      }
    }
  }, [wallet])

  const connect = useCallback(async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const connection = await web3Service.connectWallet()
      setWallet(connection)
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
      console.error('Wallet connection error:', err)
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    try {
      await web3Service.disconnectWallet()
      setWallet(null)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect wallet')
      console.error('Wallet disconnection error:', err)
    }
  }, [])

  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!wallet) {
      throw new Error('Wallet not connected')
    }

    try {
      setError(null)
      return await web3Service.signMessage(message)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign message'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [wallet])

  return {
    wallet,
    isConnecting,
    error,
    connect,
    disconnect,
    signMessage
  }
}
