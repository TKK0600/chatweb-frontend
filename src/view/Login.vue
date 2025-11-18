<template>
  <div class="auth-container">
    <h1>Welcome back!</h1>
    <p class="subtitle">We're so excited to see you again!</p>
    <div class="auth-card">
      <form @submit.prevent="handleSubmit" class="auth-form">

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

        <div class="auth-input-group">
          <label for="email" class="auth-label">EMAIL</label>
          <input type="email" id="email" v-model="email" required class="auth-input" />
        </div>

        <div class="auth-input-group">
          <label for="password" class="auth-label">PASSWORD</label>
          <input type="password" id="password" v-model="password" required class="auth-input" />
        </div>

        <div class="forgot-password">
          <a href="#" @click.prevent="$router.push('/forgot-password')">Forgot your password?</a>
        </div>

        <button type="submit" class="auth-button">Log In</button>

        <div class="auth-link">
          <span>Need an account? <a href="#" @click.prevent="$router.push('/register')">Register</a></span>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { loginUser } from '@/utils/api';
import { setAuthState } from '@/utils/auth';

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '' // Add a data property for error messages
    };
  },
  methods: {
    async handleSubmit() {
      this.errorMessage = ''; // Clear previous errors
      try {
        const response = await loginUser({ email: this.email, password: this.password });
        localStorage.setItem('authToken', response.token);
        console.log('Login successful, token stored.');
        setAuthState(true);
        this.$router.push('/friends');
      } catch (error) {
        console.error('Login failed:', error);
        // Display the specific error message from the backend
        this.errorMessage = error.message || 'Invalid email or password. Please try again.';
      }
    }
  }
};
</script>

<style scoped>
/* Your component-specific styles here */
</style>