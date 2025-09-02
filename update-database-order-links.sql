-- تحديث قاعدة البيانات لإضافة حقول رابط الطلبية ومعلومات البائع
-- تشغيل هذا الملف لتحديث جدول الطلبيات

-- إضافة حقل رابط الطلبية
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_link VARCHAR(500);

-- إضافة حقل معرف البائع
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES users(id);

-- إضافة حقل اسم البائع
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_name VARCHAR(255);

-- إضافة حقل صورة المنتج
ALTER TABLE orders ADD COLUMN IF NOT EXISTS image_url TEXT;

-- إنشاء فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_orders_order_link ON orders(order_link);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);

-- تعليق توضيحي
COMMENT ON COLUMN orders.order_link IS 'رابط ويب للطلبية يمكن مشاركته مع العملاء';
COMMENT ON COLUMN orders.seller_id IS 'معرف البائع الذي أنشأ الطلبية';
COMMENT ON COLUMN orders.seller_name IS 'اسم البائع الذي أنشأ الطلبية';

-- عرض النتائج
SELECT 'تم تحديث جدول الطلبيات بنجاح!' AS message;
