// اختبار البيانات المصلحة المرسلة إلى ZR Express
const testFixedData = async () => {
  console.log('🧪 اختبار البيانات المصلحة...');
  
  try {
    const testData = {
      orderData: {
        Colis: [{
          Tracking: `FIXED${Date.now()}`,
          TypeLivraison: "0",
          TypeColis: "0",
          Confrimee: "",
          Client: "مستخدم البيانات المصلحة",
          MobileA: "054201241",
          MobileB: "",
          Adresse: "عنوان البيانات المصلحة",
          IDWilaya: "16",
          Commune: "بلدية البيانات المصلحة",
          Total: "6000",
          Note: "", // حقل فارغ كما طلبت
          TProduit: "منتج البيانات المصلحة",
          id_Externe: `FIXED${Date.now()}`,
          Source: "taziri16"
        }],
        token: "3541877f95878892f64c98e16277688e902c9221583857bf68d73d5f5ee29234",
        key: "59cd8026082b4ba995da7cd29e296f9b"
      }
    };
    
    console.log('📦 البيانات المرسلة:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3001/api/zr-express', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8082'
      },
      body: JSON.stringify(testData),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ نجح إنشاء الطلبية!');
      console.log('📊 النتيجة:', result);
      
      if (result.success) {
        console.log('🎉 البيانات المصلحة تعمل بشكل صحيح!');
        console.log('📦 تفاصيل الطلبية:', result.data);
        
        // التحقق من البيانات
        const colis = result.data?.Colis?.[0];
        if (colis) {
          console.log('\n🔍 التحقق من البيانات:');
          console.log('✅ اسم المنتج:', colis.TProduit);
          console.log('✅ حقل Note:', colis.Note === "" ? "فارغ ✓" : "غير فارغ ✗");
          console.log('✅ السعر الإجمالي:', colis.Total);
          console.log('✅ العميل:', colis.Client);
          console.log('✅ رقم الهاتف:', colis.MobileA);
          console.log('✅ العنوان:', colis.Adresse);
        }
      } else {
        console.log('❌ فشل في إنشاء الطلبية:', result.error);
      }
    } else {
      console.log('❌ فشل في الطلب:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
};

// تشغيل الاختبار
testFixedData();
