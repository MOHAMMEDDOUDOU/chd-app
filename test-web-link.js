// اختبار بسيط لروابط الويب
console.log('🧪 اختبار روابط الويب...\n');

// مثال على الرابط المُنشأ
const orderId = 'c74d6a9a-e302-4c6c-8fbe-b57925a2c46c';
const itemId = '550e8400-e29b-41d4-a716-446655440000';
const itemType = 'offer';

const webLink = `http://localhost:3000/order/${orderId}?item=${itemId}&type=${itemType}`;

console.log('🔗 الرابط المُنشأ:');
console.log(webLink);
console.log('\n📋 معلومات الطلبية:');
console.log('- معرف الطلبية:', orderId);
console.log('- معرف المنتج:', itemId);
console.log('- نوع المنتج:', itemType);

console.log('\n✅ يمكنك الآن:');
console.log('1. فتح الرابط في المتصفح');
console.log('2. ملء معلومات العميل');
console.log('3. إرسال الطلبية');

console.log('\n🌐 روابط مفيدة:');
console.log('- الصفحة الرئيسية: http://localhost:3000');
console.log('- صفحة الطلبية: ' + webLink);
console.log('- API الطلبية: http://localhost:3000/api/order/' + orderId);

console.log('\n🎉 النظام جاهز للاستخدام!');
