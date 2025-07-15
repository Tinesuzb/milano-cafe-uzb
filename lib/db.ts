// lib/db.ts
import { neon } from "@neondatabase/serverless"

// Check if database URL is available
export const hasDb = !!process.env.DATABASE_URL

// Conditionally initialize the database connection
export const sql = hasDb ? neon(process.env.DATABASE_URL!) : null

// Bazaga ulanishni tekshirish uchun funksiya
export async function testConnection() {
  if (!hasDb || !sql) {
    console.log("❌ No database URL configured, using demo mode")
    return false
  }

  try {
    await sql`SELECT 1 as test`
    console.log("✅ Database connection successful")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}
