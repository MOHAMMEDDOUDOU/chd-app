import { createOrder } from './lib/orders';

// بيانات الطلبية الجديدة
const newOrderData = {
  itemType: 'product' as const,
  itemId: '84087aeb-fccb-4710-aa58-160aed362e94', // استخدام ID العرض الذي تم إنشاؤه
  itemName: 'قميص قطني فاخر',
  quantity: 2,
  unitPrice: 2000,
  subtotal: 4000,
  shippingCost: 500,
  totalAmount: 4500,
  customerName: 'أحمد محمد',
  phoneNumber: '0770123456',
  wilaya: 'الجزائر',
  commune: 'الجزائر الوسطى',
  deliveryType: 'home' as const,
  resellerPrice: 1800
};

async function testCreateOrder() {
  try {
    console.log('🔄 بدء اختبار إنشاء طلبية جديدة...');
    console.log('📊 بيانات الطلبية:', JSON.stringify(newOrderData, null, 2));
    
    const result = await createOrder(newOrderData);
    
    if (result.success) {
      console.log('✅ تم إنشاء الطلبية بنجاح!');
      console.log('📋 تفاصيل الطلبية:', JSON.stringify(result.order, null, 2));
      console.log('🎉 يجب أن يتم إرسال إشعار للأدمن!');
      
    } else {
      console.log('❌ فشل في إنشاء الطلبية:', result.error);
    }
    
  } catch (error) {
    console.error('💥 خطأ في الاختبار:', error);
  }
}

// تشغيل الاختبار
testCreateOrder();
