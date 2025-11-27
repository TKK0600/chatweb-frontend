import { createRouter, createWebHistory } from 'vue-router';
import Register from '../views/Register.vue';
import Login from '../views/Login.vue';
import Callback from '../views/Callback.vue';

const routes = [
    {
        path: '/',
        redirect: '/login'
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
        component: () => import('../views/ForgotPassword.vue')
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: () => import('../views/ResetPassword.vue')
    },
    {
        path: '/message',
        name: 'Message',
        component: () => import('../views/Message.vue')
    },
    {
        path: '/friends',
        name: 'Friends',
        component: () => import('../views/Friends.vue'),
        beforeEnter: (to, from, next) => {
            // This is a simple route guard. It checks for the auth token.
            if (localStorage.getItem('authToken')) {
                next(); // User is authenticated, proceed.
            } else {
                next('/login'); // User is not authenticated, redirect to login.
            }
        }
    },
    {
        path: '/auth/callback',
        name: 'Callback',
        component: Callback
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;