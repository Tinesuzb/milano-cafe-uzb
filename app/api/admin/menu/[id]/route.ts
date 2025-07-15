import { NextResponse } from "next/server"
import { sql, hasDb } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!hasDb) {
    return NextResponse.json({ error: "Database not available in demo mode" }, { status: 400 })
  }

  try {
    const menuItem = await request.json()
    const id = parseInt(params.id)
    
    const updated = await sql`
      UPDATE menu_items SET
        name_uz = ${menuItem.name_uz},
        name_ru = ${menuItem.name_ru},
        name_en = ${menuItem.name_en},
        description_uz = ${menuItem.description_uz},
        description_ru = ${menuItem.description_ru},
        description_en = ${menuItem.description_en},
        price = ${menuItem.price},
        category_id = ${menuItem.category_id},
        image_url = ${menuItem.image_url},
        is_available = ${menuItem.is_available},
        preparation_time = ${menuItem.preparation_time},
        calories = ${menuItem.calories},
        ingredients_uz = ${menuItem.ingredients_uz},
        ingredients_ru = ${menuItem.ingredients_ru},
        ingredients_en = ${menuItem.ingredients_en},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    const updatedItem = Array.isArray(updated) ? updated[0] : updated.rows?.[0]
    return NextResponse.json({ success: true, menuItem: updatedItem })
  } catch (error) {
    console.error("Error updating menu item:", error)
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!hasDb) {
    return NextResponse.json({ error: "Database not available in demo mode" }, { status: 400 })
  }

  try {
    const id = parseInt(params.id)
    
    await sql`DELETE FROM menu_items WHERE id = ${id}`
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 })
  }
}