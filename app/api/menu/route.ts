import { NextResponse } from "next/server"
import { sql, hasDb } from "@/lib/db"

// Demo menu items with rich data
const demoMenuItems = [
  {
    id: 1,
    name_uz: "Milano Special Pizza",
    name_ru: "Специальная пицца Милано",
    name_en: "Milano Special Pizza",
    description_uz: "Maxsus sous, mozzarella, pepperoni, qo'ziqorin va zaytun",
    description_ru: "Специальный соус, моцарелла, пепперони, грибы и оливки",
    description_en: "Special sauce, mozzarella, pepperoni, mushrooms and olives",
    price: 45000,
    category_id: 1,
    category_name_uz: "Pitsalar25cm",
    category_name_ru: "Пиццы25cm", 
    category_name_en: "Pizzas25cm",
    image_url: "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg",
    is_available: true,
    preparation_time: 15,
    calories: 320,
    ingredients_uz: "Un, pomidor sousi, mozzarella, pepperoni, qo'ziqorin, zaytun",
    ingredients_ru: "Мука, томатный соус, моцарелла, пепперони, грибы, оливки",
    ingredients_en: "Flour, tomato sauce, mozzarella, pepperoni, mushrooms, olives",
    rating: 4.8,
    reviews_count: 156
  },
  {
    id: 2,
    name_uz: "Margherita Pizza",
    name_ru: "Пицца Маргарита",
    name_en: "Margherita Pizza",
    description_uz: "Klassik italyan pitsasi - pomidor sousi, mozzarella va rayhon",
    description_ru: "Классическая итальянская пицца - томатный соус, моцарелла и базилик",
    description_en: "Classic Italian pizza - tomato sauce, mozzarella and basil",
    price: 35000,
    category_id: 1,
    category_name_uz: "Pitsalar25cm",
    category_name_ru: "Пиццы25cm",
    category_name_en: "Pizzas25cm",
    image_url: "https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg",
    is_available: true,
    preparation_time: 12,
    calories: 280,
    ingredients_uz: "Un, pomidor sousi, mozzarella, rayhon",
    ingredients_ru: "Мука, томатный соус, моцарелла, базилик",
    ingredients_en: "Flour, tomato sauce, mozzarella, basil",
    rating: 4.6,
    reviews_count: 89
  },
  {
    id: 3,
    name_uz: "Pepperoni Pizza 30cm",
    name_ru: "Пицца Пепперони 30см",
    name_en: "Pepperoni Pizza 30cm",
    description_uz: "Katta o'lchamdagi pepperoni pitsasi - ko'proq lazzat",
    description_ru: "Большая пицца пепперони - больше вкуса",
    description_en: "Large pepperoni pizza - more taste",
    price: 55000,
    category_id: 2,
    category_name_uz: "Pitsalar30cm",
    category_name_ru: "Пиццы30cm",
    category_name_en: "Pizzas30cm",
    image_url: "https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg",
    is_available: true,
    preparation_time: 18,
    calories: 420,
    ingredients_uz: "Un, pomidor sousi, mozzarella, pepperoni",
    ingredients_ru: "Мука, томатный соус, моцарелла, пепперони",
    ingredients_en: "Flour, tomato sauce, mozzarella, pepperoni",
    rating: 4.9,
    reviews_count: 234
  },
  {
    id: 4,
    name_uz: "Tovuqli Lavash",
    name_ru: "Лаваш с курицей",
    name_en: "Chicken Lavash",
    description_uz: "Yumshoq lavash ichida mazali tovuq go'shti va yangi sabzavotlar",
    description_ru: "Мягкий лаваш с вкусной курицей и свежими овощами",
    description_en: "Soft lavash with delicious chicken and fresh vegetables",
    price: 25000,
    category_id: 5,
    category_name_uz: "Lavash",
    category_name_ru: "Лаваш",
    category_name_en: "Lavash",
    image_url: "https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg",
    is_available: true,
    preparation_time: 8,
    calories: 380,
    ingredients_uz: "Lavash, tovuq go'shti, sabzavotlar, sous",
    ingredients_ru: "Лаваш, куриное мясо, овощи, соус",
    ingredients_en: "Lavash, chicken meat, vegetables, sauce",
    rating: 4.7,
    reviews_count: 167
  },
  {
    id: 5,
    name_uz: "Milano Burger",
    name_ru: "Бургер Милано",
    name_en: "Milano Burger",
    description_uz: "Maxsus Milano burger - mol go'shti, pishloq va maxsus sous",
    description_ru: "Специальный бургер Милано - говядина, сыр и специальный соус",
    description_en: "Special Milano burger - beef, cheese and special sauce",
    price: 32000,
    category_id: 6,
    category_name_uz: "Hotdog",
    category_name_ru: "Хот-дог",
    category_name_en: "Hot dog",
    image_url: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg",
    is_available: true,
    preparation_time: 10,
    calories: 450,
    ingredients_uz: "Burger noni, mol go'shti, pishloq, sabzavotlar, sous",
    ingredients_ru: "Булочка для бургера, говядина, сыр, овощи, соус",
    ingredients_en: "Burger bun, beef, cheese, vegetables, sauce",
    rating: 4.8,
    reviews_count: 198
  },
  {
    id: 6,
    name_uz: "Coca Cola",
    name_ru: "Кока Кола",
    name_en: "Coca Cola",
    description_uz: "Sovuq va tetiklantiruvchi ichimlik",
    description_ru: "Холодный и освежающий напиток",
    description_en: "Cold and refreshing drink",
    price: 8000,
    category_id: 4,
    category_name_uz: "Ichimlik",
    category_name_ru: "Напиток",
    category_name_en: "Drink",
    image_url: "https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg",
    is_available: true,
    preparation_time: 2,
    calories: 140,
    ingredients_uz: "Gazlangan suv, shakar, karamel rangi",
    ingredients_ru: "Газированная вода, сахар, карамельный краситель",
    ingredients_en: "Carbonated water, sugar, caramel color",
    rating: 4.5,
    reviews_count: 89
  },
  {
    id: 7,
    name_uz: "Mol go'shti Steak",
    name_ru: "Стейк из говядины",
    name_en: "Beef Steak",
    description_uz: "Yumshoq va mazali mol go'shti steyki, garnitur bilan",
    description_ru: "Мягкий и вкусный говяжий стейк с гарниром",
    description_en: "Tender and delicious beef steak with side dish",
    price: 65000,
    category_id: 7,
    category_name_uz: "Seteyk",
    category_name_ru: "Стейк",
    category_name_en: "Steak",
    image_url: "https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg",
    is_available: true,
    preparation_time: 25,
    calories: 520,
    ingredients_uz: "Mol go'shti, ziravorlar, garnitur",
    ingredients_ru: "Говядина, специи, гарнир",
    ingredients_en: "Beef, spices, side dish",
    rating: 4.9,
    reviews_count: 145
  },
  {
    id: 8,
    name_uz: "Tovuq sho'rva",
    name_ru: "Куриный суп",
    name_en: "Chicken Soup",
    description_uz: "An'anaviy tovuq sho'rvasi - issiq va to'yimli",
    description_ru: "Традиционный куриный суп - горячий и сытный",
    description_en: "Traditional chicken soup - hot and hearty",
    price: 18000,
    category_id: 8,
    category_name_uz: "Soup",
    category_name_ru: "Суп",
    category_name_en: "Soup",
    image_url: "https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg",
    is_available: true,
    preparation_time: 15,
    calories: 180,
    ingredients_uz: "Tovuq go'shti, sabzavotlar, ziravorlar",
    ingredients_ru: "Куриное мясо, овощи, специи",
    ingredients_en: "Chicken meat, vegetables, spices",
    rating: 4.6,
    reviews_count: 78
  }
]

export async function GET() {
  if (!hasDb) {
    console.log("🍽️ Fetching menu in DEMO mode, items count:", demoMenuItems.length)
    return NextResponse.json({ menuItems: demoMenuItems })
  }

  try {
    console.log("🍽️ Fetching menu from DATABASE")
    const menuItems = await sql`
      SELECT 
        m.*,
        c.name_uz as category_name_uz,
        c.name_ru as category_name_ru,
        c.name_en as category_name_en
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.is_available = true
      ORDER BY m.category_id, m.name_uz
    `

    const menuArray = Array.isArray(menuItems) ? menuItems : menuItems.rows || []
    console.log("✅ Fetched menu from database, items count:", menuArray.length)

    return NextResponse.json({ menuItems: menuArray })
  } catch (error) {
    console.error("❌ Error fetching menu:", error)
    // Fallback to demo menu if database fails
    return NextResponse.json({ menuItems: demoMenuItems })
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