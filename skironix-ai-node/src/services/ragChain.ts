import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { getVectorStore } from "../db/mongo.js";
import { env } from "../config/env.js";

// Simple retriever using MongoDB Atlas Vector Search
const getRetriever = () => {
  const vectorStore = getVectorStore();
  return vectorStore.asRetriever({ k: 4 });
};

export const chatWithData = async (query: string) => {
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-pro", // v1 uses "model" not modelName
    apiKey: env.GOOGLE_API_KEY,
    temperature: 0,
  });

  const retriever = getRetriever();

  const template = `
You are Skironix, an expert Aviation Regulation Assistant.
Answer the question based ONLY on the following context.
If the answer is not in the context, say:
"I cannot find this information in the documents."

Include specific section references if available.

Context:
{context}

Question:
{question}
`;

  const prompt = PromptTemplate.fromTemplate(template);

  const chain = RunnableSequence.from([
    {
      context: async (input: { question: string }) => {
        const docs = await retriever.invoke(input.question);
        return docs.map((doc) => doc.pageContent).join("\n\n");
      },
      question: (input: { question: string }) => input.question,
    },
    prompt,
    llm,
    new StringOutputParser(),
  ]);

  return await chain.invoke({ question: query });
};
