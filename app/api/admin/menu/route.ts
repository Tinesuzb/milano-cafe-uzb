import { NextResponse } from "next/server"
import { sql, hasDb } from "@/lib/db"

// Admin menu management API
export async function GET() {
  if (!hasDb) {
    return NextResponse.json({ error: "Database not available in demo mode" }, { status: 400 })
  }

  try {
    const menuItems = await sql`
      SELECT 
        m.*,
        c.name_uz as category_name_uz,
        c.name_ru as category_name_ru,
        c.name_en as category_name_en
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      ORDER BY m.category_id, m.created_at DESC
    `

    const menuArray = Array.isArray(menuItems) ? menuItems : menuItems.rows || []
    return NextResponse.json({ menuItems: menuArray })
  } catch (error) {
    console.error("Error fetching admin menu:", error)
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!hasDb) {
    return NextResponse.json({ error: "Database not available in demo mode" }, { status: 400 })
  }

  try {
    const menuItem = await request.json()
    
    const inserted = await sql`
      INSERT INTO menu_items (
        name_uz, name_ru, name_en,
        description_uz, description_ru, description_en,
        price, category_id, image_url, is_available,
        preparation_time, calories,
        ingredients_uz, ingredients_ru, ingredients_en
      ) VALUES (
        ${menuItem.name_uz}, ${menuItem.name_ru}, ${menuItem.name_en},
        ${menuItem.description_uz}, ${menuItem.description_ru}, ${menuItem.description_en},
        ${menuItem.price}, ${menuItem.category_id}, ${menuItem.image_url}, ${menuItem.is_available || true},
        ${menuItem.preparation_time || 10}, ${menuItem.calories || 0},
        ${menuItem.ingredients_uz || ''}, ${menuItem.ingredients_ru || ''}, ${menuItem.ingredients_en || ''}
      )
      RETURNING *
    `

    const newItem = Array.isArray(inserted) ? inserted[0] : inserted.rows?.[0]
    return NextResponse.json({ success: true, menuItem: newItem })
  } catch (error) {
    console.error("Error creating menu item:", error)
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 })
  }
}