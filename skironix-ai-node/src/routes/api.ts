import { Router, Request, Response } from "express";
import multer from "multer";
import { processPdf } from "../services/ingestion.js";
import { chatWithData } from "../services/ragChain.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

// 🔹 Ingest Route
router.post(
  "/ingest",
  upload.single("pdf"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const result = await processPdf(
        req.file.path,
        req.file.originalname
      );

      return res.json({
        message: "Ingestion Successful",
        ...result,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Ingestion Failed",
        details:
          error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// 🔹 Chat Route
router.post("/chat", async (req: Request, res: Response) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const answer = await chatWithData(question);

    return res.json({ answer });
  } catch (error) {
    return res.status(500).json({
      error: "Chat Failed",
      details:
        error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
