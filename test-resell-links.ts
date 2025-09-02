import { db, users, products, resellLinks } from './lib/database/config';
import { createResellLink, getResellLinkBySlug, listUserResellLinks, deactivateResellLink } from './lib/resellLinks';
import { getProducts } from './lib/products';
import * as Crypto from 'expo-crypto';

const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

async function hashPassword(password: string): Promise<string> {
  const hashBuffer = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password + JWT_SECRET);
  return hashBuffer;
}

async function createTestData() {
  console.log('�� بدء اختبار روابط إعادة البيع...\n');

  try {
    // 1. إنشاء مستخدم تجريبي
    console.log('1️⃣ إنشاء مستخدم تجريبي...');
    const passwordHash = await hashPassword('123456');
    const [testUser] = await db.insert(users).values({
      username: 'reselltest',
      phoneNumber: '0550123457',
      passwordHash,
      fullName: 'مستخدم اختبار الروابط',
    }).returning();
    console.log('✅ تم إنشاء المستخدم:', testUser.id);

    // 2. التحقق من وجود منتجات
    console.log('\n2️⃣ التحقق من المنتجات...');
    const productsResult = await getProducts();
    if (!productsResult.success || !productsResult.products || productsResult.products.length === 0) {
      console.log('❌ لا توجد منتجات في قاعدة البيانات');
      console.log('إنشاء منتج تجريبي...');
      
      const [testProduct] = await db.insert(products).values({
        name: 'منتج اختبار الروابط',
        description: 'منتج تجريبي لاختبار روابط إعادة البيع',
        price: 100,
        stockQuantity: 10,
        category: 'إلكترونيات',
        isActive: true,
      }).returning();
      console.log('✅ تم إنشاء المنتج:', testProduct.id);
      
      return { user: testUser, product: testProduct };
    }

    const activeProduct = productsResult.products.find((p: any) => p.isActive);
    if (!activeProduct) {
      console.log('❌ لا توجد منتجات فعّالة');
      return { user: testUser, product: null };
    }

    console.log('✅ تم العثور على منتج فعّال:', activeProduct.id);
    return { user: testUser, product: activeProduct };

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات التجريبية:', error);
    throw error;
  }
}

async function testResellLinks() {
  try {
    // إنشاء البيانات التجريبية
    const { user, product } = await createTestData();
    
    if (!product) {
      console.log('❌ لا يمكن إكمال الاختبار بدون منتج');
      return;
    }

    console.log('\n3️⃣ اختبار إنشاء رابط إعادة البيع...');
    
    // إنشاء رابط
    const newLink = await createResellLink(product.id, user.id);
    console.log('✅ تم إنشاء الرابط:', newLink.slug);
    console.log('   الرابط الكامل: https://taziri.netlify.app/resell/' + newLink.slug);

    // اختبار جلب الرابط بالـ slug
    console.log('\n4️⃣ اختبار جلب الرابط...');
    const retrievedLink = await getResellLinkBySlug(newLink.slug);
    if (retrievedLink) {
      console.log('✅ تم جلب الرابط بنجاح');
      console.log('   المنتج:', retrievedLink.product.name);
      console.log('   البائع:', retrievedLink.seller.fullName);
    } else {
      console.log('❌ فشل في جلب الرابط');
    }

    // اختبار قائمة روابط المستخدم
    console.log('\n5️⃣ اختبار قائمة روابط المستخدم...');
    const userLinks = await listUserResellLinks(user.id);
    console.log('✅ روابط المستخدم:', userLinks.length);
    userLinks.forEach((link, index) => {
      console.log(`   ${index + 1}. ${link.product.name} - /${link.slug}`);
    });

    // اختبار تعطيل الرابط
    console.log('\n6️⃣ اختبار تعطيل الرابط...');
    await deactivateResellLink(newLink.id, user.id);
    console.log('✅ تم تعطيل الرابط');

    // التحقق من التعطيل
    const deactivatedLink = await getResellLinkBySlug(newLink.slug);
    if (!deactivatedLink || !deactivatedLink.isActive) {
      console.log('✅ تم تعطيل الرابط بنجاح');
    } else {
      console.log('❌ فشل في تعطيل الرابط');
    }

    console.log('\n🎉 جميع اختبارات روابط إعادة البيع نجحت!');

  } catch (error) {
    console.error('❌ خطأ في اختبار روابط إعادة البيع:', error);
    throw error;
  }
}

// تشغيل الاختبار
testResellLinks()
  .then(() => {
    console.log('\n✅ اختبار روابط إعادة البيع مكتمل بنجاح!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 فشل في اختبار روابط إعادة البيع:', error);
    process.exit(1);
  });
