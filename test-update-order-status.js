// اختبار تحديث حالة الطلبية إلى مؤكدة في ZR Express
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

async function testUpdateOrderStatus() {
  console.log('🔄 اختبار تحديث حالة الطلبية إلى مؤكدة...');
  
  // أولاً، دعنا ننشئ طلبية جديدة لتحديث حالتها
  console.log('\n📦 إنشاء طلبية جديدة...');
  
  const orderData = {
    Colis: [{
      Tracking: `UPDATE${Date.now()}`,
      TypeLivraison: "0",
      TypeColis: "0",
      Confrimee: "",
      Client: "سارة أحمد",
      MobileA: "0779876543",
      MobileB: "",
      Adresse: "حي القبة، شارع السلام",
      IDWilaya: "16",
      Commune: "القبة",
      Total: "2800",
      Note: "طلبية للتحديث - حالة مؤكدة",
      TProduit: "سماعات لاسلكية",
      id_Externe: `UPDATE_ORDER${Date.now()}`,
      Source: "taziri16"
    }]
  };
  
  try {
    const createResult = await makeRequest("/add_colis", orderData);
    console.log('✅ تم إنشاء الطلبية:', createResult);
    
    if (createResult.COUNT > 0 && createResult.Colis && createResult.Colis[0].MessageRetour === "Good") {
      const trackingNumber = createResult.Colis[0].Tracking;
      console.log(`\n🎯 رقم التتبع: ${trackingNumber}`);
      
      // الآن دعنا نجرب نقاط النهاية المختلفة لتحديث الحالة
      const updateEndpoints = [
        "/update_status",
        "/status_update", 
        "/confirm_order",
        "/order_confirm",
        "/update_colis",
        "/colis_update",
        "/confirm_colis",
        "/validate_order"
      ];
      
      console.log('\n🔄 اختبار نقاط النهاية لتحديث الحالة...');
      
      for (const endpoint of updateEndpoints) {
        try {
          console.log(`\n📡 اختبار: ${endpoint}`);
          
          // تجربة تنسيقات مختلفة للبيانات
          const updateFormats = [
            {
              name: "التنسيق الأول - رقم التتبع فقط",
              data: { tracking: trackingNumber, status: "confirmed" }
            },
            {
              name: "التنسيق الثاني - مع ID",
              data: { id: trackingNumber, status: "confirmed", action: "confirm" }
            },
            {
              name: "التنسيق الثالث - مع Confrimee",
              data: { 
                Colis: [{
                  Tracking: trackingNumber,
                  Confrimee: "1", // 1 = مؤكدة
                  Status: "confirmed"
                }]
              }
            },
            {
              name: "التنسيق الرابع - تحديث كامل",
              data: { 
                Colis: [{
                  Tracking: trackingNumber,
                  Confrimee: "1",
                  Status: "confirmed",
                  DateConfirmation: new Date().toISOString()
                }]
              }
            }
          ];
          
          for (const format of updateFormats) {
            try {
              console.log(`  📝 ${format.name}`);
              const result = await makeRequest(endpoint, format.data);
              console.log(`    ✅ ${format.name}:`, result);
              
              // إذا نجح التحديث، نتوقف
              if (result.success || result.status === "success" || result.message?.includes("success")) {
                console.log(`🎉 نجح التحديث باستخدام ${endpoint} و ${format.name}!`);
                return;
              }
            } catch (error) {
              console.log(`    ❌ ${format.name}:`, error.message);
            }
          }
          
        } catch (error) {
          console.log(`❌ ${endpoint}:`, error.message);
        }
      }
      
      // إذا لم نجد نقطة نهاية تعمل، نجرب التحديث عبر إعادة إرسال الطلبية مع حالة مؤكدة
      console.log('\n🔄 محاولة التحديث عبر إعادة إرسال الطلبية...');
      
      const confirmedOrderData = {
        Colis: [{
          Tracking: trackingNumber,
          TypeLivraison: "0",
          TypeColis: "0",
          Confrimee: "1", // 1 = مؤكدة
          Client: "سارة أحمد",
          MobileA: "0779876543",
          MobileB: "",
          Adresse: "حي القبة، شارع السلام",
          IDWilaya: "16",
          Commune: "القبة",
          Total: "2800",
          Note: "طلبية مؤكدة - تم التحديث",
          TProduit: "سماعات لاسلكية",
          id_Externe: `UPDATE_ORDER${Date.now()}`,
          Source: "taziri16"
        }]
      };
      
      const updateResult = await makeRequest("/add_colis", confirmedOrderData);
      console.log('🔄 نتيجة التحديث:', updateResult);
      
    } else {
      console.log('❌ فشل في إنشاء الطلبية للتحديث');
    }
    
  } catch (error) {
    console.error('❌ خطأ في اختبار التحديث:', error);
  }
}

async function testSpecificStatusUpdate() {
  console.log('\n🎯 اختبار تحديث حالة طلبية محددة...');
  
  // استخدام رقم التتبع من الطلبية السابقة
  const trackingNumber = "TEST17566678806"; // الطلبية التي أنشأناها سابقاً
  
  console.log(`📦 محاولة تحديث الطلبية: ${trackingNumber}`);
  
  const statusUpdateData = {
    Colis: [{
      Tracking: trackingNumber,
      Confrimee: "1", // 1 = مؤكدة
      Status: "confirmed",
      DateConfirmation: new Date().toISOString(),
      Note: "تم تأكيد الطلبية"
    }]
  };
  
  try {
    const result = await makeRequest("/add_colis", statusUpdateData);
    console.log('🔄 نتيجة تحديث الحالة:', result);
    
    if (result.COUNT > 0) {
      console.log('✅ تم تحديث حالة الطلبية!');
      console.log('📋 الحالة الجديدة:', result.Colis[0]);
    }
  } catch (error) {
    console.error('❌ خطأ في تحديث الحالة:', error);
  }
}

async function main() {
  console.log('🧪 بدء اختبار تحديث حالة الطلبية في ZR Express...');
  
  await testUpdateOrderStatus();
  await testSpecificStatusUpdate();
  
  console.log('\n✅ انتهى اختبار تحديث الحالة!');
}

main().catch(console.error);
