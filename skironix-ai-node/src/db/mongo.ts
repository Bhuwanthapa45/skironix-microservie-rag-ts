import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { env } from "../config/env.js";

const client = new MongoClient(env.MONGO_URI);

export const connectDB = async () => {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export const getDb = () => client.db(env.DB_NAME);

export const getVectorStore = () => {
  const db = getDb();

  // 👇 Cast to any to resolve cross-version mongodb typing conflict
  const collection = db.collection(env.VECTOR_COLLECTION) as any;

  return new MongoDBAtlasVectorSearch(
    new GoogleGenerativeAIEmbeddings({
      model: "embedding-001",
      apiKey: env.GOOGLE_API_KEY,
    }),
    {
      collection,
      indexName: "vector_index",
      textKey: "text",
      embeddingKey: "embedding",
    }
  );
};
