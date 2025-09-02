// اختبار بسيط لـ ZR Express API
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
    const response = await fetch(`${ZR_EXPRESS_CONFIG.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": ZR_EXPRESS_CONFIG.token,
        "key": ZR_EXPRESS_CONFIG.key,
      },
      body: JSON.stringify(data),
    });
    const resJson = await response.json();
    if (!response.ok) {
      throw new Error(resJson.message || `HTTP error! status: ${response.status}`);
    }
    return resJson;
  } catch (error) {
    console.error("ZR Express API Error:", error);
    throw error;
  }
}

async function createOrder(orderData) {
  try {
    // تجهيز بيانات الطلبية حسب وثيقة procolis
    const wilayaCode = WILAYA_CODES[orderData.wilaya] || "1";
    
    // تحديد البلدية حسب نوع التوصيل
    let commune = orderData.commune || "";
    if (orderData.delivery_type === "office") {
      // في حالة التوصيل للمكتب، اترك حقل البلدية فارغاً
      commune = "";
    }
    
    const colis = [{
      Tracking: orderData.order_number || orderData.tracking_number || "",
      TypeLivraison: orderData.delivery_type === "home" ? "0" : "1",
      TypeColis: "0",
      Confrimee: "",
      Client: orderData.customer_name,
      MobileA: orderData.phone_number,
      MobileB: "",
      Adresse: orderData.address,
      IDWilaya: wilayaCode,
      Commune: commune,
      Total: orderData.total_amount?.toString() || "0",
      Note: orderData.notes || "",
      TProduit: orderData.product_name,
      id_Externe: orderData.order_number || "",
      Source: ""
    }];
    
    const payload = { Colis: colis };
    console.log('📦 بيانات الطلبية المرسلة:', JSON.stringify(payload, null, 2));
    
    const response = await makeRequest("/add_colis", payload);
    return {
      success: response?.status === "success" || response?.success,
      message: response?.message || "تم إرسال الطلبية إلى ZR Express",
      data: response
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      error: error
    };
  }
}

async function testConnection() {
  try {
    const response = await makeRequest("/test", {});
    return {
      success: true,
      message: "Connection successful",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

async function testZRExpress() {
  console.log('🧪 بدء اختبار ZR Express API...');
  
  try {
    // اختبار الاتصال
    console.log('📡 اختبار الاتصال...');
    const connectionTest = await testConnection();
    console.log('🔗 نتيجة اختبار الاتصال:', connectionTest);
    
    // اختبار إنشاء طلبية
    console.log('📦 اختبار إنشاء طلبية...');
    const orderData = {
      customer_name: "اختبار",
      phone_number: "0770000000",
      address: "عنوان اختبار",
      wilaya: "الجزائر",
      commune: "الحراش",
      product_name: "منتج اختبار",
      total_amount: 1000,
      quantity: 1,
      delivery_type: "home",
      order_number: "TEST001",
      notes: "طلبية اختبار"
    };
    
    const result = await createOrder(orderData);
    console.log('📡 نتيجة إنشاء الطلبية:', result);
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

// تشغيل الاختبار
testZRExpress();
