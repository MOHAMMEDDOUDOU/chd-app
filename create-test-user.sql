-- إنشاء مستخدم تجريبي للاختبار
-- كلمة المرور: 123456 (مشفرة بـ SHA256)

INSERT INTO users (username, phone_number, password_hash, full_name, is_active, created_at, updated_at)
VALUES (
  'testuser',
  '0550123456',
  '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', -- 123456 + JWT_SECRET
  'مستخدم تجريبي',
  true,
  NOW(),
  NOW()
) ON CONFLICT (username) DO NOTHING;

-- التحقق من إنشاء المستخدم
SELECT id, username, full_name, phone_number, is_active, created_at 
FROM users 
WHERE username = 'testuser';
