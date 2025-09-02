import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  Image, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useUser } from '../lib/userContext';
import { getOrCreateConversation, listMessages, sendMessage } from '../lib/conversations';

interface Props { onClose: () => void; }

const { width: screenWidth } = Dimensions.get('window');

export default function ChatModal({ onClose }: Props) {
  const { user } = useUser();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        // temporary: assume a single admin user exists with role 'admin'
        const adminId = user.id; // replace with real admin id lookup if needed
        const conv = await getOrCreateConversation({ userId: user.id, adminId });
        setConversationId(conv.id);
        const msgs = await listMessages(conv.id, 100, 0);
        setMessages(msgs);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  // Auto-refresh messages
  useEffect(() => {
    if (!conversationId) return;

    const refreshMessages = async () => {
      try {
        const msgs = await listMessages(conversationId, 100, 0);
        setMessages(msgs);
      } catch (error) {
        console.error('Error refreshing messages:', error);
      }
    };

    // Refresh immediately
    refreshMessages();

    // Set up interval to refresh every 3 seconds
    const interval = setInterval(refreshMessages, 3000);

    return () => clearInterval(interval);
  }, [conversationId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !conversationId || !user?.id) return;
    
    const messageText = newMessage.trim();
    setSending(true);
    
    try {
      const msg = await sendMessage({
        conversationId,
        senderId: user.id,
        receiverId: user.id, // replace with real admin id
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
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
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
    if (!conversationId || !user?.id) return;
    
    setSending(true);
    try {
      // In a real app, you would upload the file to a cloud service first
      // For now, we'll simulate with a placeholder URL
      const fileUrl = fileInfo.uri; // This should be the uploaded URL
      
      const msg = await sendMessage({
        conversationId,
        senderId: user.id,
        receiverId: user.id, // replace with real admin id
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
      
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>المحادثة</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>جاري تحميل المحادثة...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Ionicons name="person-circle" size={40} color="#FF6B35" />
          </View>
          <View>
            <Text style={styles.title}>الدعم الفني</Text>
            <Text style={styles.subtitle}>متصل الآن</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        renderItem={renderMessage}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>لا توجد رسائل بعد</Text>
            <Text style={styles.emptySubtext}>ابدأ المحادثة مع فريق الدعم</Text>
          </View>
        }
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
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
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    marginRight: 12,
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1F2937' 
  },
  subtitle: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  closeButton: { 
    padding: 4 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 16, 
    color: '#6B7280' 
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
  avatar: { 
    width: 32, 
    height: 32, 
    borderRadius: 16 
  },
  avatarPlaceholder: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: '#FF6B35', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { 
    color: '#FFFFFF', 
    fontSize: 14, 
    fontWeight: 'bold' 
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


