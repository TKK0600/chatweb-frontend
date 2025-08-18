import { createRouter, createWebHistory } from 'vue-router';
import Home from '../view/Home.vue';
import Register from '../view/Register.vue';
import Login from '../view/Login.vue';


const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/Register',
        name: 'Register',
        component: Register
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: () => import('../view/ForgotPassword.vue')
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: () => import('../view/ResetPassword.vue')
    },
    {
        path: '/message',
        name: 'Message',
        component: () => import('../view/Message.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;