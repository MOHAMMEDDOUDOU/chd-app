import { createOrder } from './lib/orders';
import { db, orders, users } from './lib/database/config';

async function testCreateOrderWithLink() {
  console.log('🧪 اختبار إنشاء طلبية مع رابط ويب...\n');

  try {
    // الحصول على مستخدم موجود من قاعدة البيانات
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.role, 'user')
    });

    if (!existingUser) {
      console.log('❌ لا يوجد مستخدمين في قاعدة البيانات');
      return;
    }

    console.log('👤 المستخدم الموجود:', existingUser.username);

    // بيانات الطلبية التجريبية
    const orderData = {
      itemType: 'offer' as const,
      itemId: '550e8400-e29b-41d4-a716-446655440000', // UUID تجريبي
      itemName: 'عرض تجريبي مع رابط ويب',
      quantity: 1,
      unitPrice: 1500,
      subtotal: 1500,
      shippingCost: 0,
      totalAmount: 1500,
      customerName: 'أحمد محمد',
      phoneNumber: '0770123456',
      wilaya: 'الجزائر',
      commune: 'الجزائر الوسطى',
      deliveryType: 'home' as const,
      resellerPrice: 1800, // سعر البيع
      sellerId: existingUser.id, // استخدام معرف المستخدم الموجود
      sellerName: existingUser.fullName || existingUser.username,
    };

    console.log('📋 بيانات الطلبية:', orderData);

    // إنشاء الطلبية
    const result = await createOrder(orderData);

    if (result.success) {
      console.log('✅ تم إنشاء الطلبية بنجاح!');
      console.log('🆔 معرف الطلبية:', result.order.id);
      console.log('🔗 رابط الطلبية:', result.orderLink);
      console.log('💰 سعر البيع:', result.order.resellerPrice);
      console.log('👤 البائع:', result.order.sellerName);
      
      // التحقق من حفظ الرابط في قاعدة البيانات
      const savedOrder = await db.query.orders.findFirst({
        where: (orders, { eq }) => eq(orders.id, result.order.id)
      });
      
      if (savedOrder?.orderLink) {
        console.log('✅ تم حفظ الرابط في قاعدة البيانات بنجاح!');
        console.log('🔗 الرابط المحفوظ:', savedOrder.orderLink);
      } else {
        console.log('❌ لم يتم حفظ الرابط في قاعدة البيانات');
      }
      
    } else {
      console.log('❌ فشل في إنشاء الطلبية:', result.error);
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

// تشغيل الاختبار
testCreateOrderWithLink();
