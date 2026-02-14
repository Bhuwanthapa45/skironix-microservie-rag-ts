import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();
const envSchema = z.object({
  PORT: z.string().default('3000'),
  GOOGLE_API_KEY: z.string(),
  MONGO_URI: z.string(),
  DB_NAME: z.string(),
  VECTOR_COLLECTION: z.string(),
  DOC_STORE_COLLECTION: z.string(),
});

export const env = envSchema.parse(process.env);


