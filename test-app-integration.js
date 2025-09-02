// اختبار التكامل من التطبيق إلى الخادم المحلي
const testAppIntegration = async () => {
  console.log('🧪 بدء اختبار التكامل من التطبيق...');
  
  try {
    // 1. اختبار الوصول إلى الخادم من المنفذ 8082
    console.log('\n1️⃣ اختبار الوصول إلى الخادم من المنفذ 8082...');
    
    const testData = {
      orderData: {
        Colis: [{
          Tracking: `APP${Date.now()}`,
          TypeLivraison: "0",
          TypeColis: "0",
          Confrimee: "",
          Client: "مستخدم التطبيق",
          MobileA: "054201237",
          MobileB: "",
          Adresse: "عنوان التطبيق",
          IDWilaya: "16",
          Commune: "بلدية التطبيق",
          Total: "3000",
          Note: "طلبية من التطبيق",
          TProduit: "منتج التطبيق",
          id_Externe: `APP${Date.now()}`,
          Source: "taziri16"
        }],
        token: "3541877f95878892f64c98e16277688e902c9221583857bf68d73d5f5ee29234",
        key: "59cd8026082b4ba995da7cd29e296f9b"
      }
    };
    
    // محاكاة طلب من التطبيق (المنفذ 8082)
    const response = await fetch('http://localhost:3001/api/zr-express', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8082'
      },
      body: JSON.stringify(testData),
    });
    
    console.log('📡 استجابة HTTP:', response.status, response.statusText);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ نجح الطلب من التطبيق!');
      console.log('📦 النتيجة:', result);
      
      if (result.success) {
        console.log('🎉 تم إنشاء الطلبية في ZR Express بنجاح!');
        console.log('📊 تفاصيل الطلبية:', result.data);
      } else {
        console.log('⚠️ فشل في إنشاء الطلبية:', result.error);
      }
    } else {
      console.log('❌ فشل في الطلب:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('📝 تفاصيل الخطأ:', errorText);
    }
    
  } catch (error) {
    console.error('❌ خطأ في اختبار التكامل:', error);
  }
};

// تشغيل الاختبار
testAppIntegration();
