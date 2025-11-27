<template>
  <div class="auth-container">
    <h1>Create an account</h1>
    <div class="auth-card">
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="auth-input-group">
          <label for="username" class="auth-label">USERNAME</label>
          <input type="text" id="username" v-model="username" required class="auth-input" />
        </div>

        <div class="auth-input-group">
          <label for="email" class="auth-label">EMAIL</label>
          <input type="email" id="email" v-model="email" required class="auth-input" />
        </div>
        <div class="auth-input-group">
          <label for="password" class="auth-label">PASSWORD</label>
          <input type="password" id="password" v-model="password" required class="auth-input" />
        </div>

        <div class="auth-input-group">
          <label for="confirmPassword" class="auth-label">CONFIRM PASSWORD</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" required class="auth-input" />
        </div>

        <button type="submit" class="auth-button">Continue</button>

        <div class="auth-divider">
          <span>OR</span>
        </div>

        <button type="button" @click="loginWithGoogle" class="auth-button google-button">
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4" />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853" />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05" />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div class="auth-link">
          <span>Already have an account? <a href="#" @click.prevent="$router.push('/login')">Log in</a></span>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { registerUser, loginUser } from '@/utils/api';
import { setAuthState } from '@/utils/auth';

export default {
  name: 'Register',
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      errorMessage: ''
    };
  },
  methods: {
    loginWithGoogle() {
      window.location.href = "http://localhost:8080/oauth2/authorization/google";
    },

    async handleSubmit() {
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match!';
        return;
      }

      try {
        // First, register the user
        await registerUser({
          username: this.username,
          email: this.email,
          password: this.password,
        });

        // If registration is successful, automatically log the user in
        try {
          const response = await loginUser({
            email: this.email,
            password: this.password
          });

          // Store the token and update auth state
          localStorage.setItem('authToken', response.token);
          setAuthState(true);

          // Redirect to the friends page
          this.$router.push('/friends');
        } catch (loginError) {
          console.error('Auto-login after registration failed:', loginError);
          // If auto-login fails, redirect to login page
          this.$router.push('/login');
        }
      } catch (error) {
        console.error('Registration failed:', error);
        this.errorMessage = error.message || 'Registration failed. Please try again.';
      }
    },
  },
};
</script>

<style scoped>
/* Component-specific styles only - global styles are in global.css */
.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: #72767d;
  font-size: 0.875rem;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #36393f;
}

.auth-divider::before {
  margin-right: 1rem;
}

.auth-divider::after {
  margin-left: 1rem;
}

.google-button {
  background-color: #ffffff;
  color: #000000;
  border: 1px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 1rem;
}

.google-button:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.google-button svg {
  margin-right: 8px;
}
</style>