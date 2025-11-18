<template>
  <div class="page-container">
    <div class="messages-layout">
      <!-- Conversations Sidebar -->
      <div class="conversations-sidebar">
        <div class="sidebar-header">
          <h2>Direct Messages</h2>
        </div>
        
        <div class="conversations-list">
          <div 
            v-for="conversation in conversations" 
            :key="conversation.friendId"
            @click="selectConversation(conversation)"
            :class="['conversation-item', { 'active': selectedConversation?.friendId === conversation.friendId }]"
          >
            <div class="conversation-info">
              <div class="friend-name">{{ conversation.friendName }}</div>
              <div class="last-message" v-if="conversation.lastMessage">
                {{ truncateMessage(conversation.lastMessage) }}
              </div>
              <div class="last-message no-messages" v-else>
                Click to start chatting
              </div>
            </div>
            <div class="conversation-meta">
              <div class="timestamp" v-if="conversation.lastMessageTime">
                {{ formatTime(conversation.lastMessageTime) }}
              </div>
              <div class="new-chat-indicator" v-else>
                💬
              </div>
              <div v-if="conversation.hasUnreadMessages" class="unread-badge">
                {{ conversation.unreadCount }}
              </div>
            </div>
          </div>
          
          <div v-if="!conversations.length" class="empty-state">
            No conversations yet. Start chatting with your friends!
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="chat-area">
        <div v-if="!selectedConversation" class="welcome-screen">
          <h2>Select a conversation to start messaging</h2>
        </div>

        <div v-else class="chat-container">
          <!-- Chat Header -->
          <div class="chat-header">
            <h3>{{ selectedConversation.friendName }}#{{ selectedConversation.friendTag }}</h3>
            <div class="header-actions">
              <button class="icon-btn" @click="refreshMessages" title="Refresh">
                🔄
              </button>
            </div>
          </div>

          <!-- Messages Container -->
          <div class="messages-container" ref="messagesContainer">
            <div v-if="loadingMessages" class="loading">Loading messages...</div>
            
            <div 
              v-for="message in messages" 
              :key="message.messageId"
              :class="['message', { 'own-message': message.senderId === currentUserId }]"
            >
              <div class="message-content">
                <div class="message-header" v-if="message.senderId !== currentUserId">
                  <span class="sender-name">{{ message.senderName }}</span>
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                </div>
                <div class="message-text">{{ message.content }}</div>
                <div class="message-footer" v-if="message.senderId === currentUserId">
                  <span class="own-time">{{ formatTime(message.timestamp) }}</span>
                </div>
              </div>
            </div>

            <div v-if="!messages.length && !loadingMessages" class="no-messages">
              This is the beginning of your conversation with {{ selectedConversation.friendName }}.
            </div>
          </div>

          <!-- Message Input -->
          <div class="message-input-container">
            <form @submit.prevent="sendMessage" class="message-form">
              <input
                v-model="newMessage"
                type="text"
                :placeholder="`Message ${selectedConversation.friendName}`"
                class="message-input"
                :disabled="!connected"
              />
              <button 
                type="submit" 
                class="send-button"
                :disabled="!newMessage.trim() || !connected || sending"
              >
                {{ sending ? 'Sending...' : 'Send' }}
              </button>
            </form>
            <div v-if="!connected" class="connection-status">
              Disconnected - Reconnecting...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { getFriends } from '@/utils/api';

const API_BASE_URL = 'http://localhost:8080/api';

