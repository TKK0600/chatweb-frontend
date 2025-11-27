<template>
    <div class="auth-container">
        <h1>Reset your password</h1>
        <p class="subtitle">Enter your new password below.</p>
        <div class="auth-card">
            <!-- Show error if no token found -->
            <div v-if="!token" class="error-message">
                Invalid or missing reset token. Please check your email link.
            </div>
            
            <!-- Show form only if token exists -->
            <form v-else @submit.prevent="handleSubmit" class="auth-form">
                <div class="auth-input-group">
                    <label for="newPassword" class="auth-label">NEW PASSWORD</label>
                    <input type="password" id="newPassword" v-model="newPassword" required class="auth-input" />
                </div>

                <div class="auth-input-group">
                    <label for="confirmPassword" class="auth-label">CONFIRM NEW PASSWORD</label>
                    <input type="password" id="confirmPassword" v-model="confirmPassword" required class="auth-input" />
                </div>

                <button type="submit" class="auth-button" :disabled="isLoading">
                    {{ isLoading ? 'Resetting...' : 'Reset Password' }}
                </button>
                
                <div class="auth-link">
                    <span>Remember your password? <a href="#" @click.prevent="$router.push('/login')">Log in</a></span>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { resetPassword } from '@/utils/api'

export default {
    name: 'ResetPassword',
    data() {
        return {
            token: '',
            newPassword: '',
            confirmPassword: '',
            isLoading: false
        }
    },
    mounted() {
        // Extract token from URL query parameters when component mounts
        this.token = this.$route.query.token || '';
        
        // If no token in query, check if it's in the path
        if (!this.token) {
            // For URLs like /reset-password/token-here
            this.token = this.$route.params.token || '';
        }
        
        console.log('Token extracted from URL:', this.token);
    },
    methods: {
        async handleSubmit() {
            if (this.newPassword !== this.confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            if (this.newPassword.length < 6) {
                alert('Password must be at least 6 characters long!');
                return;
            }

            this.isLoading = true;

            try {
                const response = await resetPassword(this.token, this.newPassword);
                console.log('Password reset successful:', response);
                
                alert('Password reset successfully! You will be redirected to login.');
                this.$router.push('/login');
            } catch (error) {
                console.error('Error resetting password:', error);
                alert('Failed to reset password. Please try again or request a new reset link.');
            } finally {
                this.isLoading = false;
            }
        }
    }
}
</script>

<style scoped>
/* Component-specific styles only - global styles are in global.css */
</style>