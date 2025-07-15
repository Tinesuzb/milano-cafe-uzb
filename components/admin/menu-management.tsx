"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Eye, Star, Clock, Flame } from "lucide-react"

interface MenuItem {
  id: number
  name_uz: string
  name_ru: string
  name_en: string
  description_uz: string
  description_ru: string
  description_en: string
  price: number
  category_id: number
  category_name_uz: string
  image_url: string
  is_available: boolean
  preparation_time: number
  calories: number
  ingredients_uz: string
  ingredients_ru: string
  ingredients_en: string
  rating?: number
  reviews_count?: number
}

interface Category {
  id: number
  name_uz: string
  name_ru: string
  name_en: string
  items_count?: number
}

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name_uz: "",
    name_ru: "",
    name_en: "",
    description_uz: "",
    description_ru: "",
    description_en: "",
    price: 0,
    category_id: 0,
    image_url: "",
    is_available: true,
    preparation_time: 10,
    calories: 0,
    ingredients_uz: "",
    ingredients_ru: "",
    ingredients_en: ""
  })

  useEffect(() => {
    fetchMenuItems()
    fetchCategories()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/admin/menu")
      if (response.ok) {
        const data = await response.json()
        setMenuItems(data.menuItems || [])
      }
    } catch (error) {
      console.error("Error fetching menu items:", error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleCreate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({ title: "Muvaffaqiyat", description: "Menyu elementi qo'shildi" })
        fetchMenuItems()
        setIsCreateDialogOpen(false)
        resetForm()
      } else {
        throw new Error("Failed to create menu item")
      }
    } catch (error) {
      toast({ title: "Xatolik", description: "Menyu elementini qo'shishda xatolik", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedItem) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/menu/${selectedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({ title: "Muvaffaqiyat", description: "Menyu elementi yangilandi" })
        fetchMenuItems()
        setIsEditDialogOpen(false)
        resetForm()
      } else {
        throw new Error("Failed to update menu item")
      }
    } catch (error) {
      toast({ title: "Xatolik", description: "Menyu elementini yangilashda xatolik", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return

    try {
      const response = await fetch(`/api/admin/menu/${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast({ title: "Muvaffaqiyat", description: "Menyu elementi o'chirildi" })
        fetchMenuItems()
      } else {
        throw new Error("Failed to delete menu item")
      }
    } catch (error) {
      toast({ title: "Xatolik", description: "Menyu elementini o'chirishda xatolik", variant: "destructive" })
    }
  }

  const openEditDialog = (item: MenuItem) => {
    setSelectedItem(item)
    setFormData({
      name_uz: item.name_uz,
      name_ru: item.name_ru,
      name_en: item.name_en,
      description_uz: item.description_uz,
      description_ru: item.description_ru,
      description_en: item.description_en,
      price: item.price,
      category_id: item.category_id,
      image_url: item.image_url,
      is_available: item.is_available,
      preparation_time: item.preparation_time,
      calories: item.calories,
      ingredients_uz: item.ingredients_uz,
      ingredients_ru: item.ingredients_ru,
      ingredients_en: item.ingredients_en
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name_uz: "",
      name_ru: "",
      name_en: "",
      description_uz: "",
      description_ru: "",
      description_en: "",
      price: 0,
      category_id: 0,
      image_url: "",
      is_available: true,
      preparation_time: 10,
      calories: 0,
      ingredients_uz: "",
      ingredients_ru: "",
      ingredients_en: ""
    })
    setSelectedItem(null)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm"
  }

  const filteredItems = selectedCategory 
    ? menuItems.filter(item => item.category_id === selectedCategory)
    : menuItems

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">🍽️ Menyu boshqaruvi</h2>
          <p className="text-gray-600">Menyu elementlarini boshqaring</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Yangi element
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className={selectedCategory === null ? "bg-orange-600 hover:bg-orange-700" : ""}
        >
          Barchasi ({menuItems.length})
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className={selectedCategory === category.id ? "bg-orange-600 hover:bg-orange-700" : ""}
          >
            {category.name_uz} ({category.items_count || 0})
          </Button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={item.image_url || "/placeholder.svg?height=200&width=300"}
                  alt={item.name_uz}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  {item.rating && (
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      {item.rating}
                    </Badge>
                  )}
                  <Badge className={item.is_available ? "bg-green-500" : "bg-red-500"}>
                    {item.is_available ? "Mavjud" : "Mavjud emas"}
                  </Badge>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-3">
                  <h3 className="font-bold text-lg mb-1">{item.name_uz}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{item.description_uz}</p>
                  <p className="text-sm text-gray-500 mt-1">{item.category_name_uz}</p>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="text-xl font-bold text-orange-600">{formatPrice(item.price)}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {item.preparation_time} min
                    <Flame className="h-4 w-4" />
                    {item.calories} kcal
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(item)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Tahrirlash
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3 mr-1" />
                    O'chirish
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🆕 Yangi menyu elementi</DialogTitle>
          </DialogHeader>
          <MenuItemForm
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            onSubmit={handleCreate}
            isLoading={isLoading}
            submitText="Qo'shish"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>✏️ Menyu elementini tahrirlash</DialogTitle>
          </DialogHeader>
          <MenuItemForm
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            onSubmit={handleUpdate}
            isLoading={isLoading}
            submitText="Yangilash"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MenuItemForm({ formData, setFormData, categories, onSubmit, isLoading, submitText }: any) {
  return (
    <Tabs defaultValue="basic" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Asosiy ma'lumotlar</TabsTrigger>
        <TabsTrigger value="details">Tafsilotlar</TabsTrigger>
        <TabsTrigger value="ingredients">Tarkib</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Nomi (O'zbek)</Label>
            <Input
              value={formData.name_uz}
              onChange={(e) => setFormData({ ...formData, name_uz: e.target.value })}
              placeholder="Masalan: Milano Pizza"
            />
          </div>
          <div>
            <Label>Nomi (Rus)</Label>
            <Input
              value={formData.name_ru}
              onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
              placeholder="Например: Пицца Милано"
            />
          </div>
          <div>
            <Label>Nomi (Ingliz)</Label>
            <Input
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              placeholder="Example: Milano Pizza"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Tavsifi (O'zbek)</Label>
            <Textarea
              value={formData.description_uz}
              onChange={(e) => setFormData({ ...formData, description_uz: e.target.value })}
              placeholder="Mahsulot haqida qisqacha..."
            />
          </div>
          <div>
            <Label>Tavsifi (Rus)</Label>
            <Textarea
              value={formData.description_ru}
              onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
              placeholder="Краткое описание продукта..."
            />
          </div>
          <div>
            <Label>Tavsifi (Ingliz)</Label>
            <Textarea
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              placeholder="Brief product description..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Kategoriya</Label>
            <Select value={formData.category_id.toString()} onValueChange={(value) => setFormData({ ...formData, category_id: parseInt(value) })}>
              <SelectTrigger>
                <SelectValue placeholder="Kategoriyani tanlang" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category: Category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name_uz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Rasm URL</Label>
            <Input
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="details" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Narxi (so'm)</Label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
              placeholder="25000"
            />
          </div>
          <div>
            <Label>Tayyorlash vaqti (daqiqa)</Label>
            <Input
              type="number"
              value={formData.preparation_time}
              onChange={(e) => setFormData({ ...formData, preparation_time: parseInt(e.target.value) || 0 })}
              placeholder="15"
            />
          </div>
          <div>
            <Label>Kaloriya</Label>
            <Input
              type="number"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
              placeholder="320"
            />
          </div>
        </div>

        <div>
          <Label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
            />
            <span>Mavjud</span>
          </Label>
        </div>
      </TabsContent>

      <TabsContent value="ingredients" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Tarkib (O'zbek)</Label>
            <Textarea
              value={formData.ingredients_uz}
              onChange={(e) => setFormData({ ...formData, ingredients_uz: e.target.value })}
              placeholder="Un, pomidor sousi, mozzarella..."
            />
          </div>
          <div>
            <Label>Tarkib (Rus)</Label>
            <Textarea
              value={formData.ingredients_ru}
              onChange={(e) => setFormData({ ...formData, ingredients_ru: e.target.value })}
              placeholder="Мука, томатный соус, моцарелла..."
            />
          </div>
          <div>
            <Label>Tarkib (Ingliz)</Label>
            <Textarea
              value={formData.ingredients_en}
              onChange={(e) => setFormData({ ...formData, ingredients_en: e.target.value })}
              placeholder="Flour, tomato sauce, mozzarella..."
            />
          </div>
        </div>
      </TabsContent>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={() => {}}>
          Bekor qilish
        </Button>
        <Button onClick={onSubmit} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
          {isLoading ? "Saqlanmoqda..." : submitText}
        </Button>
      </div>
    </Tabs>
  )
}