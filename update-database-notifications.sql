-- إضافة جداول الإشعارات وإعدادات المستخدم
-- تشغيل هذا الملف في SQL Editor في Neon Tech

-- إنشاء جدول إعدادات المستخدم
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لجدول إعدادات المستخدم
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_notifications ON user_settings(notifications_enabled);

-- إنشاء جدول الإشعارات
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'order', 'news', 'offer'
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لجدول الإشعارات
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- إنشاء دالة لتحديث updated_at في جدول إعدادات المستخدم
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_user_settings_updated_at_trigger
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_settings_updated_at();

-- إضافة بيانات تجريبية للإشعارات (اختياري)
-- INSERT INTO notifications (user_id, title, message, type) VALUES 
-- ('user-id-here', 'مرحباً بك', 'مرحباً بك في تطبيق taziri', 'news');

-- عرض الجداول المنشأة
SELECT 'user_settings' as table_name, COUNT(*) as row_count FROM user_settings
UNION ALL
SELECT 'notifications' as table_name, COUNT(*) as row_count FROM notifications;
