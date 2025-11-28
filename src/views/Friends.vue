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
            <div class="action-buttons">
              <button class="icon-button delete" @click.stop="openDeleteDialog(friend)" title="Remove Friend">
                ✕
              </button>
            </div>
          </li>
          <li v-if="!allFriends.length" class="empty-state">You don't have any friends yet. Wumpus is sad.</li>
        </ul>

        <!-- Delete Confirmation Dialog -->
        <div v-if="showDeleteDialog" class="dialog-overlay">
          <div class="dialog">
            <h3>Remove Friend</h3>
            <p>Are you sure you want to remove <strong>{{ selectedFriend ? selectedFriend.name : '' }}</strong> from your friends?</p>
            <div class="dialog-buttons">
              <button class="dialog-button cancel" @click="closeDeleteDialog">Cancel</button>
              <button class="dialog-button delete" @click="confirmDelete">Remove</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getFriendRequests, sendFriendRequest, respondToFriendRequest, getFriends, deleteFriend } from '@/api/friends';

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
      showDeleteDialog: false,
      selectedFriend: null,
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
        console.log(this.allFriends);
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
    },

    // Opens the delete confirmation dialog
    openDeleteDialog(friend) {
      this.selectedFriend = friend;
      this.showDeleteDialog = true;
    },

    // Closes the delete confirmation dialog
    closeDeleteDialog() {
      this.showDeleteDialog = false;
      this.selectedFriend = null;
    },

    // Confirms and handles friend removal
    confirmDelete() {
      if (this.selectedFriend) {
        this.handleDeleteFriend(this.selectedFriend.id);
        this.closeDeleteDialog();
      }
    },

    // Handles the actual friend deletion
    async handleDeleteFriend(friendId) {
      try {
        const currentUserId = localStorage.getItem('authToken'); // Assuming you store user ID in localStorage
        if (!currentUserId) {
          throw new Error('User not authenticated');
        }
        
        console.log('Deleting friend with IDs:', { currentUserId, friendId });
        await deleteFriend(currentUserId, friendId);
        
        // Remove the friend from the local list
        this.allFriends = this.allFriends.filter(friend => friend.id !== friendId);
        
        // Show success message
        this.requestStatusMessage = 'Friend removed successfully';
        this.isError = false;
      } catch (error) {
        console.error('Failed to remove friend:', error);
        this.requestStatusMessage = 'Failed to remove friend. Please try again.';
        if (error.response?.data?.message) {
          this.requestStatusMessage = error.response.data.message;
        }
        this.isError = true;
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
  gap: 8px;
  margin-left: auto;
}

.icon-button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  opacity: 0.7;
}

.icon-button:hover {
  opacity: 1;
  transform: scale(1.1);
}

.accept {
  background-color: #3ba55c;
  color: white;
}

.decline, .delete {
  background-color: #ed4245;
  color: white;
}

.accept:hover {
  background-color: #2d7d46;
}

.decline:hover, .delete:hover {
  background-color: #a12d2f;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #72767d;
}

/* Dialog Styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: #36393f;
  border-radius: 8px;
  padding: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  color: #dcddde;
}

.dialog h3 {
  margin: 0 0 16px 0;
  color: #fff;
  font-size: 20px;
  font-weight: 600;
}

.dialog p {
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.dialog-button {
  padding: 10px 16px;
  border: none;
  border-radius: 3px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.17s ease, color 0.17s ease;
}

.dialog-button.cancel {
  background: transparent;
  color: #b9bbbe;
}

.dialog-button.cancel:hover {
  text-decoration: underline;
}

.dialog-button.delete {
  background: #ed4245;
  color: white;
}

.dialog-button.delete:hover {
  background: #a12d2f;
}
</style>