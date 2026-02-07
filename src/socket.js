import { io } from "socket.io-client";
import API_BASE_URL from './utils/api';
import { getCurrentUser } from "./utils/getCurrentUser";

let socket = null;

export const createSocket = ({ userId, username }) => {
    if (socket) return socket;

    socket = io(API_BASE_URL, {
        transports: ['websocket'],
        withCredentials: true,
        auth: {
            userId,
            username
        },
        reconnectionAttempts: 5
    })
    console.log("user id:", userId)

    socket.on("connect", () => {
        console.log(`Frontend connected to server with ID: ${socket.id}`);
        if (userId) {
            socket.emit("join-user-room");
            console.log(`${username} has joined USER room at its own id:`, userId);
        }
    });

    socket.on("disconnect", () => {
        console.log(`Frontend disconnected from server`);
    });

    socket.on("connect_error", (err) => {
        console.error("❌ Connection error:", err.message);
    });

    return socket;
}

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if(socket){
        socket.disconnect();
        socket = null;
    }
};