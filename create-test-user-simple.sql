-- إنشاء مستخدم تجريبي بكلمة المرور الحقيقية (بدون تشفير)
INSERT INTO users (username, phone_number, password_hash, full_name, is_active, created_at, updated_at)
VALUES (
  'testuser',
  '0550123456',
  '123456',
  'مستخدم تجريبي',
  true,
  NOW(),
  NOW()
) ON CONFLICT (username) DO UPDATE SET
  password_hash = '123456',
  updated_at = NOW();

-- التحقق من إنشاء المستخدم
SELECT id, username, full_name, phone_number, password_hash, is_active, created_at 
FROM users 
WHERE username = 'testuser';
