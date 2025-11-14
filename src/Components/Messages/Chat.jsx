import React from 'react'

import './Chat.scss'
import profile_img from '../../assets/profile.png'

export default function Chat({ role, conv, onSelectConversation }) {

  return (
    <div className="chat" onClick={() => onSelectConversation(conv._id)}>
      <div className="chat-profile-photo">
        <div className="chat-profile-photo-container">
          <img src={profile_img} alt="" />
        </div>
      </div>
      <div className="chat-info">
        <div className="chat-name">
          {
            role === 'buyer' ?
              <span>{conv.sellerName}</span>
              :
              <span>{conv.buyerName}</span>
          }
        </div>
        <div className="chat-last-message">
          <span>{conv.lastMessage}</span>
        </div>
      </div>
    </div>
  )
}
