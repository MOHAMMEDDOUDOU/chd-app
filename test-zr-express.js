const { ZRExpressAPI } = require('./lib/zr-express-api.js');

async function testZRExpress() {
  console.log('🧪 بدء اختبار ZR Express API...');
  
  try {
    // اختبار الاتصال
    console.log('📡 اختبار الاتصال...');
    const connectionTest = await ZRExpressAPI.testConnection();
    console.log('🔗 نتيجة اختبار الاتصال:', connectionTest);
    
    // اختبار إنشاء طلبية
    console.log('📦 اختبار إنشاء طلبية...');
    const orderData = {
      customer_name: "اختبار",
      phone_number: "0770000000",
      address: "عنوان اختبار",
      wilaya: "الجزائر",
      commune: "الحراش",
      product_name: "منتج اختبار",
      total_amount: 1000,
      quantity: 1,
      delivery_type: "home",
      order_number: "TEST001",
      notes: "طلبية اختبار"
    };
    
    const result = await ZRExpressAPI.createOrder(orderData);
    console.log('📡 نتيجة إنشاء الطلبية:', result);
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

testZRExpress();
