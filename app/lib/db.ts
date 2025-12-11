'use server';
// lib/db.ts
import { neon } from '@neondatabase/serverless';

export const db = neon(process.env.NEON_DATABASE_URL!);

// Example: Save user preferences
export async function saveUserPreferences(userId: string, preferences: Record<string, unknown>) {
  await db`
    INSERT INTO user_preferences (user_id, preferences, updated_at)
    VALUES (${userId}, ${JSON.stringify(preferences)}, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET preferences = EXCLUDED.preferences, updated_at = NOW()
  `;
}

// Example: Get user preferences
export async function getUserPreferences(userId: string) {
  const result = await db`
    SELECT preferences 
    FROM user_preferences 
    WHERE user_id = ${userId}
  `;
  return result[0]?.preferences;
}