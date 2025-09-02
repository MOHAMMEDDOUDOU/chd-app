import { UserSettingsService } from './lib/notifications';

async function enableNotifications() {
  try {
    console.log('🔧 تفعيل الإشعارات للمستخدم...');
    
    // تفعيل الإشعارات للمستخدم الأول (admin)
    const userId = 'c4a8a45a-1234-5678-9abc-def012345678'; // سيتم تحديثه تلقائياً
    
    const result = await UserSettingsService.updateUserSettings(userId, true);
    
    if (result.success) {
      console.log('✅ تم تفعيل الإشعارات بنجاح!');
      console.log('📋 تفاصيل الإعدادات:', JSON.stringify(result.settings, null, 2));
    } else {
      console.log('❌ فشل في تفعيل الإشعارات:', result.error);
    }
    
  } catch (error) {
    console.error('💥 خطأ في تفعيل الإشعارات:', error);
  }
}

// تشغيل التفعيل
enableNotifications();
