import React, { useEffect, useState } from 'react'

import './ChatWindow.scss'
import Message from '../../../Components/Messages/Message'
import socket from '../../../socket';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function ChatWindow() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { conversationId } = useParams();

  const userString = localStorage.getItem("user");
  const userObject = userString ? JSON.parse(userString) : {}
  const currentUser = {
    userId: userObject.email,
    name: userObject.name,
    role: userObject.role
  };

  useEffect(() => {
    if(conversationId){
      socket.emit("join_conversation", conversationId);
      console.log("Frontend joined conversation at ID:",conversationId);
    }
  }, [conversationId]);

  // useEffect(() => {
  //   const fetchMessages = async () => {
  //     try{
  //       const res = await axios.get(`http://localhost:5000/api/messages/${conversationId}`,
  //         { headers: { Authorization: `Bearer ${currentUser.token}`}}
  //       );
  //       setMessages(res.data);
  //     } catch(error){
  //       console.error("Error in fetching messages!",error);
  //     }
  //   };

  //   fetchMessages();
  // }, [conversationId]);

  useEffect(() => {
    const receiveMessageHandler = (data) => {
      console.log(`From: ${data.username} message: ${data.text}`);
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
      senderId: currentUser.userId,
      text: message
    };

    // try{
    //   const res = await axios.post("http://localhost:5000/api/messages", msgdata,
    //     { headers: {Authorization: `Bearer ${currentUser.token}`} }
    //   )
      
    //   socket.emit("send_message", {
    //     conversationId,
    //     senderId: currentUser._id,
    //     text: message
    //   });
      
    //   setMessage("");
    // } catch(error){
    //   console.error("Error in sending the message!", error);
    // }

    socket.emit("send_message", {
        conversationId,
        senderId: currentUser.userId,
        text: message
      });
      
      setMessage("");
  };

  return (
    <div className='chat-window'>
      <div className='messages-list'>
        {
          messages.map((m, i) => (
            <Message key={i} msg={m.text} info={ m.senderId === currentUser.userId ? "You" : m.username }/>
          ))
        }
      </div>
      <div className="input-box">
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Type a message...'/>
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  )
}
