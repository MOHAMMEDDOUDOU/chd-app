const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// اختبار Express Server الجديد
async function testExpressServer() {
  try {
    console.log('🧪 اختبار Express Server الجديد...');
    
    // بيانات الطلبية
    const orderData = {
      Colis: [{
        Tracking: `CHD${Date.now()}`,
        TypeLivraison: "0",
        TypeColis: "0",
        Confrimee: "",
        Client: "كريم",
        MobileA: "054201287",
        MobileB: "",
        Adresse: "16, الجزائر",
        IDWilaya: "16",
        Commune: "الجزائر",
        Total: "1000",
        Note: "طلبية من تطبيق CHD - منتج",
        TProduit: "منتج",
        id_Externe: `ORDER${Date.now()}`,
        Source: "taziri16"
      }]
    };

    console.log('🌐 إرسال طلب إلى Express Server: http://localhost:3001/api/zr-express');
    console.log('📦 البيانات المرسلة:', JSON.stringify(orderData, null, 2));

    // إرسال الطلب إلى Express Server
    const response = await fetch('http://localhost:3001/api/zr-express', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderData }),
    });

    console.log('📡 استجابة HTTP:', response.status, response.statusText);

    const result = await response.json();
    console.log('📊 النتيجة الكاملة:', JSON.stringify(result, null, 2));

    // تحقق من النجاح
    if (result.success) {
      console.log('✅ نجح Express Server!');
      console.log('📦 الرسالة:', result.message);
      if (result.data) {
        console.log('📦 البيانات:', JSON.stringify(result.data, null, 2));
      }
      return true;
    } else {
      console.log('❌ فشل Express Server');
      console.log('🔍 السبب:', result.error || result.message || 'غير معروف');
      return false;
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    return false;
  }
}

// اختبار health check
async function testHealthCheck() {
  try {
    console.log('\n🏥 اختبار Health Check...');
    
    const response = await fetch('http://localhost:3001/health');
    const result = await response.json();
    
    console.log('📊 Health Check Result:', JSON.stringify(result, null, 2));
    
    if (result.status === 'OK') {
      console.log('✅ Express Server يعمل بشكل صحيح!');
      return true;
    } else {
      console.log('❌ Express Server لا يعمل');
      return false;
    }
    
  } catch (error) {
    console.error('❌ خطأ في Health Check:', error.message);
    return false;
  }
}

// تشغيل الاختبارات
async function runTests() {
  console.log('🚀 بدء اختبارات Express Server...\n');
  
  // اختبار Health Check أولاً
  const healthOk = await testHealthCheck();
  
  if (!healthOk) {
    console.log('\n❌ Express Server غير متاح. تأكد من تشغيله أولاً:');
    console.log('   cd server && node zr-express-server.js');
    return;
  }
  
  // اختبار API endpoint
  const apiSuccess = await testExpressServer();
  
  console.log('\n📊 ملخص النتائج:');
  if (apiSuccess) {
    console.log('✅ Express Server يعمل بشكل صحيح!');
    console.log('🎉 مشكلة CORS محلولة!');
    console.log('🚀 Frontend يمكنه الآن الاتصال بـ ZR Express!');
  } else {
    console.log('❌ Express Server يحتاج إلى إصلاح');
  }
}

runTests();
