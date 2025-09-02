// اختبار بسيط لحذف منتج
console.log('🧪 بدء اختبار حذف المنتج...');

// محاكاة وظيفة الحذف
async function testDelete() {
  try {
    console.log('1️⃣ جاري البحث عن منتج...');
    
    // محاكاة البحث عن منتج
    const mockProduct = {
      id: 'test-id-123',
      name: 'منتج تجريبي'
    };
    
    console.log('2️⃣ المنتج الموجود:', mockProduct);
    
    // محاكاة الحذف
    console.log('3️⃣ جاري حذف المنتج...');
    
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('4️⃣ تم حذف المنتج بنجاح!');
    console.log('5️⃣ المنتج المحذوف:', mockProduct);
    
    return {
      success: true,
      product: mockProduct
    };
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// تشغيل الاختبار
testDelete().then(result => {
  console.log('📊 نتيجة الاختبار:', result);
});
