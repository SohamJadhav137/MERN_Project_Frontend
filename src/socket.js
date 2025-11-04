import { io } from "socket.io-client";

const user = JSON.parse(localStorage.getItem("user"));

const socket = io("http://localhost:5000", {
    transports: ["websocket"],
    withCredentials: true,
    auth: {
        userId: user?.email,
        username: user?.name
    }
});
window.socket = socket

socket.on("connect", () => {
    console.log(`Connected to server with ID: ${socket.id}`);
});

socket.on("disconnect", () => {
    console.log(`${user?.name} disconnected from server`);
});

socket.on("connect_error", (err) => {
    console.error("❌ Connection error:",err.message);
});


export default socket;