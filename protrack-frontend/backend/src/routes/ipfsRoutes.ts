import express from "express";
import upload from "../middleware/upload";
import { uploadToIPFSController } from "../controllers/ipfsController";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadToIPFSController);

export default router;
