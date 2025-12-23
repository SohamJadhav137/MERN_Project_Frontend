import { io } from "socket.io-client";
import { getCurrentUser } from "./utils/getCurrentUser";

let socket = null;

export const getSocket = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userDetails = getCurrentUser();
    const userId = userDetails?.id;

    // No socket connection for unauthenticated user
    if (!userId) {
        console.log("No user token. Skipping socket io setup...")
        return null;
    }

    // If socket connection doesn't exists then create one.
    // This ensures same socket instance is used subsequently
    // instead of creating new each time.

    if (!socket) {
        socket = io("http://localhost:5000", {
            transports: ["websocket"], // FORCING websocket protocol (NO POLLING)
            withCredentials: true,
            auth: { // Attach user identity during handshake
                userId: userId,
                username: user?.username
            }
        });
        
        // Inspect socket in console
        window.socket = socket

        socket.on("connect", () => {
            console.log(`Frontend connected to server with ID: ${socket.id}`);
            if (userId) {
                socket.emit("joinRoom", userId);
                console.log(`${user?.username} has joined fresh room at id:`, userId);
            }
        });

        socket.on("disconnect", () => {
            console.log(`${user?.username} disconnected from server`);
        });

        socket.on("connect_error", (err) => {
            console.error("❌ Connection error:", err.message);
        });
    }
    return socket;
}

export default socket;