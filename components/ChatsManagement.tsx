import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Dimensions,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useUser } from '../lib/userContext';
import { listAdminConversations, listMessages, sendMessage, getOrCreateAdminConversation } from '../lib/conversations';

interface Props { onClose: () => void; }

const { width: screenWidth } = Dimensions.get('window');

export default function ChatsManagement(_: Props) {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [imageErrorByUserId, setImageErrorByUserId] = useState<Record<string, boolean>>({});
  const [messagesOffset, setMessagesOffset] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
      loadConversations();
  }, []);

  // Auto-refresh messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation?.id) return;

    const refreshMessages = async () => {
      try {
        setLoadingMessages(true);
        // تحميل الرسائل القديمة (آخر 200 رسالة)
        const msgs = await listMessages(selectedConversation.id, 200, 0);
        setMessages(msgs);
      } catch (error) {
        console.error('Error refreshing messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    // Refresh immediately
    refreshMessages();

    // Set up interval to refresh every 5 seconds
    const interval = setInterval(refreshMessages, 5000);

    return () => clearInterval(interval);
  }, [selectedConversation?.id]);

  // Auto-refresh conversations list
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const refreshConversations = async () => {
      try {
        const rows = await listAdminConversations(user.id);
        const sanitize = (url?: string | null) => typeof url === 'string' ? url.trim() : null;
        const data = rows.map((r: any) => ({
          ...r,
          profileImageUrl: sanitize(r.profileImageUrl)
        }));
        // Float unread to top; keep alpha order inside groups
        const sorted = [...data].sort((a, b) => {
          const au = a.unreadCount || 0;
          const bu = b.unreadCount || 0;
          if (au !== bu) return bu - au; // unread first
          const an = (a.fullName || a.username || '').localeCompare(b.fullName || b.username || '');
          return an;
        });
        setConversations(sorted);
      } catch (error) {
        console.error('Error refreshing conversations:', error);
      }
    };

    // Refresh immediately
    refreshConversations();

    // Set up interval to refresh every 10 seconds
    const interval = setInterval(refreshConversations, 10000);

    return () => clearInterval(interval);
  }, [user?.id]);

  const loadConversations = async () => {
    if (!user || user.role !== 'admin') { 
      setError('غير مصرح'); 
      setLoading(false); 
      return; 
    }
    
    setLoading(true);
    try {
      const rows = await listAdminConversations(user.id);
      const sanitize = (url?: string | null) => typeof url === 'string' ? url.trim() : null;
      const data = rows.map((r: any) => ({
        ...r,
        profileImageUrl: sanitize(r.profileImageUrl)
      }));
      const sorted = [...data].sort((a, b) => {
        const au = a.unreadCount || 0;
        const bu = b.unreadCount || 0;
        if (au !== bu) return bu - au;
        const an = (a.fullName || a.username || '').localeCompare(b.fullName || b.username || '');
        return an;
      });
      setConversations(sorted);
    } catch (e) {
      setError('فشل في تحميل المحادثات');
    } finally {
      setLoading(false);
    }
  };

  const openConversation = async (userData: any) => {
    setSelectedConversation(userData);
    setShowChatModal(true);
    setMessages([]);
    setMessagesOffset(0);
    setHasMoreMessages(true);
    setLoadingMessages(true);
    
    try {
      // Use existing conversation or create new one
      const conv = await getOrCreateAdminConversation({
        userId: userData.userId,
        adminId: user!.id
      });
      
      // Update selected conversation with the actual conversation data
      setSelectedConversation({
        ...userData,
        id: conv.id
      });
      
      // Load messages for this conversation (آخر 100 رسالة)
      const pageSize = 50;
      const msgs = await listMessages(conv.id, pageSize, 0);
      setMessages(msgs);
      setMessagesOffset(msgs.length);
      setHasMoreMessages(msgs.length === pageSize);
      
      // Update conversation in list if it was newly created
      if (!userData.conversationId) {
        setConversations(prev => prev.map(conv => 
          conv.userId === userData.userId 
            ? { ...conv, conversationId: conv.id }
            : conv
        ));
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحميل الرسائل');
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadOlderMessages = async () => {
    if (!selectedConversation?.id || loadingMessages || !hasMoreMessages) return;
    setLoadingMessages(true);
    try {
      const pageSize = 50;
      const older = await listMessages(selectedConversation.id, pageSize, messagesOffset);
      // Prepend older messages
      setMessages(prev => [...older, ...prev]);
      setMessagesOffset(prev => prev + older.length);
      if (older.length < pageSize) setHasMoreMessages(false);
    } catch (e) {
      // noop
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation?.id || !user?.id) return;
    
    const messageText = newMessage.trim();
    setSending(true);
    
    try {
      const msg = await sendMessage({
        conversationId: selectedConversation.id,
        senderId: user.id,
        receiverId: selectedConversation.userId,
        messageType: 'text',
        messageContent: messageText,
      });
      
      // Add message to local state immediately
      setMessages(prev => [...prev, { 
        ...msg, 
        sender: { 
          id: user.id, 
          fullName: user.fullName, 
          username: user.username, 
          profileImageUrl: user.profileImageUrl 
        } 
      }]);
      
      setNewMessage('');
      
      // Update conversation in list immediately
      setConversations(prev => prev.map(conv => 
        conv.userId === selectedConversation.userId 
          ? { 
              ...conv, 
              lastMessage: messageText, 
              lastMessageAt: new Date(),
              conversationId: conv.conversationId || selectedConversation.id 
            }
              : conv
      ));
    } finally {
      setSending(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        await sendFileMessage({
          uri: asset.uri,
          type: 'image',
          fileName: `image_${Date.now()}.jpg`,
          fileSize: asset.fileSize || 0,
        });
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل في اختيار الصورة');
    }
  };

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        await sendFileMessage({
          uri: asset.uri,
          type: 'video',
          fileName: `video_${Date.now()}.mp4`,
          fileSize: asset.fileSize || 0,
          duration: asset.duration || 0,
        });
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل في اختيار الفيديو');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        await sendFileMessage({
          uri: asset.uri,
          type: 'file',
          fileName: asset.name,
          fileSize: asset.size || 0,
        });
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل في اختيار الملف');
    }
  };

  const sendFileMessage = async (fileInfo: {
    uri: string;
    type: 'image' | 'video' | 'file';
    fileName: string;
    fileSize: number;
    duration?: number;
  }) => {
    if (!selectedConversation?.id || !user?.id) return;
    
    setSending(true);
    try {
      const fileUrl = fileInfo.uri;
      
      const msg = await sendMessage({
        conversationId: selectedConversation.id,
        senderId: user.id,
        receiverId: selectedConversation.userId,
        messageType: fileInfo.type,
        messageContent: fileInfo.fileName,
        fileUrl,
        fileName: fileInfo.fileName,
        fileSize: fileInfo.fileSize,
        duration: fileInfo.duration,
      });
      
      // Add message to local state immediately
      setMessages(prev => [...prev, { 
        ...msg, 
        sender: { 
          id: user.id, 
          fullName: user.fullName, 
          username: user.username, 
          profileImageUrl: user.profileImageUrl 
        } 
      }]);
      
      // Update conversation in list immediately
      let lastMessageText = '';
      switch (fileInfo.type) {
        case 'image':
          lastMessageText = '📷 صورة';
          break;
        case 'video':
          lastMessageText = '🎥 فيديو';
          break;
        case 'file':
          lastMessageText = '📎 ملف';
          break;
        default:
          lastMessageText = '📎 مرفق';
      }
      
      setConversations(prev => prev.map(conv => 
        conv.userId === selectedConversation.userId 
          ? { 
              ...conv, 
              lastMessage: lastMessageText, 
              lastMessageAt: new Date(),
              conversationId: conv.conversationId || selectedConversation.id 
            }
          : conv
      ));
    } finally {
      setSending(false);
      setShowAttachments(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMine = item.senderId === user?.id;
    
    const renderMessageContent = () => {
      switch (item.messageType) {
        case 'image':
          return (
            <View style={styles.mediaContainer}>
              <Image source={{ uri: item.fileUrl }} style={styles.mediaImage} />
            </View>
          );
        
        case 'video':
          return (
            <View style={styles.mediaContainer}>
              <Image source={{ uri: item.thumbnailUrl || item.fileUrl }} style={styles.mediaImage} />
              <View style={styles.videoOverlay}>
                <Ionicons name="play-circle" size={40} color="#FFFFFF" />
              </View>
              {item.duration && (
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
                </View>
              )}
            </View>
          );
        
        case 'file':
          return (
            <View style={styles.fileContainer}>
              <Ionicons name="document" size={24} color={isMine ? "#FFFFFF" : "#FF6B35"} />
              <View style={styles.fileInfo}>
                <Text style={[styles.fileName, isMine ? styles.myMessageText : styles.otherMessageText]}>
                  {item.fileName}
                </Text>
                {item.fileSize && (
                  <Text style={[styles.fileSize, isMine ? styles.myMessageText : styles.otherMessageText]}>
                    {formatFileSize(item.fileSize)}
                  </Text>
                )}
              </View>
            </View>
          );
        
        default:
          return (
            <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.otherMessageText]}>
              {item.messageContent}
            </Text>
          );
      }
    };
    
    return (
      <View style={[styles.messageContainer, isMine ? styles.myMessage : styles.otherMessage]}>
        {!isMine && (
          <View style={styles.avatarContainer}>
            {item.sender?.profileImageUrl ? (
              <Image source={{ uri: item.sender.profileImageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {item.sender?.fullName?.charAt(0) || item.sender?.username?.charAt(0) || '?'}
                </Text>
              </View>
            )}
          </View>
        )}
        
        <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.otherBubble]}>
          {renderMessageContent()}
          <Text style={[styles.messageTime, isMine ? styles.myMessageTime : styles.otherMessageTime]}>
            {new Date(item.createdAt).toLocaleTimeString('ar-SA', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

  const renderConversation = ({ item }: { item: any }) => {
    const hasActivity = Boolean(item.lastMessageAt);
    const count = item.messageCount || 0;
    return (
      <TouchableOpacity 
        style={styles.conversationRow} 
        onPress={() => openConversation(item)}
        activeOpacity={0.85}
      >
        <View style={styles.conversationAvatar}>
          <LinearGradient
            colors={hasActivity ? ['#F58529', '#DD2A7B', '#8134AF', '#515BD4'] : ['#E5E7EB', '#E5E7EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarRing}
          >
            {item.profileImageUrl && !imageErrorByUserId[item.userId] ? (
              <Image 
                source={{ uri: item.profileImageUrl }} 
                style={styles.avatar}
                resizeMode="cover"
                onError={() => setImageErrorByUserId(prev => ({ ...prev, [item.userId]: true }))}
              />
            ) : (
              <View style={styles.avatarPlaceholderInset}>
                <Text style={styles.avatarInsetText}>
                  {item.fullName?.charAt(0) || item.username?.charAt(0) || '?'}
                </Text>
              </View>
            )}
          </LinearGradient>
          {count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count > 99 ? '99+' : String(count)}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {item.fullName || item.username}
            </Text>
            <Text style={styles.conversationTime}>
              {item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString('ar-SA', { 
                hour: '2-digit',
                minute: '2-digit'
              }) : 'جديد'}
            </Text>
          </View>
          <Text style={styles.conversationLastMessage} numberOfLines={1}>
            {item.lastMessage || 'لم يبدأ المحادثة بعد'}
          </Text>
          <View style={styles.conversationFooter}>
            <Text style={styles.conversationUserId} numberOfLines={1}>
              معرف المستخدم: {item.userId}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>المحادثات</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>جاري تحميل المحادثات...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>المحادثات</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>المحادثات</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.userId}
        renderItem={renderConversation}
        style={styles.conversationsList}
        contentContainerStyle={conversations.length === 0 ? styles.conversationsEmptyContent : undefined}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>لا يوجد مستخدمون</Text>
            <Text style={styles.emptySubtext}>ستظهر قائمة المستخدمين هنا عند تسجيلهم في التطبيق</Text>
          </View>
        }
      />

      {/* Chat Modal */}
      <Modal
        visible={showChatModal}
        animationType="slide"
        presentationStyle="fullScreen"
        transparent={false}
        statusBarTranslucent={false}
      >
        <KeyboardAvoidingView style={styles.chatContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setShowChatModal(false)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#666" />
            </TouchableOpacity>
            
            <View style={styles.chatHeaderInfo}>
              <View style={styles.chatHeaderAvatar}>
                {selectedConversation?.profileImageUrl ? (
                  <Image source={{ uri: selectedConversation.profileImageUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {selectedConversation?.fullName?.charAt(0) || selectedConversation?.username?.charAt(0) || '?'}
                    </Text>
                  </View>
                )}
              </View>
              <View>
                <Text style={styles.chatTitle}>
                  {selectedConversation?.fullName || selectedConversation?.username}
                </Text>
                <Text style={styles.chatSubtitle}>متصل الآن</Text>
              </View>
            </View>
          </View>

          {loadingMessages && (
            <View style={styles.loadingMessagesContainer}>
              <ActivityIndicator size="small" color="#FF6B35" />
              <Text style={styles.loadingMessagesText}>جاري تحميل الرسائل...</Text>
            </View>
          )}
          
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContainer}
            renderItem={renderMessage}
            ListHeaderComponent={
              hasMoreMessages ? (
                <TouchableOpacity onPress={loadOlderMessages} style={styles.loadMoreBtn}>
                  <Text style={styles.loadMoreText}>{loadingMessages ? '...' : 'تحميل رسائل أقدم'}</Text>
                </TouchableOpacity>
              ) : null
            }
            ListEmptyComponent={
              !loadingMessages && (
                <View style={styles.emptyChatContainer}>
                  <Ionicons name="chatbubble-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyChatText}>لا توجد رسائل بعد</Text>
                  <Text style={styles.emptyChatSubtext}>ابدأ المحادثة مع المستخدم</Text>
                </View>
              )
            }
          />

          {showAttachments && (
            <View style={styles.attachmentsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity style={styles.attachmentButton} onPress={pickImage}>
                  <Ionicons name="image" size={24} color="#FF6B35" />
                  <Text style={styles.attachmentText}>صورة</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachmentButton} onPress={pickVideo}>
                  <Ionicons name="videocam" size={24} color="#FF6B35" />
                  <Text style={styles.attachmentText}>فيديو</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachmentButton} onPress={pickDocument}>
                  <Ionicons name="document" size={24} color="#FF6B35" />
                  <Text style={styles.attachmentText}>ملف</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={styles.attachmentToggle} 
              onPress={() => setShowAttachments(!showAttachments)}
            >
              <Ionicons name="add" size={24} color="#FF6B35" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="اكتب رسالتك هنا..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
            />
            
            <TouchableOpacity 
              onPress={handleSend} 
              disabled={!newMessage.trim() || sending} 
              style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF' 
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937' 
  },
  closeButton: {
    padding: 4 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center' 
  },
  conversationsList: {
    flex: 1,
  },
  conversationsEmptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280' 
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    borderRadius: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  conversationAvatar: {
    marginRight: 12,
    position: 'relative',
  },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  conversationTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  conversationLastMessage: {
    fontSize: 14,
    color: '#6B7280',
  },
  conversationUserId: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  messageCount: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
  },
  avatar: { 
    width: 52, 
    height: 52, 
    borderRadius: 26 
  },
  avatarPlaceholder: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: '#FF6B35', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarPlaceholderInset: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarInsetText: {
    color: '#374151',
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatarText: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 40 
  },
  emptyText: { 
    marginTop: 12, 
    fontSize: 16, 
    color: '#6B7280', 
    fontWeight: '600' 
  },
  emptySubtext: { 
    marginTop: 4, 
    fontSize: 14, 
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingMessagesContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMessagesText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  
  // Chat Modal Styles
  chatContainer: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  chatHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB', 
    backgroundColor: '#FFFFFF' 
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatHeaderAvatar: {
    marginRight: 12,
  },
  chatTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1F2937' 
  },
  chatSubtitle: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  messagesList: { 
    flex: 1 
  },
  messagesContainer: { 
    padding: 16 
  },
  messageContainer: { 
    flexDirection: 'row', 
    marginBottom: 16, 
    alignItems: 'flex-end' 
  },
  myMessage: { 
    justifyContent: 'flex-end' 
  },
  otherMessage: { 
    justifyContent: 'flex-start' 
  },
  avatarContainer: { 
    marginRight: 8 
  },
  messageBubble: { 
    maxWidth: '75%', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 20 
  },
  myBubble: { 
    backgroundColor: '#FF6B35',
    borderBottomRightRadius: 4 
  },
  otherBubble: { 
    backgroundColor: '#FFFFFF', 
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loadMoreBtn: {
    alignSelf: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  loadMoreText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  messageText: { 
    fontSize: 14, 
    lineHeight: 20 
  },
  myMessageText: { 
    color: '#FFFFFF' 
  },
  otherMessageText: { 
    color: '#1F2937' 
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  myMessageTime: {
    color: '#FFFFFF',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#6B7280',
    textAlign: 'left',
  },
  mediaContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaImage: {
    width: screenWidth * 0.5,
    height: screenWidth * 0.4,
    borderRadius: 12,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  fileInfo: {
    marginLeft: 8,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    opacity: 0.8,
  },
  emptyChatContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40 
  },
  emptyChatText: { 
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600' 
  },
  emptyChatSubtext: { 
    marginTop: 4, 
    fontSize: 14, 
    color: '#9CA3AF' 
  },
  attachmentsContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 12,
  },
  attachmentButton: {
    alignItems: 'center',
    marginHorizontal: 16,
    paddingVertical: 8,
  },
  attachmentText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    padding: 16, 
    borderTopWidth: 1, 
    borderTopColor: '#E5E7EB', 
    backgroundColor: '#FFFFFF' 
  },
  attachmentToggle: {
    padding: 8,
    marginRight: 8,
  },
  textInput: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    marginRight: 8, 
    fontSize: 14,
    color: '#1F2937', 
    maxHeight: 100,
    backgroundColor: '#F9FAFB',
  },
  sendButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#FF6B35', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  sendButtonDisabled: { 
    backgroundColor: '#D1D5DB' 
  },
});


