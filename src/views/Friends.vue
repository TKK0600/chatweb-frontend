<template>
  <div class="page-container">
    <div class="page-header">
      <nav class="friends-nav">
        <a href="#" @click.prevent="activeTab = 'all'" :class="{ 'active': activeTab === 'all' }">All Friends</a>
        <a href="#" @click.prevent="activeTab = 'pending'" :class="{ 'active': activeTab === 'pending' }">Pending</a>
      </nav>
    </div>

    <div class="page-content">
      <div class="add-friend-section">
        <h2>ADD FRIEND</h2>
        <p>You can add a friend with their username and tag.</p>
        <form @submit.prevent="handleAddFriend" class="add-friend-form">
          <div class="input-wrapper">
            <input type="text" v-model="addFriendInput" placeholder="Enter a Username#0000" class="discord-input" />
            <button type="submit" class="discord-button" :disabled="isSending">
              {{ isSending ? 'Sending...' : 'Send Friend Request' }}
            </button>
          </div>
        </form>
        <p v-if="requestStatusMessage" :class="isError ? 'error-message' : 'success-message'">
          {{ requestStatusMessage }}
        </p>
      </div>

      <div class="friends-list-section">
        <h2 class="list-title">{{ activeTab === 'pending' ? `PENDING — ${pendingRequests.length}` : `ALL FRIENDS —
          ${allFriends.length}` }}</h2>

        <ul v-if="activeTab === 'pending'" class="friends-list">
          <li v-for="request in pendingRequests" :key="request.requestId" class="friend-item">
            <div class="user-info">
              <span class="username">{{ request.requesterName }}</span>
              <span class="usertag">#{{ request.requesterTag }}</span>
              <span class="status-text">Incoming Friend Request</span>
            </div>
            <div class="action-buttons">
              <button class="icon-button accept" @click="handleResponse(request.requestId, 'ACCEPTED')">✓</button>
              <button class="icon-button decline" @click="handleResponse(request.requestId, 'REJECTED')">✕</button>
            </div>
          </li>
          <li v-if="!pendingRequests.length" class="empty-state">No pending friend requests.</li>
        </ul>

        <ul v-if="activeTab === 'all'" class="friends-list">
          <li v-for="friend in allFriends" :key="friend.id" class="friend-item">
            <div class="user-info">
              <span class="username">{{ friend.name }}</span>
              <span class="usertag">#{{ friend.tag }}</span>
            </div>
          </li>
          <li v-if="!allFriends.length" class="empty-state">You don't have any friends yet. Wumpus is sad.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { getFriendRequests, sendFriendRequest, respondToFriendRequest, getFriends } from '@/utils/api';

export default {
  name: 'Friends',
  data() {
    return {
      activeTab: 'all',
      addFriendInput: '',
      isSending: false,
      requestStatusMessage: '',
      isError: false,
      pendingRequests: [],
      allFriends: [],
    };
  },
  async mounted() {
    // Fetch initial data when the component is loaded
    this.fetchAllData();
  },
  methods: {
    // Fetches both lists
    async fetchAllData() {
      this.fetchPendingRequests();
      this.fetchAllFriends();
    },

    // Fetches pending friend requests
    async fetchPendingRequests() {
      try {
        this.pendingRequests = await getFriendRequests('PENDING');
      } catch (error) {
        console.error('Failed to fetch pending requests:', error);
      }
    },

    // Fetches the list of accepted friends
    async fetchAllFriends() {
      try {
        this.allFriends = await getFriends();
      } catch (error) {
        console.error('Failed to fetch friends list:', error);
      }
    },

    // Handles the submission of the "add friend" form
    async handleAddFriend() {
      if (!this.addFriendInput.includes('#')) {
        this.isError = true;
        this.requestStatusMessage = 'Please enter a valid username and tag (e.g., Wumpus#1234).';
        return;
      }

      const [receiverName, receiverTag] = this.addFriendInput.split('#');

      if (!receiverName || !receiverTag || isNaN(parseInt(receiverTag))) {
        this.isError = true;
        this.requestStatusMessage = 'The format is incorrect. Please use Username#Tag.';
        return;
      }

      this.isSending = true;
      this.isError = false;
      this.requestStatusMessage = '';

      try {
        const response = await sendFriendRequest(receiverName, receiverTag);
        this.isError = false;
        this.requestStatusMessage = response || 'Friend request sent successfully!';
        this.addFriendInput = ''; // Clear input on success
      } catch (error) {
        this.isError = true;
        this.requestStatusMessage = error.message || 'Failed to send friend request. Please try again.';
      } finally {
        this.isSending = false;
      }
    },

    // Handles accepting or rejecting a friend request
    async handleResponse(requestId, action) {
      try {
        await respondToFriendRequest(requestId, action);
        // Refresh both lists to show the updated state
        this.fetchAllData();
      } catch (error) {
        console.error(`Failed to ${action.toLowerCase()} request:`, error);
        alert('There was an error responding to the request.');
      }
    }
  }
};
</script>

<style scoped>
/* NOW, styles are only for things UNIQUE to the Friends page */
.friends-nav {
  display: flex;
  gap: 16px;
}

.friends-nav a {
  padding: 16px 0;
  font-weight: 600;
  color: #b9bbbe;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: all 0.17s ease;
}

.friends-nav a:hover {
  color: #ffffff;
}

.friends-nav a.active {
  color: #ffffff;
  border-bottom-color: #5865f2;
}

.add-friend-section {
  padding-bottom: 20px;
  border-bottom: 1px solid #42454a;
}

.add-friend-section h2 {
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 8px;
  color: #ffffff;
}

.add-friend-section p {
  font-size: 14px;
  color: #b9bbbe;
  margin-bottom: 20px;
}

.add-friend-form .input-wrapper {
  display: flex;
  gap: 10px;
}

.input-wrapper .discord-input {
  /* Minor tweak for this specific layout */
  flex-grow: 1;
}

.input-wrapper .discord-button {
  /* Minor tweak for this specific layout */
  white-space: nowrap;
}

.friends-list-section {
  padding-top: 20px;
}

.list-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #b9bbbe;
  padding-bottom: 10px;
  border-bottom: 1px solid #42454a;
  margin-bottom: 10px;
}

.friends-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.friend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 8px;
  border-radius: 4px;
  transition: background-color 0.1s ease;
}

.friend-item:hover {
  background: #40444b;
}

.user-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.username {
  font-weight: 600;
  color: #ffffff;
}

.usertag {
  font-size: 12px;
  color: #b9bbbe;
}

.status-text {
  margin-left: 12px;
  font-size: 14px;
  color: #b9bbbe;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.icon-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.17s ease;
}

.icon-button.accept {
  background: #3ba55d;
  color: #ffffff;
}

.icon-button.accept:hover {
  background: #2d7d46;
}

.icon-button.decline {
  background: #ed4245;
  color: #ffffff;
}

.icon-button.decline:hover {
  background: #c03639;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #72767d;
}
</style>