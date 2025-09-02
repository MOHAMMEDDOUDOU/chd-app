-- إعداد قاعدة البيانات لـ taziri
-- تشغيل هذا الملف في SQL Editor في Neon Tech

-- تفعيل الإضافات المطلوبة
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- إنشاء الدالة لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الجلسات
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    discount_percentage INTEGER,
    image_url TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    sizes JSONB,
    images JSONB,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول العروض
CREATE TABLE IF NOT EXISTS offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    image_url TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    sizes JSONB,
    images JSONB,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الطلبات
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_type VARCHAR(20) NOT NULL DEFAULT 'product',
    item_id UUID NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    wilaya VARCHAR(100) NOT NULL,
    commune VARCHAR(100),
    delivery_type VARCHAR(20) NOT NULL DEFAULT 'home',
    status VARCHAR(50) NOT NULL DEFAULT 'قيد المعالجة',
    reseller_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول محاولات تسجيل الدخول
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT false
);

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

CREATE INDEX IF NOT EXISTS idx_offers_category ON offers(category);
CREATE INDEX IF NOT EXISTS idx_offers_price ON offers(price);
CREATE INDEX IF NOT EXISTS idx_offers_created_at ON offers(created_at);

CREATE INDEX IF NOT EXISTS idx_orders_item ON orders(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE INDEX IF NOT EXISTS idx_login_attempts_username ON login_attempts(username);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts(attempted_at);

-- إنشاء Triggers
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at 
    BEFORE UPDATE ON offers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- دالة تنظيف الجلسات المنتهية
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- إضافة بيانات تجريبية للمنتجات
INSERT INTO products (name, description, price, discount_price, discount_percentage, image_url, stock_quantity, category) VALUES
('آيفون 15 برو ماكس', 'أحدث هواتف آبل مع كاميرا متطورة', 1499.00, 1299.00, 13, 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg', 50, 'إلكترونيات'),
('سماعات AirPods Pro', 'سماعات لاسلكية عالية الجودة', 299.00, 249.00, 17, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', 100, 'إلكترونيات'),
('ساعة Apple Watch Series 9', 'ساعة ذكية متطورة', 449.00, 399.00, 11, 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg', 30, 'إلكترونيات'),
('حقيبة لويس فيتون', 'حقيبة فاخرة من الجلد الطبيعي', 2199.00, 1899.00, 14, 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg', 20, 'أزياء'),
('لابتوب MacBook Pro', 'حاسوب محمول للمحترفين', 2499.00, 2249.00, 10, 'https://images.pexels.com/photos/18105/pexels-photo.jpg', 25, 'إلكترونيات'),
('طابعة HP LaserJet', 'طابعة ليزر عالية السرعة', 199.00, 179.00, 10, 'https://images.pexels.com/photos/3807755/pexels-photo-3807755.jpeg', 40, 'إلكترونيات');

-- إضافة بيانات تجريبية للعروض
INSERT INTO offers (name, description, price, discount_price, image_url, stock_quantity, category) VALUES
('عرض خاص - مجموعة أجهزة', 'مجموعة كاملة من الأجهزة الإلكترونية', 999.00, 799.00, 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg', 15, 'إلكترونيات'),
('عرض الأزياء', 'مجموعة ملابس أنيقة بأسعار مخفضة', 299.00, 199.00, 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg', 30, 'أزياء');

COMMIT;
