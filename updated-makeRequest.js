// كود محدث لـ makeRequest - استخدم هذا الكود في lib/zr-express-api.ts

private static async makeRequest(endpoint: string, data: any): Promise<any> {
  try {
    // استخدام Vercel Proxy لحل مشكلة CORS
    // TODO: استبدل هذا الرابط بالرابط الحقيقي من Vercel بعد النشر
    const proxyUrl = "https://your-project-name.vercel.app/api/zr-express";
    
    console.log("🌐 إرسال طلب عبر Vercel Proxy إلى:", proxyUrl);
    console.log("📦 البيانات المرسلة:", JSON.stringify(data, null, 2));
    
    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderData: data }),
    });
    
    console.log("📡 استجابة HTTP:", response.status, response.statusText);
    
    const resJson = await response.json();
    if (!response.ok) {
      throw new Error(resJson.message || `HTTP error! status: ${response.status}`);
    }
    
    // Vercel proxy returns data in .data field
    return resJson.data || resJson;
  } catch (error) {
    console.error("ZR Express API Error:", error);
    throw error;
  }
}
