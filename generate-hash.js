// Script لإنشاء hash صحيح لكلمة المرور
const crypto = require('crypto');

const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
const password = '123456';

function hashPassword(password) {
  const inputString = password + JWT_SECRET;
  console.log('Input string for hashing:', inputString);
  
  const hash = crypto.createHash('sha256').update(inputString).digest('hex');
  console.log('Generated hash:', hash);
  
  return hash;
}

console.log('Password:', password);
console.log('JWT_SECRET:', JWT_SECRET);
const hash = hashPassword(password);

console.log('\n=== SQL للإدراج ===');
console.log(`INSERT INTO users (username, phone_number, password_hash, full_name, is_active, created_at, updated_at)
VALUES (
  'testuser',
  '0550123456',
  '${hash}',
  'مستخدم تجريبي',
  true,
  NOW(),
  NOW()
) ON CONFLICT (username) DO UPDATE SET
  password_hash = '${hash}',
  updated_at = NOW();`);
