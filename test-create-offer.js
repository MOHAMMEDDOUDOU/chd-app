const { createOffer } = require('./lib/offers');

// بيانات العرض الجديد مع تخفيض 15%
const newOfferData = {
  name: "قميص قطني فاخر",
  description: "قميص قطني عالي الجودة مع تخفيض خاص",
  price: 2000, // السعر الأصلي
  discount_price: 1700, // السعر بعد التخفيض (15% تخفيض)
  image_url: "https://res.cloudinary.com/deh3ejeph/image/upload/v1755721864/tshirt-offer.jpg",
  stock_quantity: 50,
  sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
  images: JSON.stringify([
    "https://res.cloudinary.com/deh3ejeph/image/upload/v1755721864/tshirt-1.jpg",
    "https://res.cloudinary.com/deh3ejeph/image/upload/v1755721864/tshirt-2.jpg"
  ]),
  category: "ملابس"
};

async function testCreateOffer() {
  try {
    console.log('🔄 بدء اختبار إنشاء عرض جديد...');
    console.log('📊 بيانات العرض:', JSON.stringify(newOfferData, null, 2));
    
    const result = await createOffer(newOfferData);
    
    if (result.success) {
      console.log('✅ تم إنشاء العرض بنجاح!');
      console.log('📋 تفاصيل العرض:', JSON.stringify(result.offer, null, 2));
      
      // حساب نسبة التخفيض
      const discountPercentage = ((newOfferData.price - newOfferData.discount_price) / newOfferData.price) * 100;
      console.log(`💰 نسبة التخفيض: ${discountPercentage.toFixed(1)}%`);
      
      if (discountPercentage > 10) {
        console.log('🎉 التخفيض أكبر من 10% - يجب أن يتم إرسال إشعارات!');
      } else {
        console.log('⚠️ التخفيض أقل من 10%');
      }
      
    } else {
      console.log('❌ فشل في إنشاء العرض:', result.error);
    }
    
  } catch (error) {
    console.error('💥 خطأ في الاختبار:', error);
  }
}

// تشغيل الاختبار
testCreateOffer();