export default {
  name: "Messages",
  data() {
    return {
      // Connection state
      stompClient: null,
      connected: false,
      
      // Data
      conversations: [],
      selectedConversation: null,
      messages: [],
      newMessage: '',
      currentUserId: null,
      
      // UI state
      loadingMessages: false,
      sending: false,
      
      // Pagination
      currentPage: 0,
      hasMoreMessages: true,
    };
  },
  
  async mounted() {
    // First get current user ID, then load conversations and connect
    await this.getCurrentUserId();
    await this.loadConversations();
    this.connectWebSocket();
  },
  
  beforeUnmount() {
    this.disconnect();
  },
  
  methods: {
    async loadConversations() {
      try {
        const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        this.conversations = await response.json();
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    },
    
    async selectConversation(conversation) {
      this.selectedConversation = conversation;
      this.messages = [];
      this.currentPage = 0;
      this.hasMoreMessages = true;
      await this.loadMessages();
    },
    
    async loadMessages() {
      if (!this.selectedConversation || this.loadingMessages) return;
      
      this.loadingMessages = true;
      try {
        const response = await fetch(
          `${API_BASE_URL}/chat/messages/${this.selectedConversation.friendId}?page=${this.currentPage}&size=50`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          }
        );
        
        const newMessages = await response.json();
        
        if (this.currentPage === 0) {
          this.messages = newMessages.reverse(); // Reverse to show oldest first
        } else {
          this.messages = [...newMessages.reverse(), ...this.messages];
        }
        
        this.hasMoreMessages = newMessages.length === 50;
        
        if (this.currentPage === 0) {
          this.$nextTick(() => this.scrollToBottom());
        }
        
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        this.loadingMessages = false;
      }
    },
    
    connectWebSocket() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      const socket = new SockJS(`${API_BASE_URL.replace('/api', '')}/ws`);
      this.stompClient = Stomp.over(socket);
      
      this.stompClient.connect(
        { Authorization: `Bearer ${token}` },
        (frame) => {
          this.connected = true;
          console.log('Connected to WebSocket:', frame);
          
          // Subscribe to personal message queue
          this.stompClient.subscribe('/user/queue/messages', (message) => {
            const messageData = JSON.parse(message.body);
            this.handleIncomingMessage(messageData);
          });
          
          // Send add user message
          this.stompClient.send('/app/chat.addUser', {}, JSON.stringify({
            senderEmail: this.getCurrentUserEmail()
          }));
        },
        (error) => {
          console.error('WebSocket connection error:', error);
          this.connected = false;
          // Try to reconnect after 3 seconds
          setTimeout(() => this.connectWebSocket(), 3000);
        }
      );
    },
    
    disconnect() {
      if (this.stompClient && this.connected) {
        this.stompClient.disconnect();
        this.connected = false;
      }
    },
    
    sendMessage() {
      if (!this.newMessage.trim() || !this.connected || !this.selectedConversation) return;
      
      this.sending = true;
      
      const messageData = {
        recipientId: this.selectedConversation.friendId,
        content: this.newMessage.trim(),
        messageType: 'TEXT',
        eventType: 'CHAT',
        senderEmail: this.getCurrentUserEmail()
      };
      
      this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(messageData));
      this.newMessage = '';
      this.sending = false;
    },
    
    handleIncomingMessage(messageData) {
      // Add message to current conversation if it's the active one
      if (this.selectedConversation && 
          (messageData.senderId === this.selectedConversation.friendId || 
           messageData.recipientId === this.selectedConversation.friendId)) {
        this.messages.push(messageData);
        this.$nextTick(() => this.scrollToBottom());
      }
      
      // Update conversations list
      this.updateConversationWithNewMessage(messageData);
    },
    
    updateConversationWithNewMessage(messageData) {
      const friendId = messageData.senderId === this.currentUserId ? 
        messageData.recipientId : messageData.senderId;
      
      const conversation = this.conversations.find(c => c.friendId === friendId);
      if (conversation) {
        conversation.lastMessage = messageData.content;
        conversation.lastMessageTime = messageData.timestamp;
        
        // Update unread count if message is not from current user and not in active chat
        if (messageData.senderId !== this.currentUserId && 
            (!this.selectedConversation || this.selectedConversation.friendId !== friendId)) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
          conversation.hasUnreadMessages = true;
        }
        
        // Move conversation to top
        const index = this.conversations.indexOf(conversation);
        this.conversations.splice(index, 1);
        this.conversations.unshift(conversation);
      }
    },
    
    async refreshMessages() {
      if (this.selectedConversation) {
        this.currentPage = 0;
        await this.loadMessages();
        await this.loadConversations();
      }
    },
    
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    
    getCurrentUserEmail() {
      // You'll need to implement this based on your auth system
      // For now, decode from JWT token
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.sub; // assuming email is stored in 'sub' claim
        } catch (e) {
          console.error('Failed to decode token:', e);
        }
      }
      return null;
    },
    
    async getCurrentUserId() {
      try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        const userData = await response.json();
        this.currentUserId = userData.id;
      } catch (error) {
        console.error('Failed to get current user:', error);
      }
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    },
    
    truncateMessage(message) {
      return message.length > 50 ? message.substring(0, 50) + '...' : message;
    }
  }
};
</script>

