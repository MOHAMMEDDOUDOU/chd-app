const fetch = require('node-fetch');

async function testVercelDeployment() {
  console.log('🚀 اختبار الخادم الجديد على Vercel...');
  console.log('📍 الرابط: https://vercel-deploy-five-nu.vercel.app/');
  
  try {
    // اختبار إنشاء طلبية
    const orderData = {
      Colis: [
        {
          Tracking: "VERCEL_TEST_" + Date.now(),
          TypeLivraison: "0",
          TypeColis: "0",
          Confrimee: "",
          Client: "أحمد محمد",
          MobileA: "054201234",
          MobileB: "",
          Adresse: "عنوان الحراش",
          IDWilaya: "16",
          Commune: "الحراش",
          Total: "51500.00",
          Note: "",
          TProduit: "هاتف ذكي Samsung Galaxy S24",
          id_Externe: "VERCEL_TEST_" + Date.now(),
          Source: "taziri16"
        }
      ],
      token: "3541877f95878892f64c98e16277688e902c9221583857bf68d73d5f5ee29234",
      key: "59cd8026082b4ba995da7cd29e296f9b"
    };

    console.log('📦 البيانات المرسلة:', JSON.stringify(orderData, null, 2));

    const response = await fetch('https://vercel-deploy-five-nu.vercel.app/api/zr-express', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderData }),
    });

    console.log('📡 استجابة HTTP:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ خطأ:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ نجح الطلب!');
    console.log('📊 النتيجة:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('🎉 تم إنشاء الطلبية بنجاح في ZR Express!');
    } else {
      console.log('⚠️ الطلبية لم تنشأ في ZR Express');
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

// تشغيل الاختبار
testVercelDeployment();
