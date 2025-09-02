// اختبار التكامل النهائي بين Frontend والخادم المحلي
const testIntegration = async () => {
  console.log('🧪 بدء اختبار التكامل النهائي...');
  
  try {
    // 1. اختبار الخادم المحلي
    console.log('\n1️⃣ اختبار الخادم المحلي...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ حالة الخادم:', healthData);
    
    // 2. اختبار إنشاء طلبية عبر الخادم
    console.log('\n2️⃣ اختبار إنشاء طلبية عبر الخادم...');
    const orderData = {
      Colis: [{
        Tracking: `TEST${Date.now()}`,
        TypeLivraison: "0",
        TypeColis: "0",
        Confrimee: "",
        Client: "مستخدم تجريبي",
        MobileA: "054201234",
        MobileB: "",
        Adresse: "عنوان تجريبي",
        IDWilaya: "16",
        Commune: "بلدية تجريبية",
        Total: "1500",
        Note: "طلبية تجريبية للتكامل",
        TProduit: "منتج تجريبي",
        id_Externe: `TEST${Date.now()}`,
        Source: "taziri16"
      }],
      token: "3541877f95878892f64c98e16277688e902c9221583857bf68d73d5f5ee29234",
      key: "59cd8026082b4ba995da7cd29e296f9b"
    };
    
    const orderResponse = await fetch('http://localhost:3001/api/zr-express', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderData }),
    });
    
    const orderResult = await orderResponse.json();
    console.log('📦 نتيجة إنشاء الطلبية:', orderResult);
    
    if (orderResult.success) {
      console.log('🎉 نجح التكامل! الطلبية تم إنشاؤها في ZR Express');
      console.log('📊 تفاصيل الطلبية:', orderResult.data);
    } else {
      console.log('❌ فشل في إنشاء الطلبية:', orderResult.error);
    }
    
    // 3. اختبار التطبيق الرئيسي
    console.log('\n3️⃣ اختبار التطبيق الرئيسي...');
    try {
      const appResponse = await fetch('http://localhost:8082');
      if (appResponse.ok) {
        console.log('✅ التطبيق الرئيسي يعمل على المنفذ 8082');
      } else {
        console.log('⚠️ التطبيق الرئيسي لا يستجيب بشكل صحيح');
      }
    } catch (appError) {
      console.log('❌ لا يمكن الوصول إلى التطبيق الرئيسي:', appError.message);
    }
    
    console.log('\n🏁 انتهى اختبار التكامل!');
    
  } catch (error) {
    console.error('❌ خطأ في اختبار التكامل:', error);
  }
};

// تشغيل الاختبار
testIntegration();
