// اختبار نهائي لتأكيد الطلبية في ZR Express
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const ZR_EXPRESS_CONFIG = {
  token: "3541877f95878892f64c98e16277688e902c9221583857bf68d73d5f5ee29234",
  key: "59cd8026082b4ba995da7cd29e296f9b",
  baseUrl: "https://procolis.com/api_v1",
  source: "taziri16",
};

async function makeRequest(endpoint, data) {
  try {
    console.log(`🌐 إرسال طلب إلى: ${ZR_EXPRESS_CONFIG.baseUrl}${endpoint}`);
    console.log(`📦 البيانات المرسلة:`, JSON.stringify(data, null, 2));
    
    const response = await fetch(`${ZR_EXPRESS_CONFIG.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": ZR_EXPRESS_CONFIG.token,
        "key": ZR_EXPRESS_CONFIG.key,
      },
      body: JSON.stringify(data),
    });
    
    console.log(`📡 استجابة HTTP: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`📄 النص الكامل للاستجابة: ${responseText}`);
    
    let resJson;
    try {
      resJson = JSON.parse(responseText);
    } catch (e) {
      console.log(`⚠️ فشل في تحليل JSON: ${e.message}`);
      return { raw_response: responseText, status: response.status };
    }
    
    return resJson;
  } catch (error) {
    console.error("❌ خطأ في ZR Express API:", error);
    throw error;
  }
}

async function confirmOrder() {
  console.log('✅ تأكيد طلبية في ZR Express...');
  
  // إنشاء طلبية مؤكدة مباشرة
  const confirmedOrderData = {
    Colis: [{
      Tracking: `CONFIRMED${Date.now()}`, // رقم تتبع فريد
      TypeLivraison: "0", // 0 = توصيل منزل
      TypeColis: "0",
      Confrimee: "1", // 1 = مؤكدة ✅
      Client: "فاطمة علي",
      MobileA: "0775551234",
      MobileB: "",
      Adresse: "حي بئر خادم، شارع الاستقلال",
      IDWilaya: "16", // الجزائر
      Commune: "بئر خادم",
      Total: "4200",
      Note: "طلبية مؤكدة - يرجى التوصيل في المساء",
      TProduit: "حقيبة جلدية ماركة",
      id_Externe: `CONFIRMED_ORDER${Date.now()}`,
      Source: "taziri16"
    }]
  };
  
  try {
    console.log('\n📦 إنشاء طلبية مؤكدة...');
    const result = await makeRequest("/add_colis", confirmedOrderData);
    
    if (result.COUNT > 0 && result.Colis && result.Colis[0].MessageRetour === "Good") {
      console.log('\n🎉 تم إنشاء الطلبية المؤكدة بنجاح!');
      console.log('📋 تفاصيل الطلبية المؤكدة:');
      console.log(`   - رقم التتبع: ${result.Colis[0].Tracking}`);
      console.log(`   - الحالة: ${result.Colis[0].MessageRetour}`);
      console.log(`   - التأكيد: ${result.Colis[0].Confrimee === "1" ? "مؤكدة ✅" : "غير مؤكدة ❌"}`);
      console.log(`   - التاريخ: ${result.Colis[0].Date_Creation}`);
      console.log(`   - العميل: ${result.Colis[0].Client}`);
      console.log(`   - الهاتف: ${result.Colis[0].MobileA}`);
      console.log(`   - العنوان: ${result.Colis[0].Adresse}`);
      console.log(`   - الولاية: ${result.Colis[0].IDWilaya}`);
      console.log(`   - البلدية: ${result.Colis[0].Commune}`);
      console.log(`   - السعر: ${result.Colis[0].Total} دينار`);
      console.log(`   - المنتج: ${result.Colis[0].TProduit}`);
      console.log(`   - المصدر: ${result.Colis[0].Excel}`);
      
      console.log('\n✅ الآن يمكنك البحث عن هذه الطلبية المؤكدة في ZR Express!');
      console.log('🔍 ابحث عن رقم التتبع:', result.Colis[0].Tracking);
      
      return result.Colis[0].Tracking;
    } else {
      console.log('❌ فشل في إنشاء الطلبية المؤكدة');
      console.log('📋 تفاصيل الخطأ:', result);
      return null;
    }
    
  } catch (error) {
    console.error('❌ خطأ في تأكيد الطلبية:', error);
    return null;
  }
}

async function updateExistingOrder() {
  console.log('\n🔄 تحديث طلبية موجودة إلى مؤكدة...');
  
  // استخدام رقم التتبع من الطلبية السابقة
  const existingTracking = "TEST17566678806";
  
  console.log(`📦 محاولة تحديث الطلبية: ${existingTracking}`);
  
  // إرسال جميع البيانات مرة أخرى مع Confrimee = "1"
  const updateData = {
    Colis: [{
      Tracking: existingTracking,
      TypeLivraison: "0",
      TypeColis: "0",
      Confrimee: "1", // 1 = مؤكدة ✅
      Client: "أحمد محمد",
      MobileA: "0771234567",
      MobileB: "",
      Adresse: "شارع الأمير عبد القادر، رقم 15",
      IDWilaya: "16",
      Commune: "الحراش",
      Total: "3500",
      Note: "طلبية مؤكدة - تم التحديث",
      TProduit: "هاتف ذكي Samsung Galaxy",
      id_Externe: `UPDATED_ORDER${Date.now()}`,
      Source: "taziri16"
    }]
  };
  
  try {
    const result = await makeRequest("/add_colis", updateData);
    
    if (result.COUNT > 0) {
      console.log('✅ تم تحديث الطلبية إلى مؤكدة!');
      console.log('📋 الحالة الجديدة:', result.Colis[0]);
      
      if (result.Colis[0].MessageRetour === "Good") {
        console.log('🎉 الطلبية مؤكدة بنجاح!');
      } else {
        console.log('⚠️ تم التحديث لكن هناك تحذير:', result.Colis[0].MessageRetour);
      }
    } else {
      console.log('❌ فشل في تحديث الطلبية');
    }
    
  } catch (error) {
    console.error('❌ خطأ في تحديث الطلبية:', error);
  }
}

async function main() {
  console.log('🧪 بدء اختبار تأكيد الطلبية في ZR Express...');
  console.log('📋 ملاحظة: ZR Express لا يحتوي على نقاط نهاية منفصلة لتحديث الحالة');
  console.log('✅ الحل: إنشاء طلبية جديدة مع حقل Confrimee = "1"');
  
  // 1. إنشاء طلبية مؤكدة جديدة
  const newTracking = await confirmOrder();
  
  // 2. تحديث طلبية موجودة
  await updateExistingOrder();
  
  console.log('\n✅ انتهى اختبار تأكيد الطلبية!');
  console.log('\n📚 ملخص الطرق المتاحة:');
  console.log('   1. إنشاء طلبية جديدة مؤكدة: Confrimee = "1"');
  console.log('   2. إعادة إرسال طلبية موجودة مع Confrimee = "1"');
  console.log('   3. لا توجد نقاط نهاية منفصلة لتحديث الحالة');
}

main().catch(console.error);
