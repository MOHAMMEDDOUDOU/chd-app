import { NotificationService, UserSettingsService } from './lib/notifications';
import { db, notifications, userSettings, users } from './lib/database/config';

async function checkNotifications() {
  try {
    console.log('🔍 فحص الإشعارات في قاعدة البيانات...\n');
    
    // فحص جميع الإشعارات
    const allNotifications = await db.query.notifications.findMany({
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)]
    });
    
    console.log(`📊 إجمالي الإشعارات: ${allNotifications.length}`);
    
    if (allNotifications.length > 0) {
      console.log('\n📋 تفاصيل الإشعارات:');
      allNotifications.forEach((notification, index) => {
        console.log(`\n${index + 1}. إشعار #${notification.id.substring(0, 8)}...`);
        console.log(`   العنوان: ${notification.title}`);
        console.log(`   الرسالة: ${notification.message}`);
        console.log(`   النوع: ${notification.type}`);
        console.log(`   مقروء: ${notification.isRead ? 'نعم' : 'لا'}`);
        console.log(`   التاريخ: ${notification.createdAt.toLocaleString('ar-EG')}`);
      });
    }
    
    // فحص إعدادات المستخدمين
    console.log('\n⚙️ فحص إعدادات المستخدمين...');
    const allSettings = await db.query.userSettings.findMany();
    console.log(`📊 إجمالي إعدادات المستخدمين: ${allSettings.length}`);
    
    if (allSettings.length > 0) {
      console.log('\n📋 تفاصيل الإعدادات:');
      allSettings.forEach((setting, index) => {
        console.log(`\n${index + 1}. إعدادات المستخدم #${setting.userId.substring(0, 8)}...`);
        console.log(`   الإشعارات مفعلة: ${setting.notificationsEnabled ? 'نعم' : 'لا'}`);
        console.log(`   تاريخ الإنشاء: ${setting.createdAt.toLocaleString('ar-EG')}`);
        console.log(`   آخر تحديث: ${setting.updatedAt.toLocaleString('ar-EG')}`);
      });
    }
    
    // فحص المستخدمين
    console.log('\n👥 فحص المستخدمين...');
    const allUsers = await db.query.users.findMany();
    console.log(`📊 إجمالي المستخدمين: ${allUsers.length}`);
    
    if (allUsers.length > 0) {
      console.log('\n📋 تفاصيل المستخدمين:');
      allUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.fullName} (@${user.username})`);
        console.log(`   الدور: ${user.role}`);
        console.log(`   نشط: ${user.isActive ? 'نعم' : 'لا'}`);
        console.log(`   رقم الهاتف: ${user.phoneNumber}`);
      });
    }
    
    // فحص الإشعارات حسب النوع
    console.log('\n📈 إحصائيات الإشعارات حسب النوع:');
    const orderNotifications = allNotifications.filter(n => n.type === 'order');
    const offerNotifications = allNotifications.filter(n => n.type === 'offer');
    const newsNotifications = allNotifications.filter(n => n.type === 'news');
    
    console.log(`   طلبات: ${orderNotifications.length}`);
    console.log(`   عروض: ${offerNotifications.length}`);
    console.log(`   أخبار: ${newsNotifications.length}`);
    
    // فحص الإشعارات غير المقروءة
    const unreadNotifications = allNotifications.filter(n => !n.isRead);
    console.log(`\n📬 الإشعارات غير المقروءة: ${unreadNotifications.length}`);
    
  } catch (error) {
    console.error('💥 خطأ في فحص الإشعارات:', error);
  }
}

// تشغيل الفحص
checkNotifications();
