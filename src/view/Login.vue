<template>
  <div class="auth-container">
    <h1>Welcome back!</h1>
    <p class="subtitle">We're so excited to see you again!</p>
    <div class="auth-card">
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="auth-input-group">
          <label for="email" class="auth-label">EMAIL OR USERNAME</label>
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
import { loginUser } from '@/utils/api'

export default{
    name: 'Login',
    data() {
        return {
            email: '',
            password: ''
        }
    },
    methods: {
        async handleSubmit() {
            try {
                const response = await loginUser({ email: this.email, password: this.password })
                console.log('Login successful:', response)
            } catch (error) {
                console.error('Login failed:', error)
            }
        }
    }
}
</script>

<style scoped>
/* Component-specific styles only - global styles are in global.css */
</style>