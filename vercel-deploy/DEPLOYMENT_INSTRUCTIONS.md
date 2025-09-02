# 🚀 تعليمات النشر على Vercel

## 📋 المتطلبات
- حساب GitHub
- حساب Vercel

## 🔧 الخطوات

### 1. رفع الكود إلى GitHub
```bash
cd vercel-deploy
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

### 2. النشر على Vercel
1. اذهب إلى [vercel.com](https://vercel.com)
2. اضغط "New Project"
3. اختر repository الخاص بك
4. في إعدادات المشروع:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./` (أو اتركه فارغاً)
5. اضغط "Deploy"

### 3. إعداد Environment Variables
بعد النشر، في إعدادات المشروع:
1. اذهب إلى **Settings** → **Environment Variables**
2. أضف:
   - `ZR_EXPRESS_TOKEN`: `3541877f95878892f64c98e16277688e902c9221583857bf68d73d5f5ee29234`
   - `ZR_EXPRESS_KEY`: `59cd8026082b4ba995da7cd29e296f9b`
3. اضغط **Save**

### 4. إعادة النشر
بعد إضافة Environment Variables:
1. اذهب إلى **Deployments**
2. اضغط على **Redeploy** على آخر deployment

## ✅ التحقق من النشر
بعد النشر، يجب أن يعمل الرابط:
`https://your-project.vercel.app/api/zr-express`

## 🔍 اختبار الخادم
```bash
curl -X POST https://your-project.vercel.app/api/zr-express \
  -H "Content-Type: application/json" \
  -d '{"orderData":{"Colis":[{"Tracking":"TEST123","Client":"أحمد","MobileA":"054201234","Total":"1000","Source":"taziri16"}],"token":"your-token","key":"your-key"}}'
```

## 🆘 حل المشاكل
- إذا ظهر `NOT_FOUND`: تأكد من أن Environment Variables تم إضافتها
- إذا فشل النشر: تأكد من أن `package.json` صحيح
- إذا فشل الاتصال: تأكد من أن `api/zr-express.js` موجود في المسار الصحيح
