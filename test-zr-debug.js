// اختبار تصحيح لـ ZR Express API
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// تكوين ZR Express
const ZR_EXPRESS_CONFIG = {
  token: "3541877f95878892f64c98e16277688e902c9221583857bf68d73d5f5ee29234",
  key: "59cd8026082b4ba995da7cd29e296f9b",
  baseUrl: "https://procolis.com/api_v1",
  source: "taziri16",
};

// خريطة تحويل اسم الولاية إلى رقمها
const WILAYA_CODES = {
  "أدرار": "1", "الشلف": "2", "الأغواط": "3", "أم البواقي": "4", "باتنة": "5", 
  "بجاية": "6", "بسكرة": "7", "بشار": "8", "البليدة": "9", "البويرة": "10", 
  "تمنراست": "11", "تبسة": "12", "تلمسان": "13", "تيارت": "14", "تيزي وزو": "15", 
  "الجزائر": "16", "الجلفة": "17", "جيجل": "18", "سطيف": "19", "سعيدة": "20", 
  "سكيكدة": "21", "سيدي بلعباس": "22", "عنابة": "23", "قالمة": "24", "قسنطينة": "25", 
  "المدية": "26", "مستغانم": "27", "المسيلة": "28", "معسكر": "29", "ورقلة": "30", 
  "وهران": "31", "البيض": "32", "إليزي": "33", "برج بوعريريج": "34", "بومرداس": "35", 
  "الطارف": "36", "تندوف": "37", "تيسمسيلت": "38", "الوادي": "39", "خنشلة": "40", 
  "سوق أهراس": "41", "تيبازة": "42", "ميلة": "43", "عين الدفلى": "44", "النعامة": "45", 
  "عين تموشنت": "46", "غرداية": "47", "غليزان": "48", "تيميمون": "49", "برج باجي مختار": "50", 
  "أولاد جلال": "51", "بني عباس": "52", "عين صالح": "53", "عين قزام": "54", "تقرت": "55", 
  "جانت": "56", "المغير": "57", "المنيعة": "58"
};

async function makeRequest(endpoint, data) {
  try {
    console.log(`🌐 إرسال طلب إلى: ${ZR_EXPRESS_CONFIG.baseUrl}${endpoint}`);
    console.log(`🔑 التوكن: ${ZR_EXPRESS_CONFIG.token.substring(0, 10)}...`);
    console.log(`🔑 المفتاح: ${ZR_EXPRESS_CONFIG.key.substring(0, 10)}...`);
    
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
    
    if (!response.ok) {
      throw new Error(resJson.message || `HTTP error! status: ${response.status}`);
    }
    return resJson;
  } catch (error) {
    console.error("❌ خطأ في ZR Express API:", error);
    throw error;
  }
}

async function testDifferentEndpoints() {
  console.log('\n🔍 اختبار نقاط النهاية المختلفة...');
  
  const endpoints = [
    "/add_colis",
    "/addcolis", 
    "/colis/add",
    "/order/add",
    "/create_order",
    "/test",
    "/status"
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 اختبار: ${endpoint}`);
      const testData = { test: "data" };
      const result = await makeRequest(endpoint, testData);
      console.log(`✅ ${endpoint}:`, result);
    } catch (error) {
      console.log(`❌ ${endpoint}:`, error.message);
    }
  }
}

async function createOrderWithDifferentFormats() {
  console.log('\n📦 اختبار إنشاء طلبية بتنسيقات مختلفة...');
  
  const formats = [
    {
      name: "التنسيق الأول (الأصلي)",
      data: {
        Colis: [{
          Tracking: "TEST002",
          TypeLivraison: "0",
          TypeColis: "0",
          Confrimee: "",
          Client: "اختبار جديد",
          MobileA: "0770000001",
          MobileB: "",
          Adresse: "عنوان اختبار جديد",
          IDWilaya: "16",
          Commune: "الحراش",
          Total: "1500",
          Note: "طلبية اختبار جديدة",
          TProduit: "منتج اختبار جديد",
          id_Externe: "TEST002",
          Source: "taziri16"
        }]
      }
    },
    {
      name: "التنسيق الثاني (مبسط)",
      data: {
        tracking: "TEST003",
        customer_name: "اختبار مبسط",
        phone: "0770000002",
        address: "عنوان مبسط",
        wilaya: "16",
        commune: "الحراش",
        amount: "2000",
        product: "منتج مبسط",
        notes: "ملاحظات مبسطة"
      }
    },
    {
      name: "التنسيق الثالث (مع Source)",
      data: {
        Colis: [{
          Tracking: "TEST004",
          TypeLivraison: "0",
          TypeColis: "0",
          Confrimee: "",
          Client: "اختبار مع المصدر",
          MobileA: "0770000003",
          MobileB: "",
          Adresse: "عنوان مع المصدر",
          IDWilaya: "16",
          Commune: "الحراش",
          Total: "2500",
          Note: "طلبية مع المصدر",
          TProduit: "منتج مع المصدر",
          id_Externe: "TEST004",
          Source: "taziri16"
        }]
      }
    }
  ];
  
  for (const format of formats) {
    try {
      console.log(`\n📦 اختبار: ${format.name}`);
      const result = await makeRequest("/add_colis", format.data);
      console.log(`✅ ${format.name}:`, result);
    } catch (error) {
      console.log(`❌ ${format.name}:`, error.message);
    }
  }
}

async function testAuthentication() {
  console.log('\n🔐 اختبار المصادقة...');
  
  // اختبار بدون توكن
  try {
    console.log('📡 اختبار بدون توكن...');
    const response = await fetch(`${ZR_EXPRESS_CONFIG.baseUrl}/add_colis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: "data" }),
    });
    console.log(`✅ بدون توكن: ${response.status}`);
  } catch (error) {
    console.log(`❌ بدون توكن:`, error.message);
  }
  
  // اختبار بتوكن خاطئ
  try {
    console.log('📡 اختبار بتوكن خاطئ...');
    const response = await fetch(`${ZR_EXPRESS_CONFIG.baseUrl}/add_colis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": "wrong_token",
        "key": "wrong_key",
      },
      body: JSON.stringify({ test: "data" }),
    });
    console.log(`✅ بتوكن خاطئ: ${response.status}`);
  } catch (error) {
    console.log(`❌ بتوكن خاطئ:`, error.message);
  }
}

async function main() {
  console.log('🧪 بدء اختبار تصحيح ZR Express API...');
  console.log(`🌐 الرابط الأساسي: ${ZR_EXPRESS_CONFIG.baseUrl}`);
  
  await testDifferentEndpoints();
  await testAuthentication();
  await createOrderWithDifferentFormats();
  
  console.log('\n✅ انتهى الاختبار!');
}

main().catch(console.error);
