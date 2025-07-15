import { NextResponse } from "next/server"
import { sql, hasDb } from "@/lib/db"

// Demo reviews
const demoReviews = [
  {
    id: 1,
    user_name: "Akmal Karimov",
    menu_item_id: 1,
    menu_item_name: "Milano Special Pizza",
    rating: 5,
    comment: "Juda mazali pizza! Tavsiya qilaman.",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    user_name: "Dilnoza Saidova", 
    menu_item_id: 2,
    menu_item_name: "Margherita Pizza",
    rating: 4,
    comment: "Klassik va mazali, lekin biroz tuzli edi.",
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const menuItemId = searchParams.get("menuItemId")

  if (!hasDb) {
    const filteredReviews = menuItemId 
      ? demoReviews.filter(r => r.menu_item_id === parseInt(menuItemId))
      : demoReviews
    return NextResponse.json({ reviews: filteredReviews })
  }

  try {
    const reviews = menuItemId
      ? await sql`
          SELECT 
            r.*,
            u.name as user_name,
            m.name_uz as menu_item_name
          FROM reviews r
          LEFT JOIN users u ON r.user_id = u.id
          LEFT JOIN menu_items m ON r.menu_item_id = m.id
          WHERE r.menu_item_id = ${menuItemId}
          ORDER BY r.created_at DESC
        `
      : await sql`
          SELECT 
            r.*,
            u.name as user_name,
            m.name_uz as menu_item_name
          FROM reviews r
          LEFT JOIN users u ON r.user_id = u.id
          LEFT JOIN menu_items m ON r.menu_item_id = m.id
          ORDER BY r.created_at DESC
          LIMIT 50
        `

    const reviewsArray = Array.isArray(reviews) ? reviews : reviews.rows || []
    return NextResponse.json({ reviews: reviewsArray })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ reviews: demoReviews })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, menuItemId, rating, comment } = await request.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    if (!hasDb) {
      // Demo mode
      const newReview = {
        id: Date.now(),
        user_name: "Demo User",
        menu_item_id: menuItemId,
        rating,
        comment: comment || "",
        created_at: new Date().toISOString()
      }
      return NextResponse.json({ success: true, review: newReview })
    }

    const inserted = await sql`
      INSERT INTO reviews (user_id, menu_item_id, rating, comment)
      VALUES (${userId}, ${menuItemId}, ${rating}, ${comment || ''})
      RETURNING *
    `

    const newReview = Array.isArray(inserted) ? inserted[0] : inserted.rows?.[0]
    return NextResponse.json({ success: true, review: newReview })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}