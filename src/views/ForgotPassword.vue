<template>
    <div class="auth-container">
        <h1>Forgot your password?</h1>
        <p class="subtitle">Enter your email and we'll send you a reset link.</p>
        <div class="auth-card">
            <form @submit.prevent="submitForm" class="auth-form">
                <div class="auth-input-group">
                    <label for="email" class="auth-label">EMAIL</label>
                    <input type="email" id="email" v-model="email" required class="auth-input" />
                </div>

                <button type="submit" class="auth-button">Send Reset Link</button>
                
                <div class="auth-link">
                    <span>Remembered your password? <a href="#" @click.prevent="$router.push('/login')">Log in</a></span>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { forgotPassword } from '@/utils/api'

export default {
    name: 'ForgotPassword',
    data() {
        return {
            email: ''
        }
    },
    methods: {
        async submitForm() {
            try {
                const response = await forgotPassword(this.email)
                console.log('Password reset link sent:', response)
                // You can add success message handling here
            } catch (error) {
                console.error('Error submitting form:', error)
                // You can add error message handling here
            }
        }
    }
}
</script>

<style scoped>
/* Component-specific styles only - global styles are in global.css */
</style>