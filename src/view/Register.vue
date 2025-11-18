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
        
        <div class="auth-link">
          <span>Already have an account? <a href="#" @click.prevent="$router.push('/login')">Log in</a></span>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { registerUser } from '@/utils/api'; // Adjust the import path as necessary

export default {
    name: 'Register',
    data() {
        return {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        };
    },
    methods: {
        async handleSubmit() {
            if (this.password !== this.confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            try {
                const response = await registerUser({
                    username: this.username,
                    email: this.email,
                    password: this.password,
                });
                alert('Register email sent');
                console.log(response);
            } catch (error) {
                console.error('Registration failed:', error);
                alert('Registration failed. Please try again.');
            }
        },
    },
};
</script>

<style scoped>
/* Component-specific styles only - global styles are in global.css */
</style>