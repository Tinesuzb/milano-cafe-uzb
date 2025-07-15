-- Milano Cafe Database Schema
-- Kuchli va professional database tuzilishi

-- Users table - Foydalanuvchilar
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table - Kategoriyalar
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name_uz VARCHAR(255) NOT NULL,
  name_ru VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  description_uz TEXT,
  description_ru TEXT,
  description_en TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu items table - Menyu elementlari
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  name_uz VARCHAR(255) NOT NULL,
  name_ru VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  description_uz TEXT,
  description_ru TEXT,
  description_en TEXT,
  ingredients_uz TEXT,
  ingredients_ru TEXT,
  ingredients_en TEXT,
  price INTEGER NOT NULL, -- so'mda
  image_url TEXT,
  preparation_time INTEGER DEFAULT 10, -- daqiqalarda
  calories INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table - Buyurtmalar
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  total_amount INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, preparing, ready, delivered, cancelled
  delivery_address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20) NOT NULL,
  notes TEXT,
  payment_method VARCHAR(50) DEFAULT 'cash', -- cash, card, click, payme
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed
  delivery_fee INTEGER DEFAULT 0,
  estimated_delivery_time INTEGER, -- daqiqalarda
  actual_delivery_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table - Buyurtma elementlari
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price INTEGER NOT NULL, -- buyurtma vaqtidagi narx
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table - Sharhlar
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, menu_item_id, order_id)
);

-- Contact messages table - Aloqa xabarlari
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(500),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new', -- new, read, replied, closed
  admin_reply TEXT,
  replied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Promotions table - Aksiyalar
CREATE TABLE IF NOT EXISTS promotions (
  id SERIAL PRIMARY KEY,
  title_uz VARCHAR(255) NOT NULL,
  title_ru VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  description_uz TEXT,
  description_ru TEXT,
  description_en TEXT,
  discount_type VARCHAR(50) NOT NULL, -- percentage, fixed_amount, buy_one_get_one
  discount_value INTEGER NOT NULL,
  min_order_amount INTEGER DEFAULT 0,
  max_discount_amount INTEGER,
  promo_code VARCHAR(50) UNIQUE,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User promotions table - Foydalanuvchi aksiyalari
CREATE TABLE IF NOT EXISTS user_promotions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  promotion_id INTEGER REFERENCES promotions(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, promotion_id)
);

-- Favorites table - Sevimlilar
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, menu_item_id)
);

-- Admin logs table - Admin loglari
CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  admin_email VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  table_name VARCHAR(100),
  record_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table - Bildirishnomalar
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- info, success, warning, error
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table - Sozlamalar
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_reviews_menu_item_id ON reviews(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Insert default categories
INSERT INTO categories (name_uz, name_ru, name_en, description_uz, description_ru, description_en) VALUES
('Pitsalar25cm', 'Пиццы25cm', 'Pizzas25cm', 'Kichik o''lchamdagi mazali pitsalar', 'Маленькие вкусные пиццы', 'Small delicious pizzas'),
('Pitsalar30cm', 'Пиццы30cm', 'Pizzas30cm', 'O''rta o''lchamdagi pitsalar', 'Средние пиццы', 'Medium pizzas'),
('Pitsalar35cm', 'Пиццы35cm', 'Pizzas35cm', 'Katta o''lchamdagi pitsalar', 'Большие пиццы', 'Large pizzas'),
('Ichimlik', 'Напиток', 'Drink', 'Sovuq va issiq ichimliklar', 'Холодные и горячие напитки', 'Cold and hot drinks'),
('Lavash', 'Лаваш', 'Lavash', 'Turli xil lavashlar', 'Различные лаваши', 'Various lavash'),
('Hotdog', 'Хот-дог', 'Hot dog', 'Hotdog va burgerlar', 'Хот-доги и бургеры', 'Hot dogs and burgers'),
('Seteyk', 'Стейк', 'Steak', 'Go''sht taomlari', 'Мясные блюда', 'Meat dishes'),
('Soup', 'Суп', 'Soup', 'Issiq sho''rvalar', 'Горячие супы', 'Hot soups')
ON CONFLICT DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value, description, type, is_public) VALUES
('restaurant_name', 'Milano Cafe', 'Restoran nomi', 'string', true),
('restaurant_phone', '+998 77 183 99 99', 'Restoran telefon raqami', 'string', true),
('restaurant_email', 'milano.kafe.zomin@gmail.com', 'Restoran email manzili', 'string', true),
('restaurant_address', 'Jizzah viloyati, Zomin tumani, Buyuk Ipak Yoli 26 uy', 'Restoran manzili', 'string', true),
('delivery_fee', '5000', 'Yetkazish narxi', 'number', true),
('min_order_amount', '20000', 'Minimal buyurtma summasi', 'number', true),
('working_hours', '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}', 'Ish vaqti', 'json', true),
('currency', 'UZS', 'Valyuta', 'string', true),
('tax_rate', '0', 'Soliq foizi', 'number', false),
('notification_sound', 'true', 'Bildirishnoma ovozi', 'boolean', false)
ON CONFLICT (key) DO NOTHING;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();