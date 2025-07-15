"use client"

import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { MenuManagement } from "@/components/admin/menu-management"
import { 
  ShoppingBag, Users, Eye, Check, Clock, ChefHat, Truck, CheckCircle, RefreshCw,
  Settings, BarChart3, MessageSquare, Star, TrendingUp, DollarSign
} from "lucide-react"

interface Order {
  id: number
  user_name?: string
  user_email?: string
  total_amount: number
  status: string
  delivery_address: string
  phone: string
  created_at: string
  items: any[]
}

interface User {
  id: number
  name: string
  email: string
  phone?: string
  created_at: string
}

interface ContactMessage {
  id: number
  name: string
  email: string
  subject: string
  message: string
  phone?: string
  status: string
  created_at: string
}

export default function EnhancedAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [orderTab, setOrderTab] = useState("pending")
  const { toast } = useToast()
  const { t } = useLanguage()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const ADMIN_PASSWORD = "admin123"

  useEffect(() => {
    // Audio ob'ektini yaratish
    audioRef.current = new Audio("/notification.mp3")
    audioRef.current.preload = "auto"

    if (isAuthenticated) {
      fetchAllData()
      // Auto-refresh har 30 soniyada
      const interval = setInterval(() => {
        fetchAllData()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      toast({
        title: t("success"),
        description: "🎉 Kuchli admin paneliga xush kelibsiz!",
      })
    } else {
      toast({
        title: t("error"),
        description: "Noto'g'ri parol",
        variant: "destructive",
      })
    }
  }

  const fetchAllData = async () => {
    await Promise.all([
      fetchOrders(),
      fetchUsers(),
      fetchContactMessages()
    ])
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        const newOrders = data.orders || []

        // Yangi buyurtmalarni aniqlash
        const currentOrderIds = new Set(orders.map((order) => order.id))
        const newOrderIds = newOrders.filter((order: Order) => !currentOrderIds.has(order.id))

        if (newOrderIds.length > 0 && orders.length > 0) {
          // Yangi buyurtma kelganda ringtone o'ynash
          if (audioRef.current) {
            audioRef.current.play().catch((error) => console.error("Ringtone oynatishda xato:", error))
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
              }
            }, 5000)
          }
          
          toast({
            title: "🔔 Yangi buyurtma!",
            description: `${newOrderIds.length} ta yangi buyurtma keldi`,
          })
        }

        setOrders(newOrders)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchContactMessages = async () => {
    try {
      const response = await fetch("/api/contact")
      if (response.ok) {
        const data = await response.json()
        setContactMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Error fetching contact messages:", error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchAllData()
    setIsRefreshing(false)
    toast({
      title: "✅ Yangilandi",
      description: "Barcha ma'lumotlar yangilandi",
    })
  }

  const updateOrderStatus = async (orderId: number, status: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: t("success"),
          description: `Buyurtma holati ${getStatusText(status)} ga o'zgartirildi`,
        })
        setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, status } : order)))
        fetchOrders()
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: "Buyurtma holatini o'zgartirishda xatolik",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200"
      case "preparing": return "bg-orange-100 text-orange-800 border-orange-200"
      case "ready": return "bg-green-100 text-green-800 border-green-200"
      case "delivered": return "bg-gray-100 text-gray-800 border-gray-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Yangi buyurtma"
      case "confirmed": return "Tasdiqlandi"
      case "preparing": return "Tayyorlanmoqda"
      case "ready": return "Tayyor"
      case "delivered": return "Yetkazildi"
      default: return status
    }
  }

  const filterOrdersByStatus = (status: string) => {
    switch (status) {
      case "pending": return orders.filter((order) => order.status === "pending")
      case "active": return orders.filter((order) => ["confirmed", "preparing", "ready"].includes(order.status))
      case "completed": return orders.filter((order) => order.status === "delivered")
      default: return orders
    }
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending": return "confirmed"
      case "confirmed": return "preparing"
      case "preparing": return "ready"
      case "ready": return "delivered"
      default: return null
    }
  }

  const getNextStatusText = (currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus)
    return nextStatus ? getStatusText(nextStatus) : null
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <Card className="w-full max-w-md shadow-2xl border-0">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center mb-4">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                🚀 Kuchli Admin Panel
              </CardTitle>
              <p className="text-gray-600">Professional boshqaruv tizimi</p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <Label htmlFor="password" className="text-sm font-medium">Admin Parol</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="admin123"
                  className="mt-2 h-12"
                />
              </div>
              <Button 
                onClick={handleLogin} 
                className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                🔐 Kirish
              </Button>
              <div className="text-center">
                <p className="text-sm text-gray-500">Demo parol: <code className="bg-gray-100 px-2 py-1 rounded">admin123</code></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const pendingOrders = filterOrdersByStatus("pending")
  const activeOrders = filterOrdersByStatus("active")
  const completedOrders = filterOrdersByStatus("completed")

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              🚀 Kuchli Admin Dashboard
            </h1>
            <p className="text-gray-600">Milano Cafe professional boshqaruv tizimi</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="flex items-center space-x-2 hover:bg-orange-50 border-orange-200"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Yangilash</span>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-12">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Buyurtmalar</span>
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center space-x-2">
              <ChefHat className="h-4 w-4" />
              <span className="hidden sm:inline">Menyu</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Foydalanuvchilar</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Xabarlar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardStats />
          </TabsContent>

          <TabsContent value="orders">
            <Tabs value={orderTab} onValueChange={setOrderTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending" className="text-xs md:text-sm">
                  🆕 Yangi ({pendingOrders.length})
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs md:text-sm">
                  🔄 Faol ({activeOrders.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-xs md:text-sm">
                  ✅ Yakunlangan ({completedOrders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span>Yangi buyurtmalar</span>
                      {pendingOrders.length > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-800">{pendingOrders.length}</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrdersList
                      orders={pendingOrders}
                      onUpdateStatus={updateOrderStatus}
                      onViewOrder={setSelectedOrder}
                      isLoading={isLoading}
                      formatPrice={formatPrice}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                      getNextStatusText={getNextStatusText}
                      getNextStatus={getNextStatus}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="active">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ChefHat className="h-5 w-5 text-orange-600" />
                      <span>Faol buyurtmalar</span>
                      {activeOrders.length > 0 && (
                        <Badge className="bg-orange-100 text-orange-800">{activeOrders.length}</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrdersList
                      orders={activeOrders}
                      onUpdateStatus={updateOrderStatus}
                      onViewOrder={setSelectedOrder}
                      isLoading={isLoading}
                      formatPrice={formatPrice}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                      getNextStatusText={getNextStatusText}
                      getNextStatus={getNextStatus}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="completed">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Yakunlangan buyurtmalar</span>
                      {completedOrders.length > 0 && (
                        <Badge className="bg-green-100 text-green-800">{completedOrders.length}</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrdersList
                      orders={completedOrders}
                      onUpdateStatus={updateOrderStatus}
                      onViewOrder={setSelectedOrder}
                      isLoading={isLoading}
                      formatPrice={formatPrice}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                      getNextStatusText={getNextStatusText}
                      getNextStatus={getNextStatus}
                      showActions={false}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="menu">
            <MenuManagement />
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Ro'yxatdan o'tgan foydalanuvchilar</span>
                  {users.length > 0 && <Badge className="bg-blue-100 text-blue-800">{users.length}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Hali foydalanuvchilar yo'q</p>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                {user.phone && <p className="text-sm text-gray-600">📞 {user.phone}</p>}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              📅 {new Date(user.created_at).toLocaleDateString("uz-UZ", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Aloqa xabarlari</span>
                  {contactMessages.length > 0 && <Badge className="bg-purple-100 text-purple-800">{contactMessages.length}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Hali xabarlar yo'q</p>
                    </div>
                  ) : (
                    contactMessages.map((message) => (
                      <div key={message.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900">{message.name}</p>
                              <p className="text-sm text-gray-600">{message.email}</p>
                              {message.phone && <p className="text-sm text-gray-600">📞 {message.phone}</p>}
                            </div>
                            <Badge className={message.status === 'new' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {message.status === 'new' ? 'Yangi' : 'Ko\'rilgan'}
                            </Badge>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{message.subject}</p>
                            <p className="text-gray-600 mt-1">{message.message}</p>
                          </div>
                          <div className="text-sm text-gray-500">
                            📅 {new Date(message.created_at).toLocaleString("uz-UZ")}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📋 Buyurtma tafsilotlari #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>👤 Mijoz</Label>
                  <p className="font-semibold">{selectedOrder.user_name || "Mehmon"}</p>
                </div>
                <div>
                  <Label>📞 Telefon</Label>
                  <p className="font-semibold">{selectedOrder.phone}</p>
                </div>
                <div>
                  <Label>📊 Holat</Label>
                  <Badge className={getStatusColor(selectedOrder.status)}>{getStatusText(selectedOrder.status)}</Badge>
                </div>
                <div>
                  <Label>💰 Jami summa</Label>
                  <p className="font-semibold text-orange-600">{formatPrice(selectedOrder.total_amount)}</p>
                </div>
              </div>
              <div>
                <Label>📍 Yetkazish manzili</Label>
                <p className="font-semibold">{selectedOrder.delivery_address}</p>
              </div>
              <div>
                <Label>🍽️ Buyurtma tarkibi</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <span>{item.name || `Mahsulot ${item.menu_item_id}`}</span>
                      <span className="font-semibold">
                        {item.quantity}x {formatPrice(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                📅 Buyurtma vaqti: {new Date(selectedOrder.created_at).toLocaleString("uz-UZ")}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Orders List Component
function OrdersList({
  orders,
  onUpdateStatus,
  onViewOrder,
  isLoading,
  formatPrice,
  getStatusColor,
  getStatusText,
  getNextStatusText,
  getNextStatus,
  showActions = true,
}: {
  orders: Order[]
  onUpdateStatus: (id: number, status: string) => void
  onViewOrder: (order: Order) => void
  isLoading: boolean
  formatPrice: (price: number) => string
  getStatusColor: (status: string) => string
  getStatusText: (status: string) => string
  getNextStatusText: (status: string) => string | null
  getNextStatus: (status: string) => string | null
  showActions?: boolean
}) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Bu bo'limda buyurtmalar yo'q</p>
        <p className="text-sm text-gray-500 mt-2">Yangi buyurtmalar kelganda bu yerda ko'rinadi</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <p className="font-semibold">📋 Buyurtma #{order.id}</p>
                  <p className="text-sm text-gray-600">
                    👤 {order.user_name || "Mehmon"} - 📞 {order.phone}
                  </p>
                  <p className="text-sm text-gray-600 truncate">📍 {order.delivery_address}</p>
                  <p className="text-xs text-gray-500">📅 {new Date(order.created_at).toLocaleString("uz-UZ")}</p>
                </div>
                <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="text-right">
                <p className="font-bold text-orange-600">{formatPrice(order.total_amount)}</p>
              </div>
              {showActions && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewOrder(order)}
                    className="bg-blue-50 hover:bg-blue-100 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ko'rish
                  </Button>
                  {getNextStatus(order.status) && (
                    <Button
                      size="sm"
                      onClick={() => onUpdateStatus(order.id, getNextStatus(order.status)!)}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      {getNextStatusText(order.status)}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}