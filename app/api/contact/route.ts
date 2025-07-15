import { NextResponse } from "next/server"
import { sql, hasDb } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { name, email, subject, message, phone } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 })
    }

    if (!hasDb) {
      // Demo mode - just return success
      console.log("📧 Contact form submitted in DEMO mode:", { name, email, subject })
      return NextResponse.json({ success: true, message: "Message sent successfully!" })
    }

    // Save to database
    const inserted = await sql`
      INSERT INTO contact_messages (name, email, subject, message, phone, status)
      VALUES (${name}, ${email}, ${subject || 'No subject'}, ${message}, ${phone || null}, 'new')
      RETURNING *
    `

    const newMessage = Array.isArray(inserted) ? inserted[0] : inserted.rows?.[0]
    console.log("✅ Contact message saved:", newMessage?.id)

    return NextResponse.json({ 
      success: true, 
      message: "Message sent successfully! We'll get back to you soon.",
      id: newMessage?.id 
    })
  } catch (error) {
    console.error("❌ Error saving contact message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

export async function GET() {
  if (!hasDb) {
    return NextResponse.json({ error: "Database not available in demo mode" }, { status: 400 })
  }

  try {
    const messages = await sql`
      SELECT * FROM contact_messages 
      ORDER BY created_at DESC
      LIMIT 50
    `

    const messagesArray = Array.isArray(messages) ? messages : messages.rows || []
    return NextResponse.json({ messages: messagesArray })
  } catch (error) {
    console.error("Error fetching contact messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}