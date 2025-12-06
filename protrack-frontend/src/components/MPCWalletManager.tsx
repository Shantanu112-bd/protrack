import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Users, Key, Lock, Unlock, Plus, Settings, AlertTriangle, Check, Clock, X } from 'lucide-react'
import { useEnhancedWeb3 } from '../contexts/EnhancedWeb3Context'

interface MPCWallet {
  walletId: number
  threshold: number
  totalSigners: number
  isActive: boolean
  nonce: number
  signers: string[]
}

interface PendingTransaction {
  txHash: string
  walletId: number
  to: string
  value: number
  operation: string
  signatureCount: number
  requiredSignatures: number
  timestamp: number
  status: 'pending' | 'executed' | 'rejected'
}

const MPCWalletManager: React.FC = () => {
  const {
    account,
    isConnected,
    createMPCWallet,
    getMPCWalletInfo,
    proposeTransaction,
    signMPCTransaction
  } = useEnhancedWeb3()

  const [wallets, setWallets] = useState<MPCWallet[]>([])
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([])
  const [showCreateWallet, setShowCreateWallet] = useState(false)
  const [showProposeTransaction, setShowProposeTransaction] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // Create wallet form state
  const [newWalletSigners, setNewWalletSigners] = useState<string[]>([''])
  const [newWalletThreshold, setNewWalletThreshold] = useState(2)

  // Propose transaction form state
  const [transactionTo, setTransactionTo] = useState('')
  const [transactionValue, setTransactionValue] = useState('')
  const [transactionOperation, setTransactionOperation] = useState('TRANSFER')

  useEffect(() => {
    if (isConnected && account) {
      loadWallets()
      loadPendingTransactions()
    }
  }, [isConnected, account])

  const loadWallets = async () => {
    // In a real implementation, you'd fetch user's wallets from the contract
    // For demo purposes, we'll simulate some wallets
    const mockWallets: MPCWallet[] = [
      {
        walletId: 1,
        threshold: 2,
        totalSigners: 3,
        isActive: true,
        nonce: 5,
        signers: [account!, '0x742d35Cc6634C0532925a3b8D0C9C3c8e1B5C9E8', '0x8ba1f109551bD432803012645Hac136c0c8416']
      },
      {
        walletId: 2,
        threshold: 3,
        totalSigners: 5,
        isActive: true,
        nonce: 12,
        signers: [account!, '0x742d35Cc6634C0532925a3b8D0C9C3c8e1B5C9E8', '0x8ba1f109551bD432803012645Hac136c0c8416', '0x123456789abcdef123456789abcdef123456789a', '0x987654321fedcba987654321fedcba987654321f']
      }
    ]
    setWallets(mockWallets)
  }

  const loadPendingTransactions = async () => {
    // Mock pending transactions
    const mockTransactions: PendingTransaction[] = [
      {
        txHash: '0xabc123...',
        walletId: 1,
        to: '0x742d35Cc6634C0532925a3b8D0C9C3c8e1B5C9E8',
        value: 0.5,
        operation: 'MINT',
        signatureCount: 1,
        requiredSignatures: 2,
        timestamp: Date.now() - 3600000,
        status: 'pending'
      },
      {
        txHash: '0xdef456...',
        walletId: 2,
        to: '0x8ba1f109551bD432803012645Hac136c0c8416',
        value: 0,
        operation: 'RECALL',
        signatureCount: 2,
        requiredSignatures: 3,
        timestamp: Date.now() - 1800000,
        status: 'pending'
      }
    ]
    setPendingTransactions(mockTransactions)
  }

  const handleCreateWallet = async () => {
    if (!isConnected || newWalletSigners.filter(s => s.trim()).length < 2) return

    setLoading(true)
    try {
      const validSigners = newWalletSigners.filter(s => s.trim()).map(s => s.trim())
      const walletId = await createMPCWallet(validSigners, newWalletThreshold)
      
      // Add new wallet to list
      const newWallet: MPCWallet = {
        walletId,
        threshold: newWalletThreshold,
        totalSigners: validSigners.length,
        isActive: true,
        nonce: 0,
        signers: validSigners
      }
      setWallets([...wallets, newWallet])
      
      // Reset form
      setNewWalletSigners([''])
      setNewWalletThreshold(2)
      setShowCreateWallet(false)
    } catch (error) {
      console.error('Error creating MPC wallet:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProposeTransaction = async () => {
    if (!selectedWallet || !transactionTo || !transactionOperation) return

    setLoading(true)
    try {
      const txHash = await proposeTransaction(
        selectedWallet,
        transactionTo,
        parseFloat(transactionValue) || 0,
        '0x', // Empty data for now
        transactionOperation
      )
      
      // Add to pending transactions
      const wallet = wallets.find(w => w.walletId === selectedWallet)!
      const newTransaction: PendingTransaction = {
        txHash,
        walletId: selectedWallet,
        to: transactionTo,
        value: parseFloat(transactionValue) || 0,
        operation: transactionOperation,
        signatureCount: 1, // Proposer auto-signs
        requiredSignatures: wallet.threshold,
        timestamp: Date.now(),
        status: 'pending'
      }
      setPendingTransactions([...pendingTransactions, newTransaction])
      
      // Reset form
      setTransactionTo('')
      setTransactionValue('')
      setTransactionOperation('TRANSFER')
      setShowProposeTransaction(false)
    } catch (error) {
      console.error('Error proposing transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignTransaction = async (txHash: string, walletId: number) => {
    setLoading(true)
    try {
      await signMPCTransaction(walletId, txHash)
      
      // Update transaction signature count
      setPendingTransactions(prev => 
        prev.map(tx => 
          tx.txHash === txHash 
            ? { ...tx, signatureCount: tx.signatureCount + 1 }
            : tx
        )
      )
    } catch (error) {
      console.error('Error signing transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSignerField = () => {
    setNewWalletSigners([...newWalletSigners, ''])
  }

  const updateSignerField = (index: number, value: string) => {
    const updated = [...newWalletSigners]
    updated[index] = value
    setNewWalletSigners(updated)
  }

  const removeSignerField = (index: number) => {
    if (newWalletSigners.length > 1) {
      setNewWalletSigners(newWalletSigners.filter((_, i) => i !== index))
    }
  }

  const getTransactionStatusColor = (tx: PendingTransaction) => {
    if (tx.signatureCount >= tx.requiredSignatures) return 'text-green-400'
    if (tx.signatureCount > 0) return 'text-yellow-400'
    return 'text-gray-400'
  }

  const getTransactionStatusIcon = (tx: PendingTransaction) => {
    if (tx.signatureCount >= tx.requiredSignatures) return <Check className="w-4 h-4" />
    if (tx.signatureCount > 0) return <Clock className="w-4 h-4" />
    return <AlertTriangle className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">MPC Wallet Manager</h2>
            <p className="text-gray-400">Multi-Party Computation wallets for secure transactions</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateWallet(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Wallet</span>
        </button>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet) => (
          <motion.div
            key={wallet.walletId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">Wallet #{wallet.walletId}</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs ${wallet.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {wallet.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Threshold:</span>
                <span className="text-white">{wallet.threshold} of {wallet.totalSigners}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Nonce:</span>
                <span className="text-white">{wallet.nonce}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Signers:</span>
                <span className="text-white">{wallet.totalSigners}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <button
                onClick={() => {
                  setSelectedWallet(wallet.walletId)
                  setShowProposeTransaction(true)
                }}
                className="w-full px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors text-sm"
              >
                Propose Transaction
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pending Transactions */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-medium text-white">Pending Transactions</h3>
        </div>

        <div className="space-y-4">
          {pendingTransactions.map((tx) => (
            <motion.div
              key={tx.txHash}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/50 border border-gray-600 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-1 rounded ${getTransactionStatusColor(tx)}`}>
                    {getTransactionStatusIcon(tx)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{tx.operation}</div>
                    <div className="text-gray-400 text-sm">Wallet #{tx.walletId}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm ${getTransactionStatusColor(tx)}`}>
                    {tx.signatureCount}/{tx.requiredSignatures} signatures
                  </div>
                  <div className="text-gray-400 text-xs">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-400">To:</span>
                  <div className="text-white font-mono text-xs">{tx.to.slice(0, 10)}...{tx.to.slice(-8)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Value:</span>
                  <div className="text-white">{tx.value} ETH</div>
                </div>
              </div>

              {tx.signatureCount < tx.requiredSignatures && (
                <button
                  onClick={() => handleSignTransaction(tx.txHash, tx.walletId)}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Signing...' : 'Sign Transaction'}
                </button>
              )}
            </motion.div>
          ))}

          {pendingTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No pending transactions
            </div>
          )}
        </div>
      </div>

      {/* Create Wallet Modal */}
      <AnimatePresence>
        {showCreateWallet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white">Create MPC Wallet</h3>
                <button
                  onClick={() => setShowCreateWallet(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Signers
                  </label>
                  {newWalletSigners.map((signer, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={signer}
                        onChange={(e) => updateSignerField(index, e.target.value)}
                        placeholder="0x..."
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      />
                      {newWalletSigners.length > 1 && (
                        <button
                          onClick={() => removeSignerField(index)}
                          className="p-2 text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addSignerField}
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Signer</span>
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Threshold
                  </label>
                  <input
                    type="number"
                    value={newWalletThreshold}
                    onChange={(e) => setNewWalletThreshold(parseInt(e.target.value))}
                    min="2"
                    max={newWalletSigners.filter(s => s.trim()).length}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Minimum signatures required for transactions
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateWallet(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWallet}
                  disabled={loading || newWalletSigners.filter(s => s.trim()).length < 2}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Wallet'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Propose Transaction Modal */}
      <AnimatePresence>
        {showProposeTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white">Propose Transaction</h3>
                <button
                  onClick={() => setShowProposeTransaction(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Operation Type
                  </label>
                  <select
                    value={transactionOperation}
                    onChange={(e) => setTransactionOperation(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="TRANSFER">Transfer</option>
                    <option value="MINT">Mint NFT</option>
                    <option value="RECALL">Product Recall</option>
                    <option value="IOT_UPDATE">IoT Update</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    To Address
                  </label>
                  <input
                    type="text"
                    value={transactionTo}
                    onChange={(e) => setTransactionTo(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Value (ETH)
                  </label>
                  <input
                    type="number"
                    value={transactionValue}
                    onChange={(e) => setTransactionValue(e.target.value)}
                    placeholder="0.0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowProposeTransaction(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProposeTransaction}
                  disabled={loading || !transactionTo || !transactionOperation}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Proposing...' : 'Propose'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MPCWalletManager
