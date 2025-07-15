import { NextResponse } from "next/server"
import { sql, hasDb } from "@/lib/db"

// Demo stats for when database is not available
const demoStats = {
  totalOrders: 156,
  totalRevenue: 12450000,
  totalUsers: 89,
  totalMenuItems: 24,
  todayOrders: 12,
  todayRevenue: 890000,
  pendingOrders: 3,
  completedOrders: 145,
  popularItems: [
    { name: "Milano Special Pizza", orders: 45, revenue: 2025000 },
    { name: "Pepperoni Pizza", orders: 38, revenue: 2090000 },
    { name: "Milano Burger", orders: 32, revenue: 1024000 }
  ],
  recentOrders: [
    { id: 1, customer: "Akmal Karimov", total: 45000, status: "pending" },
    { id: 2, customer: "Dilnoza Saidova", total: 32000, status: "confirmed" },
    { id: 3, customer: "Bobur Toshev", total: 67000, status: "preparing" }
  ],
  monthlyRevenue: [
    { month: "Yanvar", revenue: 2100000 },
    { month: "Fevral", revenue: 2350000 },
    { month: "Mart", revenue: 2800000 },
    { month: "Aprel", revenue: 3200000 },
    { month: "May", revenue: 2900000 },
    { month: "Iyun", revenue: 3100000 }
  ]
}

export async function GET() {
  if (!hasDb) {
    console.log("📊 Fetching stats in DEMO mode")
    return NextResponse.json({ stats: demoStats })
  }

  try {
    console.log("📊 Fetching stats from DATABASE")
    
    // Total orders and revenue
    const orderStats = await sql`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_orders,
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN total_amount ELSE 0 END), 0) as today_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_orders
      FROM orders
    `

    // Total users
    const userStats = await sql`SELECT COUNT(*) as total_users FROM users`

    // Total menu items
    const menuStats = await sql`SELECT COUNT(*) as total_menu_items FROM menu_items WHERE is_available = true`

    // Popular items
    const popularItems = await sql`
      SELECT 
        m.name_uz as name,
        COUNT(oi.id) as orders,
        SUM(oi.price * oi.quantity) as revenue
      FROM order_items oi
      JOIN menu_items m ON oi.menu_item_id = m.id
      GROUP BY m.id, m.name_uz
      ORDER BY orders DESC
      LIMIT 5
    `

    // Recent orders
    const recentOrders = await sql`
      SELECT 
        o.id,
        COALESCE(u.name, 'Mehmon') as customer,
        o.total_amount as total,
        o.status
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `

    // Monthly revenue (last 6 months)
    const monthlyRevenue = await sql`
      SELECT 
        TO_CHAR(created_at, 'Month') as month,
        SUM(total_amount) as revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(created_at, 'Month')
      ORDER BY DATE_TRUNC('month', created_at)
    `

    const orderStatsRow = Array.isArray(orderStats) ? orderStats[0] : orderStats.rows?.[0]
    const userStatsRow = Array.isArray(userStats) ? userStats[0] : userStats.rows?.[0]
    const menuStatsRow = Array.isArray(menuStats) ? menuStats[0] : menuStats.rows?.[0]
    const popularItemsArray = Array.isArray(popularItems) ? popularItems : popularItems.rows || []
    const recentOrdersArray = Array.isArray(recentOrders) ? recentOrders : recentOrders.rows || []
    const monthlyRevenueArray = Array.isArray(monthlyRevenue) ? monthlyRevenue : monthlyRevenue.rows || []

    const stats = {
      totalOrders: parseInt(orderStatsRow?.total_orders || 0),
      totalRevenue: parseInt(orderStatsRow?.total_revenue || 0),
      totalUsers: parseInt(userStatsRow?.total_users || 0),
      totalMenuItems: parseInt(menuStatsRow?.total_menu_items || 0),
      todayOrders: parseInt(orderStatsRow?.today_orders || 0),
      todayRevenue: parseInt(orderStatsRow?.today_revenue || 0),
      pendingOrders: parseInt(orderStatsRow?.pending_orders || 0),
      completedOrders: parseInt(orderStatsRow?.completed_orders || 0),
      popularItems: popularItemsArray,
      recentOrders: recentOrdersArray,
      monthlyRevenue: monthlyRevenueArray
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("❌ Error fetching stats:", error)
    // Fallback to demo stats if database fails
    return NextResponse.json({ stats: demoStats })
  }
}