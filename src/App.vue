<template>
  <div id="app">
    <header class="discord-header">
      <nav class="discord-nav">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link v-if="auth.isAuthenticated" to="/message" class="nav-link">Messages</router-link>

        <router-link v-if="auth.isAuthenticated" to="/friends" class="nav-link">Friends</router-link>

        <div v-if="!auth.isAuthenticated" class="nav-auth-links">
          <router-link to="/login" class="nav-link">Login</router-link>
          <router-link to="/register" class="nav-link">Register</router-link>
        </div>

        <div v-else class="user-dropdown">
          <button @click="toggleDropdown" class="username-button">
            My Account </button>
          <div v-if="isDropdownOpen" class="dropdown-menu">
            <a href="#" @click.prevent="handleLogout" class="dropdown-item">Logout</a>
          </div>
        </div>
      </nav>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import { authState, setAuthState } from '@/utils/auth';

export default {
  data() {
    return {
      isDropdownOpen: false,
      auth: authState // Directly reference authState for reactivity
    };
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    handleLogout() {
      // Close dropdown
      this.isDropdownOpen = false;
      
      // Remove token and update auth state
      localStorage.removeItem('authToken');
      setAuthState(false);
      
      // Force page refresh and redirect to login
      window.location.href = '/login';
    }
  },
  mounted() {
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$el.querySelector('.user-dropdown').contains(e.target)) {
        this.isDropdownOpen = false;
      }
    });
  }
};
</script>

<style>
/* Navigation styles */
.nav-auth-links {
  display: flex;
  gap: 24px;
}

.user-dropdown {
  position: relative;
  margin-left: auto;
}

.username-button {
  background: none;
  border: none;
  color: #b9bbbe;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.17s ease;
}

.username-button:hover {
  color: #ffffff;
  background: rgba(79, 84, 92, 0.16);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #2f3136;
  border: 1px solid #202225;
  border-radius: 4px;
  padding: 8px;
  min-width: 150px;
  z-index: 1001;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.24);
}

.dropdown-item {
  display: block;
  padding: 8px 12px;
  color: #b9bbbe;
  text-decoration: none;
  border-radius: 3px;
  transition: all 0.15s ease;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #ed4245;
  color: #ffffff;
}

/* Make sure the dropdown closes when clicking outside */
.dropdown-menu::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
}
</style>