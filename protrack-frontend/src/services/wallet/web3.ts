/**
 * Web3 Wallet Service
 * Handles wallet connections and blockchain interactions
 */

import Web3 from 'web3'

export interface WalletConnection {
  address: string
  balance: string
  chainId: number
  isConnected: boolean
}

export interface ContractInteraction {
  contractAddress: string
  abi: any[]
  method: string
  params: any[]
}

class Web3Service {
  private web3: Web3 | null = null
  private account: string | null = null

  async connectWallet(): Promise<WalletConnection> {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed')
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      this.web3 = new Web3(window.ethereum)
      this.account = accounts[0]

      // Get balance
      const balance = await this.web3.eth.getBalance(this.account)
      const balanceInEth = this.web3.utils.fromWei(balance, 'ether')

      // Get chain ID
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      })

      return {
        address: this.account,
        balance: balanceInEth,
        chainId: parseInt(chainId, 16),
        isConnected: true,
      }
    } catch (error) {
      console.error('Wallet connection failed:', error)
      throw error
    }
  }

  async disconnectWallet(): Promise<void> {
    this.web3 = null
    this.account = null
  }

  async getAccount(): Promise<string | null> {
    if (!this.web3 || !this.account) {
      return null
    }
    return this.account
  }

  async signMessage(message: string): Promise<string> {
    if (!this.web3 || !this.account) {
      throw new Error('Wallet not connected')
    }

    try {
      const signature = await this.web3.eth.personal.sign(message, this.account, '')
      return signature
    } catch (error) {
      console.error('Message signing failed:', error)
      throw error
    }
  }

  async callContract(interaction: ContractInteraction): Promise<any> {
    if (!this.web3 || !this.account) {
      throw new Error('Wallet not connected')
    }

    try {
      const contract = new this.web3.eth.Contract(
        interaction.abi,
        interaction.contractAddress
      )

      const result = await contract.methods[interaction.method](
        ...interaction.params
      ).call({ from: this.account })

      return result
    } catch (error) {
      console.error('Contract call failed:', error)
      throw error
    }
  }

  async sendTransaction(interaction: ContractInteraction): Promise<string> {
    if (!this.web3 || !this.account) {
      throw new Error('Wallet not connected')
    }

    try {
      const contract = new this.web3.eth.Contract(
        interaction.abi,
        interaction.contractAddress
      )

      const gasEstimate = await contract.methods[interaction.method](
        ...interaction.params
      ).estimateGas({ from: this.account })

      const receipt = await contract.methods[interaction.method](
        ...interaction.params
      ).send({
        from: this.account,
        gas: gasEstimate,
      })

      return receipt.transactionHash
    } catch (error) {
      console.error('Transaction failed:', error)
      throw error
    }
  }

  async switchNetwork(chainId: number): Promise<void> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed')
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        throw new Error('Network not added to MetaMask')
      }
      throw error
    }
  }
}

export const web3Service = new Web3Service()

// Extend window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
