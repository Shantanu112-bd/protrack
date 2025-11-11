import { ethers } from 'ethers';
import { config } from '../config/config';
import { logger } from '../utils/logger';

export interface BlockchainConfig {
  rpcUrl: string;
  chainId: number;
  privateKey?: string;
  gasLimit: number;
  gasPrice: string;
}

export interface ContractInfo {
  address: string;
  abi: any[];
  name: string;
}

export interface TransactionResult {
  hash: string;
  receipt?: ethers.TransactionReceipt;
  success: boolean;
  error?: string;
}

export class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private connected: boolean = false;
  private contracts: Map<string, ContractInfo> = new Map();

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider(): void {
    try {
      this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
      
      if (config.blockchain.privateKey) {
        this.wallet = new ethers.Wallet(config.blockchain.privateKey, this.provider);
        logger.info('🔑 Blockchain wallet initialized');
      }
      
      logger.info(`🔗 Blockchain provider initialized: ${config.blockchain.rpcUrl}`);
    } catch (error) {
      logger.error('❌ Failed to initialize blockchain provider:', error);
    }
  }

  async initialize(): Promise<void> {
    try {
      if (!this.provider) {
        throw new Error('Blockchain provider not initialized');
      }

      // Test connection
      const network = await this.provider.getNetwork();
      logger.info(`✅ Blockchain connected - Network: ${network.name} (Chain ID: ${network.chainId})`);
      
      if (this.wallet) {
        const balance = await this.provider.getBalance(this.wallet.address);
        logger.info(`💰 Wallet balance: ${ethers.formatEther(balance)} ETH`);
      }

      this.connected = true;
      
      // Load contract configurations
      await this.loadContracts();
      
    } catch (error) {
      logger.error('❌ Failed to connect to blockchain:', error);
      logger.warn('⚠️ Blockchain connection failed - some features will be disabled');
    }
  }

  private async loadContracts(): Promise<void> {
    try {
      // Load contract ABIs and addresses
      // In a real implementation, these would be loaded from deployment files
      const contracts = [
        {
          name: 'ProTrackSupplyChain',
          address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Example address
          abi: this.getSupplyChainABI()
        },
        {
          name: 'ProTrackNFT',
          address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Example address
          abi: this.getNFTABI()
        },
        {
          name: 'ProTrackOracle',
          address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', // Example address
          abi: this.getOracleABI()
        }
      ];

      for (const contract of contracts) {
        this.contracts.set(contract.name, contract);
        logger.info(`📄 Contract loaded: ${contract.name} at ${contract.address}`);
      }
    } catch (error) {
      logger.error('Error loading contracts:', error);
    }
  }

  private getSupplyChainABI(): any[] {
    return [
      "function createProduct(string memory _name, string memory _sku, string memory _batchId) external returns (uint256)",
      "function transferProduct(uint256 _tokenId, address _to) external",
      "function updateProductStatus(uint256 _tokenId, uint8 _status) external",
      "function addSupplyChainEvent(uint256 _tokenId, uint8 _eventType, string memory _location, string memory _metadata) external",
      "function getProductHistory(uint256 _tokenId) external view returns (tuple(uint8 eventType, address from, address to, string location, uint256 timestamp, string metadata)[])",
      "function getProductInfo(uint256 _tokenId) external view returns (string memory, string memory, string memory, uint8, address)",
      "event ProductCreated(uint256 indexed tokenId, string name, string sku, string batchId, address creator)",
      "event ProductTransferred(uint256 indexed tokenId, address from, address to)",
      "event ProductStatusUpdated(uint256 indexed tokenId, uint8 status)",
      "event SupplyChainEventAdded(uint256 indexed tokenId, uint8 eventType, string location)"
    ];
  }

  private getNFTABI(): any[] {
    return [
      "function mint(address to, uint256 tokenId, string memory tokenURI) external",
      "function setTokenURI(uint256 tokenId, string memory tokenURI) external",
      "function tokenURI(uint256 tokenId) external view returns (string memory)",
      "function ownerOf(uint256 tokenId) external view returns (address)",
      "function balanceOf(address owner) external view returns (uint256)",
      "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
    ];
  }

  private getOracleABI(): any[] {
    return [
      "function submitIoTData(string memory deviceId, string memory dataType, uint256 value, string memory unit, string memory location) external",
      "function getIoTData(string memory deviceId) external view returns (tuple(string dataType, uint256 value, string unit, string location, uint256 timestamp)[])",
      "function verifyData(string memory deviceId, uint256 dataIndex) external view returns (bool)",
      "event IoTDataSubmitted(string indexed deviceId, string dataType, uint256 value, string location)"
    ];
  }

  isConnected(): boolean {
    return this.connected;
  }

  getProvider(): ethers.JsonRpcProvider | null {
    return this.provider;
  }

  getWallet(): ethers.Wallet | null {
    return this.wallet;
  }

  getContract(name: string): ethers.Contract | null {
    try {
      const contractInfo = this.contracts.get(name);
      if (!contractInfo || !this.provider) {
        return null;
      }

      return new ethers.Contract(contractInfo.address, contractInfo.abi, this.wallet || this.provider);
    } catch (error) {
      logger.error(`Error getting contract ${name}:`, error);
      return null;
    }
  }

  async createProduct(name: string, sku: string, batchId: string): Promise<TransactionResult> {
    try {
      const contract = this.getContract('ProTrackSupplyChain');
      if (!contract) {
        throw new Error('Supply chain contract not available');
      }

      const tx = await contract.createProduct(name, sku, batchId, {
        gasLimit: config.blockchain.gasLimit,
        gasPrice: config.blockchain.gasPrice
      });

      logger.info(`📦 Product creation transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      logger.info(`✅ Product created successfully: ${tx.hash}`);

      return {
        hash: tx.hash,
        receipt,
        success: true
      };
    } catch (error) {
      logger.error('Error creating product:', error);
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async transferProduct(tokenId: number, to: string): Promise<TransactionResult> {
    try {
      const contract = this.getContract('ProTrackSupplyChain');
      if (!contract) {
        throw new Error('Supply chain contract not available');
      }

      const tx = await contract.transferProduct(tokenId, to, {
        gasLimit: config.blockchain.gasLimit,
        gasPrice: config.blockchain.gasPrice
      });

      logger.info(`🔄 Product transfer transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      logger.info(`✅ Product transferred successfully: ${tx.hash}`);

      return {
        hash: tx.hash,
        receipt,
        success: true
      };
    } catch (error) {
      logger.error('Error transferring product:', error);
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async addSupplyChainEvent(tokenId: number, eventType: number, location: string, metadata: string): Promise<TransactionResult> {
    try {
      const contract = this.getContract('ProTrackSupplyChain');
      if (!contract) {
        throw new Error('Supply chain contract not available');
      }

      const tx = await contract.addSupplyChainEvent(tokenId, eventType, location, metadata, {
        gasLimit: config.blockchain.gasLimit,
        gasPrice: config.blockchain.gasPrice
      });

      logger.info(`📝 Supply chain event transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      logger.info(`✅ Supply chain event added successfully: ${tx.hash}`);

      return {
        hash: tx.hash,
        receipt,
        success: true
      };
    } catch (error) {
      logger.error('Error adding supply chain event:', error);
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getProductInfo(tokenId: number): Promise<any> {
    try {
      const contract = this.getContract('ProTrackSupplyChain');
      if (!contract) {
        throw new Error('Supply chain contract not available');
      }

      const productInfo = await contract.getProductInfo(tokenId);
      logger.info(`📦 Product info retrieved for token ${tokenId}`);

      return {
        name: productInfo[0],
        sku: productInfo[1],
        batchId: productInfo[2],
        status: productInfo[3],
        currentOwner: productInfo[4]
      };
    } catch (error) {
      logger.error(`Error getting product info for token ${tokenId}:`, error);
      return null;
    }
  }

  async getProductHistory(tokenId: number): Promise<any[]> {
    try {
      const contract = this.getContract('ProTrackSupplyChain');
      if (!contract) {
        throw new Error('Supply chain contract not available');
      }

      const history = await contract.getProductHistory(tokenId);
      logger.info(`📜 Product history retrieved for token ${tokenId} (${history.length} events)`);

      return history.map(event => ({
        eventType: event.eventType,
        from: event.from,
        to: event.to,
        location: event.location,
        timestamp: event.timestamp,
        metadata: event.metadata
      }));
    } catch (error) {
      logger.error(`Error getting product history for token ${tokenId}:`, error);
      return [];
    }
  }

  async submitIoTData(deviceId: string, dataType: string, value: number, unit: string, location: string): Promise<TransactionResult> {
    try {
      const contract = this.getContract('ProTrackOracle');
      if (!contract) {
        throw new Error('Oracle contract not available');
      }

      const tx = await contract.submitIoTData(deviceId, dataType, value, unit, location, {
        gasLimit: config.blockchain.gasLimit,
        gasPrice: config.blockchain.gasPrice
      });

      logger.info(`📡 IoT data submission transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      logger.info(`✅ IoT data submitted successfully: ${tx.hash}`);

      return {
        hash: tx.hash,
        receipt,
        success: true
      };
    } catch (error) {
      logger.error('Error submitting IoT data:', error);
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async mintNFT(to: string, tokenId: number, tokenURI: string): Promise<TransactionResult> {
    try {
      const contract = this.getContract('ProTrackNFT');
      if (!contract) {
        throw new Error('NFT contract not available');
      }

      const tx = await contract.mint(to, tokenId, tokenURI, {
        gasLimit: config.blockchain.gasLimit,
        gasPrice: config.blockchain.gasPrice
      });

      logger.info(`🎨 NFT mint transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      logger.info(`✅ NFT minted successfully: ${tx.hash}`);

      return {
        hash: tx.hash,
        receipt,
        success: true
      };
    } catch (error) {
      logger.error('Error minting NFT:', error);
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Provider not available');
      }

      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error(`Error getting balance for ${address}:`, error);
      return '0';
    }
  }

  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    try {
      if (!this.provider) {
        throw new Error('Provider not available');
      }

      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      logger.error(`Error getting transaction receipt for ${txHash}:`, error);
      return null;
    }
  }

  async disconnect(): Promise<void> {
    try {
      this.provider = null;
      this.wallet = null;
      this.connected = false;
      this.contracts.clear();
      logger.info('✅ Blockchain service disconnected');
    } catch (error) {
      logger.error('Error disconnecting blockchain service:', error);
    }
  }
}

export default BlockchainService;
