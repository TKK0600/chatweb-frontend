<template>
  <div class="callback-container">
    <p>Processing login...</p>
  </div>
</template>

<script>
import { setAuthState } from '@/utils/auth';

export default {
  name: 'Callback',
  mounted() {
    this.handleCallback();
  },
  methods: {
    handleCallback() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
          console.log('Token received in Callback component:', token);
          localStorage.setItem('authToken', token);
          setAuthState(true);
          
          // Clean the URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Redirect to friends page
          this.$router.push('/friends');
        } else {
          console.error('No token found in URL');
          this.$router.push('/login');
        }
      } catch (error) {
        console.error('Error in callback:', error);
        this.$router.push('/login');
      }
    }
  }
};
</script>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
}
</style>
