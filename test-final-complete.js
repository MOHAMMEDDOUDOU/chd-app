// اختبار نهائي شامل للتطبيق
const testFinalComplete = async () => {
  console.log('🧪 اختبار نهائي شامل للتطبيق...');
  
  try {
    // 1. اختبار الخادم المحلي
    console.log('\n1️⃣ اختبار الخادم المحلي...');
    const healthResponse = await fetch('http://localhost:3001/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ الخادم المحلي يعمل:', healthData.message);
    } else {
      console.log('❌ الخادم المحلي لا يعمل');
      return;
    }
    
    // 2. اختبار إنشاء طلبية
    console.log('\n2️⃣ اختبار إنشاء طلبية...');
    const testData = {
      orderData: {
        Colis: [{
          Tracking: `FINAL${Date.now()}`,
          TypeLivraison: "0",
          TypeColis: "0",
          Confrimee: "",
          Client: "مستخدم الاختبار النهائي",
          MobileA: "054201240",
          MobileB: "",
          Adresse: "عنوان الاختبار النهائي",
          IDWilaya: "16",
          Commune: "بلدية الاختبار النهائي",
          Total: "5000",
          Note: "طلبية اختبار نهائي",
          TProduit: "منتج الاختبار النهائي",
          id_Externe: `FINAL${Date.now()}`,
          Source: "taziri16"
        }],
        token: "3541877f95878892f64c98e16277688e902c9221583857bf68d73d5f5ee29234",
        key: "59cd8026082b4ba995da7cd29e296f9b"
      }
    };
    
    const orderResponse = await fetch('http://localhost:3001/api/zr-express', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8082'
      },
      body: JSON.stringify(testData),
    });
    
    if (orderResponse.ok) {
      const orderResult = await orderResponse.json();
      console.log('✅ إنشاء الطلبية نجح:', orderResult.success);
      console.log('📦 رسالة النجاح:', orderResult.message);
    } else {
      console.log('❌ فشل في إنشاء الطلبية');
    }
    
    // 3. اختبار التطبيق الرئيسي
    console.log('\n3️⃣ اختبار التطبيق الرئيسي...');
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
    
    console.log('\n🏁 انتهى الاختبار النهائي!');
    console.log('🎉 إذا كان كل شيء يعمل، فالنظام جاهز للاستخدام!');
    console.log('\n💡 الخطوات التالية:');
    console.log('   1. افتح التطبيق على http://localhost:8082');
    console.log('   2. سجل دخول كأدمن');
    console.log('   3. اذهب إلى إدارة الطلبات');
    console.log('   4. غير حالة طلبية إلى "مؤكد"');
    console.log('   5. ستتم إنشاء الطلبية في ZR Express تلقائياً');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار النهائي:', error);
  }
};

// تشغيل الاختبار
testFinalComplete();
