import fs from "fs";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getVectorStore } from "../db/mongo.js";

export const processPdf = async (filePath: string, filename: string) => {
  try {
    // 1️⃣ Load PDF
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    // 2️⃣ Add Metadata
    docs.forEach((doc) => {
      doc.metadata = {
        ...doc.metadata,
        source: filename,
        uploadedAt: new Date().toISOString(),
      };
    });

    // 3️⃣ Split into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await splitter.splitDocuments(docs);

    // 4️⃣ Store directly in MongoDB Vector Store
    const vectorStore = getVectorStore();
    await vectorStore.addDocuments(splitDocs);

    // 5️⃣ Delete file
    fs.unlinkSync(filePath);

    return { success: true, chunks: splitDocs.length };
  } catch (error) {
    console.error("Ingestion Error:", error);
    throw new Error("Failed to process PDF");
  }
};
