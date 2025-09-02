// اختبار إصلاح React Navigation
const testNavigationFix = async () => {
  console.log('🧪 اختبار إصلاح React Navigation...');
  
  try {
    // 1. اختبار الخادم المحلي
    console.log('\n1️⃣ اختبار الخادم المحلي...');
    const healthResponse = await fetch('http://localhost:3001/health');
    if (healthResponse.ok) {
      console.log('✅ الخادم المحلي يعمل');
    } else {
      console.log('❌ الخادم المحلي لا يعمل');
    }
    
    // 2. اختبار التطبيق الرئيسي
    console.log('\n2️⃣ اختبار التطبيق الرئيسي...');
    try {
      const appResponse = await fetch('http://localhost:8082');
      if (appResponse.ok) {
        console.log('✅ التطبيق الرئيسي يعمل على المنفذ 8082');
        console.log('📱 يمكنك الآن فتح التطبيق في المتصفح');
        console.log('🌐 الرابط: http://localhost:8082');
      } else {
        console.log('⚠️ التطبيق الرئيسي لا يستجيب بشكل صحيح');
      }
    } catch (appError) {
      console.log('❌ لا يمكن الوصول إلى التطبيق الرئيسي:', appError.message);
    }
    
    console.log('\n🏁 انتهى اختبار React Navigation!');
    console.log('💡 إذا كان كل شيء يعمل، يمكنك الآن:');
    console.log('   1. فتح التطبيق على http://localhost:8082');
    console.log('   2. الذهاب إلى إدارة الطلبات');
    console.log('   3. تغيير حالة طلبية إلى "مؤكد"');
    console.log('   4. ستتم إنشاء الطلبية في ZR Express تلقائياً');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
};

// تشغيل الاختبار
testNavigationFix();
