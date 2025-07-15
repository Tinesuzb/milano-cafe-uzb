import { NextResponse } from "next/server"
import { sql, hasDb } from "@/lib/db"

export async function GET() {
  if (!hasDb) {
    return NextResponse.json({ error: "Database not available in demo mode" }, { status: 400 })
  }

  try {
    const categories = await sql`
      SELECT 
        c.*,
        COUNT(m.id) as items_count
      FROM categories c
      LEFT JOIN menu_items m ON c.id = m.category_id
      GROUP BY c.id
      ORDER BY c.id
    `

    const categoriesArray = Array.isArray(categories) ? categories : categories.rows || []
    return NextResponse.json({ categories: categoriesArray })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!hasDb) {
    return NextResponse.json({ error: "Database not available in demo mode" }, { status: 400 })
  }

  try {
    const category = await request.json()
    
    const inserted = await sql`
      INSERT INTO categories (name_uz, name_ru, name_en, description_uz, description_ru, description_en)
      VALUES (${category.name_uz}, ${category.name_ru}, ${category.name_en}, 
              ${category.description_uz || ''}, ${category.description_ru || ''}, ${category.description_en || ''})
      RETURNING *
    `

    const newCategory = Array.isArray(inserted) ? inserted[0] : inserted.rows?.[0]
    return NextResponse.json({ success: true, category: newCategory })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}