<style scoped>
.messages-layout {
  display: flex;
  height: 100%;
}

.conversations-sidebar {
  width: 300px;
  background: #2f3136;
  border-right: 1px solid #202225;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #202225;
}

.sidebar-header h2 {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.conversation-item:hover {
  background: #36393f;
}

.conversation-item.active {
  background: #40444b;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.friend-name {
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}

.last-message {
  color: #72767d;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.last-message.no-messages {
  font-style: italic;
  opacity: 0.8;
}

.conversation-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.timestamp {
  color: #72767d;
  font-size: 11px;
}

.new-chat-indicator {
  color: #5865f2;
  font-size: 14px;
}

.unread-badge {
  background: #ed4245;
  color: #ffffff;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.welcome-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #72767d;
}

.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 12px 20px;
  border-bottom: 1px solid #202225;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #36393f;
}

.chat-header h3 {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.15s ease;
}

.icon-btn:hover {
  background: rgba(79, 84, 92, 0.16);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading, .no-messages {
  text-align: center;
  color: #72767d;
  padding: 20px;
}

.message {
  display: flex;
  margin-bottom: 8px;
  max-width: 100%;
}

.message:not(.own-message) {
  justify-content: flex-start;
}

.message.own-message {
  justify-content: flex-end;
}

.message-content {
  max-width: 70%;
  background: #40444b;
  padding: 8px 12px;
  border-radius: 18px;
  position: relative;
  word-wrap: break-word;
}

.message.own-message .message-content {
  background: #5865f2;
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

.message:not(.own-message) .message-content {
  border-bottom-left-radius: 4px;
}

.message-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}

.sender-name {
  font-weight: 600;
  color: #ffffff;
  font-size: 13px;
}

.message-time {
  color: #a3a6aa;
  font-size: 10px;
}

.message-text {
  color: #dcddde;
  line-height: 1.4;
  word-wrap: break-word;
  font-size: 14px;
}

.message.own-message .message-text {
  color: #ffffff;
}

.message-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 2px;
}

.own-time {
  color: rgba(255, 255, 255, 0.8);
  font-size: 10px;
  text-align: right;
}

.message-input-container {
  padding: 20px;
  background: #40444b;
  border-top: 1px solid #202225;
}

.message-form {
  display: flex;
  gap: 12px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  background: #202225;
  color: #dcddde;
  font-size: 14px;
  outline: none;
}

.message-input:focus {
  background: #1e2124;
}

.send-button {
  background: #5865f2;
  color: #ffffff;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.send-button:hover:not(:disabled) {
  background: #4752c4;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.connection-status {
  color: #ed4245;
  font-size: 12px;
  text-align: center;
  margin-top: 8px;
}

.empty-state {
  text-align: center;
  color: #72767d;
  padding: 40px 20px;
}

/* Scrollbar styling */
.conversations-list::-webkit-scrollbar,
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.conversations-list::-webkit-scrollbar-track,
.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.conversations-list::-webkit-scrollbar-thumb,
.messages-container::-webkit-scrollbar-thumb {
  background: #202225;
  border-radius: 3px;
}

.conversations-list::-webkit-scrollbar-thumb:hover,
.messages-container::-webkit-scrollbar-thumb:hover {
  background: #40444b;
}
</style>