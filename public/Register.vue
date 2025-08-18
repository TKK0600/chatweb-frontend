<template>
    <h1>Register</h1>

    <body>
        <form @submit.prevent="handleSubmit">
            <label for="username">Username:</label>
            <input type="text" id="username" v-model="username" required>

            <label for="email">Email:</label>
            <input type="email" id="email" v-model="email" required>

            <label for="password">Password:</label>
            <input type="password" id="password" v-model="password" required>

            <label for="confirmPassword">Confirm Password:</label>
            <input type="password" id="confirmPassword" v-model="confirmPassword" required>

            <button type="submit">Register</button>
        </form>
    </body>
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
            handleSubmit,
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
                alert('Registration successful!');
                console.log(response);
            } catch (error) {
                console.error('Registration failed:', error);
                alert('Registration failed. Please try again.');
            }
        },
    },
};
</script>