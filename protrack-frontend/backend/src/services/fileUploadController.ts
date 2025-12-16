import { Request, Response } from "express";
import multer from "multer";
import { uploadToIPFS } from "./ipfsService";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image types
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/gif" ||
      file.mimetype === "text/plain" ||
      file.mimetype === "application/json"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"));
    }
  },
});

/**
 * Handle file upload and IPFS submission
 * @param req - Express Request object
 * @param res - Express Response object
 */
export async function handleFileUpload(req: Request, res: Response) {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload to IPFS using the new service
    const result = await uploadToIPFS(req.file.buffer, req.file.originalname);

    // Return success response with CID and URL
    return res.status(200).json({
      success: true,
      cid: result.cid,
      url: result.url,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    return res.status(500).json({
      error: "Failed to upload file to IPFS",
      details: error.message,
    });
  }
}

/**
 * Middleware for handling multipart form data
 */
export const uploadMiddleware = upload.single("file");

export default {
  handleFileUpload,
  uploadMiddleware,
};
