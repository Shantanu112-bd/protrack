import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";
import { logger } from "../utils/logger";

dotenv.config();

export interface IPFSUploadResult {
  cid: string;
  url: string;
}

export class IPFSService {
  private ipfsGateway: string;
  private connected: boolean = false;

  async initialize(): Promise<void> {
    try {
      this.ipfsGateway = process.env.IPFS_GATEWAY_URL || "https://ipfs.io/ipfs/";
      logger.info("✅ IPFS service initialized with gateway: " + this.ipfsGateway);
      this.connected = true;
    } catch (error) {
      logger.error("❌ Failed to initialize IPFS:", error);
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async uploadProductMetadata(metadata: any): Promise<string> {
    try {
      const jsonString = JSON.stringify(metadata);
      
      const formData = new FormData();
      formData.append('file', Buffer.from(jsonString), 'metadata.json');
      
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            pinata_api_key: process.env.PINATA_API_KEY,
            pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
          },
        }
      );

      const cid = response.data.IpfsHash;
      logger.info(`📦 Product metadata uploaded to IPFS: ${cid}`);
      return cid;
    } catch (error: any) {
      logger.error("Error uploading product metadata to IPFS:", error.message);
      throw error;
    }
  }

  async uploadToIPFS(fileBuffer: Buffer, fileName: string): Promise<IPFSUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, fileName);

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            pinata_api_key: process.env.PINATA_API_KEY,
            pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
          },
        }
      );

      const cid = response.data.IpfsHash;
      return {
        cid,
        url: `https://ipfs.io/ipfs/${cid}`,
      };
    } catch (error: any) {
      logger.error("Error uploading to IPFS:", error.message);
      throw new Error(
        "Failed to upload file to IPFS: " + (error.message || "Unknown error")
      );
    }
  }

  async retrieveJSON(cid: string): Promise<any> {
    try {
      const response = await axios.get(`https://ipfs.io/ipfs/${cid}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Error retrieving JSON from IPFS (${cid}):`, error.message);
      throw error;
    }
  }
}

export async function uploadToIPFS(fileBuffer: Buffer, fileName: string): Promise<IPFSUploadResult> {
  const service = new IPFSService();
  return service.uploadToIPFS(fileBuffer, fileName);
}

export default IPFSService;
