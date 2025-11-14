import React, { useEffect, useState } from 'react'

import './ChatWindow.scss'
import Message from '../../../Components/Messages/Message'
import socket from '../../../socket';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUser } from '../../../utils/getCurrentUser';

export default function ChatWindow({ conversationId }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // const userString = localStorage.getItem("user");
  // const userObject = userString ? JSON.parse(userString) : {}
  // const currentUser = {
  //   userId: userObject.email,
  //   name: userObject.name,
  //   role: userObject.role
  // };

  const sender = getCurrentUser();
  const senderId = sender?.id;

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const parsedUserData = JSON.parse(user);
  const currentUser = parsedUserData?.name;

  useEffect(() => {
    if(!conversationId) return;

    const fetchMessages = async (token) => {
      try {
        
        const response = await fetch(`http://localhost:5000/api/messages/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if(response.ok){
          const data = await response.json();
          setMessages(data);
        }
        else{
          console.error("BACKEND RESPONSE ERROR:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch messages for provided conversation ID:", error);
      }
    }

    fetchMessages(token);

  }, [conversationId]);

  useEffect(() => {
    if(conversationId){
      socket.emit("join_conversation", conversationId);
      console.log("Frontend joined conversation at ID:",conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    const receiveMessageHandler = (data) => {
      console.log("Received Message:\n", data);
      console.log(`From: ${data.username}\nMessage: ${data.text}`);
      setMessages((prev) => [...prev, data]);
    }

    socket.on("receive_message", receiveMessageHandler);
    
    return () => {
      socket.off("receive_message", receiveMessageHandler);
    };
  }, []);
  
  const handleSend = async () => {
    if(!message.trim()) return;
    
    // Some new data to be sent from client
    const msgToSend = {
      conversationId,
      senderId,
      text: message,
      currentUser
    };    
    
    socket.emit("send_message", msgToSend);
    
    setMessage("");
  };
  // console.log("Messages:\n",messages);

  const submitKeyHandler = (e) => {
    if(e.key === 'Enter'){
      handleSend();
    }
  }

  return (
    <div className='chat-window'>
      <div className='messages-list'>
        {
          messages.map((m, i) => (
            <Message key={i} msg={m.text} info={ m.senderId === senderId ? "You" : m.username }/>
          ))
        }
      </div>
      <div className="input-box">
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={submitKeyHandler} placeholder='Type a message...'/>
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  )
}
