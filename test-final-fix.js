// اختبار الإصلاح النهائي
const testFinalFix = async () => {
  console.log('🧪 اختبار الإصلاح النهائي...');
  
  try {
    const testData = {
      orderData: {
        Colis: [{
          Tracking: `FINAL${Date.now()}`,
          TypeLivraison: "0",
          TypeColis: "0",
          Confrimee: "",
          Client: "مستخدم الإصلاح النهائي",
          MobileA: "054201239",
          MobileB: "",
          Adresse: "عنوان الإصلاح النهائي",
          IDWilaya: "16",
          Commune: "بلدية الإصلاح النهائي",
          Total: "4000",
          Note: "طلبية اختبار الإصلاح النهائي",
          TProduit: "منتج الإصلاح النهائي",
          id_Externe: `FINAL${Date.now()}`,
          Source: "taziri16"
        }],
        token: "3541877f95878892f64c98e16277688e902c9221583857bf68d73d5f5ee29234",
        key: "59cd8026082b4ba995da7cd29e296f9b"
      }
    };
    
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
      console.log('📦 النتيجة الكاملة:', JSON.stringify(result, null, 2));
      
      // محاكاة منطق createOrder
      const success = result?.success === true || result?.status === "success" || false;
      console.log('✅ حقل success المحسوب:', success);
      console.log('🔍 حقل success الأصلي:', result?.success);
      console.log('🔍 حقل status:', result?.status);
      
      if (success) {
        console.log('🎉 الإصلاح النهائي يعمل! حقل success صحيح');
        console.log('📊 تفاصيل الطلبية:', result.data);
      } else {
        console.log('❌ الإصلاح النهائي لا يزال لا يعمل');
      }
    } else {
      console.log('❌ فشل في الطلب:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
};

// تشغيل الاختبار
testFinalFix();
