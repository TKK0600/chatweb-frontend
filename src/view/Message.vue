<template>
  <div>
    <h2>Vue WebSocket Chat Test</h2>
    <input v-model="username" placeholder="Enter username" />
    <button @click="connect">Connect</button>

    <div v-if="connected">
      <input v-model="message" placeholder="Type message..." @keyup.enter="sendMessage" />
      <button @click="sendMessage">Send</button>

      <ul>
        <li v-for="(msg, index) in messages" :key="index">
          {{ msg.sender }}: {{ msg.content }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export default {
  name: "Message",
  data() {
    return {
      username: "",
      message: "",
      messages: [],
      connected: false,
      stompClient: null,
    };
  },
  methods: {
    connect() {
      const socket = new SockJS("http://localhost:8080/ws");
      this.stompClient = Stomp.over(socket);

      this.stompClient.connect({}, () => {
        this.connected = true;
        this.stompClient.subscribe("/topic/public", (msg) => {
          const body = JSON.parse(msg.body);
          this.messages.push(body);
        });

        this.stompClient.send(
          "/app/chat.addUser",
          {},
          JSON.stringify({ sender: this.username, eventType: "JOIN" })
        );
      });
    },
    sendMessage() {
      if (this.message.trim() && this.stompClient) {
        this.stompClient.send(
          "/app/chat.sendMessage",
          {},
          JSON.stringify({ sender: this.username, content: this.message, eventType: "CHAT" })
        );
        this.message = "";
      }
    },
  },
};
</script>
