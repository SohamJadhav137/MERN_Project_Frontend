import { io } from "socket.io-client";
import { getCurrentUser } from "./utils/getCurrentUser";

const user = JSON.parse(localStorage.getItem("user"));
const userDetails = getCurrentUser();
const userId = userDetails.id;

const socket = io("http://localhost:5000", {
    transports: ["websocket"],
    withCredentials: true,
    auth: {
        userId: userId,
        username: user?.name
    }
});
window.socket = socket

socket.on("connect", () => {
    console.log(`Frontend connected to server with ID: ${socket.id}`);
    if(userId){
        socket.emit("joinRoom", userId);
        console.log(`${user?.name} has joined fresh room at id:`, userId);
    }
});

socket.on("disconnect", () => {
    console.log(`${user?.name} disconnected from server`);
});

socket.on("connect_error", (err) => {
    console.error("❌ Connection error:",err.message);
});


export default socket;