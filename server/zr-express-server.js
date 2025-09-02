const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// ZR Express API Configuration
const ZR_EXPRESS_CONFIG = {
  token: "3541877f95878892f64c98e16277688e902c9221583857bf68d73d5f5ee29234",
  key: "59cd8026082b4ba995da7cd29e296f9b",
  baseUrl: "https://procolis.com/api_v1",
  source: "taziri16",
};

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8081', 
    'http://localhost:8082', 
    'http://localhost:3000', 
    'http://localhost:19006',
    'http://127.0.0.1:8081',
    'http://127.0.0.1:8082',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token', 'key'],
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ZR Express Server is running',
    timestamp: new Date().toISOString()
  });
});

// ZR Express proxy endpoint
app.post('/api/zr-express', async (req, res) => {
  try {
    console.log('🚀 Server: استقبال طلب من Frontend');
    console.log('📦 البيانات المستلمة:', JSON.stringify(req.body, null, 2));

    const { orderData } = req.body;

    // التحقق من وجود البيانات
    if (!orderData) {
      return res.status(400).json({
        success: false,
        error: 'Missing orderData in request body'
      });
    }

    // استخدام fetch المدمج في Node.js 18+
    const fetch = (await import('node-fetch')).default;
    
    // إرسال الطلب إلى ZR Express
    console.log('🌐 إرسال طلب إلى ZR Express:', `${ZR_EXPRESS_CONFIG.baseUrl}/add_colis`);
    
    const zrResponse = await fetch(`${ZR_EXPRESS_CONFIG.baseUrl}/add_colis`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'token': ZR_EXPRESS_CONFIG.token,
        'key': ZR_EXPRESS_CONFIG.key,
      },
      body: JSON.stringify(orderData),
    });

    console.log('📡 استجابة ZR Express:', zrResponse.status, zrResponse.statusText);

    if (!zrResponse.ok) {
      const errorData = await zrResponse.json();
      console.error('❌ خطأ من ZR Express:', errorData);
      
      return res.status(zrResponse.status).json({
        success: false,
        error: `ZR Express Error: ${zrResponse.status}`,
        details: errorData
      });
    }

    const zrResult = await zrResponse.json();
    console.log('✅ نجح الطلب إلى ZR Express:', JSON.stringify(zrResult, null, 2));

    // إرسال النتيجة إلى Frontend
    res.status(200).json({
      success: true,
      message: 'تم إرسال الطلبية إلى ZR Express بنجاح',
      data: zrResult
    });

  } catch (error) {
    console.error('❌ خطأ في Server:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ZR Express Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/zr-express`);
  console.log('✅ Ready to handle requests from Frontend!');
});

module.exports = app;
