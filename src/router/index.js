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
    },
    {
        path: '/friends',
        name: 'Friends',
        component: () => import('../view/Friends.vue'),
        beforeEnter: (to, from, next) => {
            // This is a simple route guard. It checks for the auth token.
            if (localStorage.getItem('authToken')) {
                next(); // User is authenticated, proceed.
            } else {
                next('/login'); // User is not authenticated, redirect to login.
            }
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;