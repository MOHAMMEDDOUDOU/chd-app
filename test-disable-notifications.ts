import { UserSettingsService } from './lib/notifications';
import { db, users } from './lib/database/config';

async function testDisableNotifications() {
  try {
    console.log('🔧 تعطيل الإشعارات لجميع المستخدمين...\n');
    
    // جلب جميع المستخدمين
    const allUsers = await db.query.users.findMany();
    console.log(`👥 عدد المستخدمين: ${allUsers.length}`);
    
    // تعطيل الإشعارات لجميع المستخدمين
    for (const user of allUsers) {
      const result = await UserSettingsService.updateUserSettings(user.id, false);
      if (result.success) {
        console.log(`✅ تم تعطيل الإشعارات لـ ${user.fullName}`);
      } else {
        console.log(`❌ فشل في تعطيل الإشعارات لـ ${user.fullName}: ${result.error}`);
      }
    }
    
    console.log('\n🎉 تم تعطيل الإشعارات لجميع المستخدمين!');
    console.log('📝 الآن عند إنشاء عروض أو طلبات جديدة، لن يتم إرسال إشعارات.');
    
  } catch (error) {
    console.error('💥 خطأ في تعطيل الإشعارات:', error);
  }
}

// تشغيل الاختبار
testDisableNotifications();
