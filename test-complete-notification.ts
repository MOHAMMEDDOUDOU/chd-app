import { UserSettingsService, NotificationService } from './lib/notifications';
import { db, users } from './lib/database/config';

async function testCompleteNotification() {
  try {
    console.log('🧪 اختبار شامل لنظام الإشعارات...\n');
    
    // 1. جلب جميع المستخدمين
    const allUsers = await db.query.users.findMany();
    console.log(`👥 عدد المستخدمين: ${allUsers.length}`);
    
    if (allUsers.length === 0) {
      console.log('❌ لا يوجد مستخدمين في قاعدة البيانات');
      return;
    }
    
    // 2. تفعيل الإشعارات لجميع المستخدمين
    console.log('\n🔧 تفعيل الإشعارات لجميع المستخدمين...');
    for (const user of allUsers) {
      const result = await UserSettingsService.updateUserSettings(user.id, true);
      if (result.success) {
        console.log(`✅ تم تفعيل الإشعارات لـ ${user.fullName}`);
      } else {
        console.log(`❌ فشل في تفعيل الإشعارات لـ ${user.fullName}: ${result.error}`);
      }
    }
    
    // 3. إنشاء إشعار تجريبي
    console.log('\n📢 إنشاء إشعار تجريبي...');
    const testUser = allUsers[0]; // استخدام أول مستخدم
    const notificationResult = await NotificationService.createNotification(testUser.id, {
      title: 'إشعار تجريبي',
      message: 'هذا إشعار تجريبي لاختبار النظام',
      type: 'news'
    });
    
    if (notificationResult.success) {
      console.log('✅ تم إنشاء الإشعار التجريبي بنجاح!');
      console.log('📋 تفاصيل الإشعار:', JSON.stringify(notificationResult.notification, null, 2));
    } else {
      console.log('❌ فشل في إنشاء الإشعار التجريبي:', notificationResult.error);
    }
    
    // 4. فحص عدد الإشعارات غير المقروءة
    console.log('\n📬 فحص الإشعارات غير المقروءة...');
    const unreadResult = await NotificationService.getUnreadCount(testUser.id);
    if (unreadResult.success) {
      console.log(`📊 عدد الإشعارات غير المقروءة: ${unreadResult.count}`);
    } else {
      console.log('❌ فشل في جلب عدد الإشعارات:', unreadResult.error);
    }
    
    console.log('\n🎉 انتهى الاختبار الشامل!');
    
  } catch (error) {
    console.error('💥 خطأ في الاختبار الشامل:', error);
  }
}

// تشغيل الاختبار
testCompleteNotification();
