<template>
  <div id="app">
    <header class="discord-header">
      <nav class="discord-nav">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/login" class="nav-link">Login</router-link>
        <router-link to="/register" class="nav-link">Register</router-link>
        <router-link to="/message" class="nav-link">Messages</router-link>
      </nav>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<style></style>