import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { config } from '../config/config';
import { logger } from '../utils/logger';

export interface IPFSUploadResult {
  hash: string;
  size: number;
  path: string;
}

export interface IPFSMetadata {
  name: string;
  description: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
}

export class IPFSService {
  private client: IPFSHTTPClient | null = null;
  private connected: boolean = false;

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      const ipfsUrl = `${config.ipfs.protocol}://${config.ipfs.host}:${config.ipfs.port}`;
      this.client = create({ url: ipfsUrl });
      logger.info(`🔗 IPFS client initialized: ${ipfsUrl}`);
    } catch (error) {
      logger.error('❌ Failed to initialize IPFS client:', error);
    }
  }

  async initialize(): Promise<void> {
    try {
      if (!this.client) {
        throw new Error('IPFS client not initialized');
      }

      // Test connection
      const version = await this.client.version();
      logger.info(`✅ IPFS connected - Version: ${version.version}`);
      
      this.connected = true;
    } catch (error) {
      logger.error('❌ Failed to connect to IPFS:', error);
      // Don't throw error - IPFS might not be running locally
      logger.warn('⚠️ IPFS connection failed - some features will be disabled');
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async uploadFile(file: Buffer | Uint8Array, filename: string): Promise<IPFSUploadResult | null> {
    try {
      if (!this.client || !this.connected) {
        logger.warn('IPFS not connected - file upload skipped');
        return null;
      }

      const result = await this.client.add(file, {
        pin: true,
        wrapWithDirectory: false
      });

      logger.info(`📁 File uploaded to IPFS: ${result.path} (${result.size} bytes)`);

      return {
        hash: result.cid.toString(),
        size: result.size,
        path: result.path
      };
    } catch (error) {
      logger.error('Error uploading file to IPFS:', error);
      return null;
    }
  }

  async uploadJSON(data: any, filename?: string): Promise<IPFSUploadResult | null> {
    try {
      if (!this.client || !this.connected) {
        logger.warn('IPFS not connected - JSON upload skipped');
        return null;
      }

      const jsonString = JSON.stringify(data, null, 2);
      const jsonBuffer = Buffer.from(jsonString, 'utf-8');

      const result = await this.client.add(jsonBuffer, {
        pin: true,
        wrapWithDirectory: false
      });

      logger.info(`📄 JSON uploaded to IPFS: ${result.path} (${result.size} bytes)`);

      return {
        hash: result.cid.toString(),
        size: result.size,
        path: result.path
      };
    } catch (error) {
      logger.error('Error uploading JSON to IPFS:', error);
      return null;
    }
  }

  async uploadProductMetadata(metadata: IPFSMetadata): Promise<IPFSUploadResult | null> {
    try {
      const metadataWithTimestamp = {
        ...metadata,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      return await this.uploadJSON(metadataWithTimestamp, 'product-metadata.json');
    } catch (error) {
      logger.error('Error uploading product metadata:', error);
      return null;
    }
  }

  async uploadSupplyChainEvent(eventData: any): Promise<IPFSUploadResult | null> {
    try {
      const eventWithTimestamp = {
        ...eventData,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      return await this.uploadJSON(eventWithTimestamp, 'supply-chain-event.json');
    } catch (error) {
      logger.error('Error uploading supply chain event:', error);
      return null;
    }
  }

  async uploadIoTData(iotData: any): Promise<IPFSUploadResult | null> {
    try {
      const dataWithTimestamp = {
        ...iotData,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      return await this.uploadJSON(dataWithTimestamp, 'iot-data.json');
    } catch (error) {
      logger.error('Error uploading IoT data:', error);
      return null;
    }
  }

  async retrieveFile(hash: string): Promise<Buffer | null> {
    try {
      if (!this.client || !this.connected) {
        logger.warn('IPFS not connected - file retrieval skipped');
        return null;
      }

      const chunks: Uint8Array[] = [];
      for await (const chunk of this.client.cat(hash)) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      logger.info(`📥 File retrieved from IPFS: ${hash} (${buffer.length} bytes)`);

      return buffer;
    } catch (error) {
      logger.error(`Error retrieving file from IPFS (${hash}):`, error);
      return null;
    }
  }

  async retrieveJSON(hash: string): Promise<any | null> {
    try {
      const buffer = await this.retrieveFile(hash);
      if (!buffer) return null;

      const jsonString = buffer.toString('utf-8');
      const data = JSON.parse(jsonString);
      
      logger.info(`📄 JSON retrieved from IPFS: ${hash}`);
      return data;
    } catch (error) {
      logger.error(`Error retrieving JSON from IPFS (${hash}):`, error);
      return null;
    }
  }

  getGatewayURL(hash: string): string {
    return `${config.ipfs.gateway}${hash}`;
  }

  async pinHash(hash: string): Promise<boolean> {
    try {
      if (!this.client || !this.connected) {
        logger.warn('IPFS not connected - pin operation skipped');
        return false;
      }

      await this.client.pin.add(hash);
      logger.info(`📌 Hash pinned to IPFS: ${hash}`);
      return true;
    } catch (error) {
      logger.error(`Error pinning hash to IPFS (${hash}):`, error);
      return false;
    }
  }

  async unpinHash(hash: string): Promise<boolean> {
    try {
      if (!this.client || !this.connected) {
        logger.warn('IPFS not connected - unpin operation skipped');
        return false;
      }

      await this.client.pin.rm(hash);
      logger.info(`📌 Hash unpinned from IPFS: ${hash}`);
      return true;
    } catch (error) {
      logger.error(`Error unpinning hash from IPFS (${hash}):`, error);
      return false;
    }
  }

  async getPinnedHashes(): Promise<string[]> {
    try {
      if (!this.client || !this.connected) {
        logger.warn('IPFS not connected - pin list skipped');
        return [];
      }

      const pins = [];
      for await (const pin of this.client.pin.ls()) {
        pins.push(pin.cid.toString());
      }

      logger.info(`📌 Retrieved ${pins.length} pinned hashes`);
      return pins;
    } catch (error) {
      logger.error('Error getting pinned hashes:', error);
      return [];
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        // IPFS HTTP client doesn't have a disconnect method
        this.client = null;
        this.connected = false;
        logger.info('✅ IPFS client disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting IPFS client:', error);
    }
  }
}

export default IPFSService;
