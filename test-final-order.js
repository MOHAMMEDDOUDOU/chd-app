// اختبار نهائي لإنشاء طلبية صحيحة في ZR Express
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const ZR_EXPRESS_CONFIG = {
  token: "3541877f95878892f64c98e16277688e902c9221583857bf68d73d5f5ee29234",
  key: "59cd8026082b4ba995da7cd29e296f9b",
  baseUrl: "https://procolis.com/api_v1",
  source: "taziri16",
};

async function createFinalOrder() {
  try {
    console.log('🚀 إنشاء طلبية نهائية في ZR Express...');
    
    // التنسيق الصحيح الذي نعرف أنه يعمل
    const orderData = {
      Colis: [{
        Tracking: `TEST${Date.now()}`, // رقم تتبع فريد
        TypeLivraison: "0", // 0 = توصيل منزل، 1 = توصيل مكتب
        TypeColis: "0",
        Confrimee: "",
        Client: "أحمد محمد",
        MobileA: "0771234567",
        MobileB: "",
        Adresse: "شارع الأمير عبد القادر، رقم 15",
        IDWilaya: "16", // الجزائر
        Commune: "الحراش",
        Total: "3500",
        Note: "طلبية تجريبية نهائية - يرجى التوصيل في الصباح",
        TProduit: "هاتف ذكي Samsung Galaxy",
        id_Externe: `ORDER${Date.now()}`,
        Source: "taziri16" // هذا مهم جداً!
      }]
    };
    
    console.log('📦 بيانات الطلبية:', JSON.stringify(orderData, null, 2));
    
    const response = await fetch(`${ZR_EXPRESS_CONFIG.baseUrl}/add_colis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": ZR_EXPRESS_CONFIG.token,
        "key": ZR_EXPRESS_CONFIG.key,
      },
      body: JSON.stringify(orderData),
    });
    
    console.log(`📡 استجابة HTTP: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`📄 النص الكامل للاستجابة: ${responseText}`);
    
    const result = JSON.parse(responseText);
    
    if (result.COUNT > 0 && result.Colis && result.Colis[0].MessageRetour === "Good") {
      console.log('🎉 تم إنشاء الطلبية بنجاح!');
      console.log('📋 تفاصيل الطلبية:');
      console.log(`   - رقم التتبع: ${result.Colis[0].Tracking}`);
      console.log(`   - الحالة: ${result.Colis[0].MessageRetour}`);
      console.log(`   - التاريخ: ${result.Colis[0].Date_Creation}`);
      console.log(`   - العميل: ${result.Colis[0].Client}`);
      console.log(`   - الهاتف: ${result.Colis[0].MobileA}`);
      console.log(`   - العنوان: ${result.Colis[0].Adresse}`);
      console.log(`   - الولاية: ${result.Colis[0].IDWilaya}`);
      console.log(`   - البلدية: ${result.Colis[0].Commune}`);
      console.log(`   - السعر: ${result.Colis[0].Total} دينار`);
      console.log(`   - المنتج: ${result.Colis[0].TProduit}`);
      console.log(`   - المصدر: ${result.Colis[0].Excel}`);
      
      console.log('\n✅ الآن يمكنك البحث عن هذه الطلبية في ZR Express!');
    } else {
      console.log('❌ فشل في إنشاء الطلبية');
      console.log('📋 تفاصيل الخطأ:', result);
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

createFinalOrder();
