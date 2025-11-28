import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initializeAuth } from './api/auth'
import './utils/main.css'

const app = createApp(App);

// Initialize auth state before mounting the app
initializeAuth();

app.use(router);

app.mount('#app');