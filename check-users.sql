-- التحقق من جميع المستخدمين
SELECT id, username, full_name, phone_number, is_active, created_at, 
       LEFT(password_hash, 20) as password_hash_preview
FROM users 
ORDER BY created_at DESC;

-- التحقق من المستخدم التجريبي تحديداً
SELECT id, username, full_name, phone_number, is_active, created_at, 
       password_hash
FROM users 
WHERE username = 'testuser';

-- عدد المستخدمين الكلي
SELECT COUNT(*) as total_users FROM users;
