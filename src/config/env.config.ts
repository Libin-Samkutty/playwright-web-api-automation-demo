import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  BASE_URL: process.env.BASE_URL || 'https://practice.expandtesting.com',
  NOTES_API_URL: process.env.NOTES_API_URL || 'https://practice.expandtesting.com/notes/api',
  PRACTICE_API_URL: process.env.PRACTICE_API_URL || 'https://practice.expandtesting.com/api',
  DEFAULT_USERNAME: process.env.DEFAULT_USERNAME || 'practice',
  DEFAULT_PASSWORD: process.env.DEFAULT_PASSWORD || 'SuperSecretPassword!',
  TIMEOUT: parseInt(process.env.TIMEOUT || '30000', 10),
  RETRIES: parseInt(process.env.RETRIES || '2', 10),
  WORKERS: parseInt(process.env.WORKERS || '4', 10),
} as const;