import { Request, Response } from 'express';
import { uploadToIPFS } from "../services/ipfsService";

export const uploadToIPFSController = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await uploadToIPFS(req.file.buffer, req.file.originalname);

    return res.json({
      success: true,
      cid: result.cid,
      url: result.url,
    });
  } catch (err: any) {
    console.error("IPFS Upload Error:", err);
    return res.status(500).json({
      error: "Failed to upload file to IPFS",
      details: err.message,
    });
  }
};
