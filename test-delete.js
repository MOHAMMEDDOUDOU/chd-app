const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { eq } = require('drizzle-orm');

// Database connection
const databaseUrl = "postgresql://neondb_owner:npg_lWDH8R6uOiFN@ep-aged-water-a2koqhuu-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const db = drizzle(neon(databaseUrl));

// Test delete function
async function testDeleteProduct() {
  try {
    console.log('🔍 جاري البحث عن منتج للاختبار...');
    
    // أولاً، دعنا نجد منتج موجود
    const products = await db.query.products.findMany({
      limit: 1
    });
    
    if (products.length === 0) {
      console.log('❌ لا توجد منتجات في قاعدة البيانات');
      return;
    }
    
    const testProduct = products[0];
    console.log('📦 المنتج المختار:', {
      id: testProduct.id,
      name: testProduct.name
    });
    
    // اختبار الحذف
    console.log('🗑️ جاري حذف المنتج...');
    const result = await db.delete(db.products)
      .where(eq(db.products.id, testProduct.id))
      .returning();
    
    console.log('📥 نتيجة الحذف:', result);
    
    if (result.length > 0) {
      console.log('✅ تم حذف المنتج بنجاح!');
      console.log('المنتج المحذوف:', result[0]);
    } else {
      console.log('❌ لم يتم حذف أي منتج');
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

// تشغيل الاختبار
testDeleteProduct();
