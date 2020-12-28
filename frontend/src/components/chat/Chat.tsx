import React, { useEffect, useState } from "react";

import { ChatProps, Message } from "../../models/chat.model";

import { socket } from "../../api/socket";

export default function Chat(props: ChatProps) {
  const [textValue, setTextValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleChange = (event: any) => {
    setTextValue(event.target.value);
  };

  const handleClick = () => {
    socket.emit("chat_message", {
      sender: props.player?.username,
      text: textValue,
      game_id: props.gameID
    });
    setTextValue("");
  };

  const onEnterKey = (event: any) => {
    if (event.key === "Enter" && event.shiftKey === false) {
      handleClick();
    }
  };

  useEffect(() => {
    let objDiv: any = document.getElementById("message-box");
    objDiv.scrollTop = objDiv.scrollHeight;
  }, [messages]);

  useEffect(() => {
    socket.on("chat_message", (data: any) => {
      setMessages((m) => [...m, data]);
    });
  }, [props.player]);

  return (
    <div id="chat-container" className="chat-container">
      <h3>Chat</h3>
      <div id="message-box" className="msg-box">
        {messages.map((msg) => {
          let msgClass =
            msg.sender === props.player?.username ? "msg msg-user" : "msg";
          if (msg.sender === "server") {
            msgClass = "msg msg-server";
          }
          return (
            <div className={msgClass} key={msg.time}>
              <div className="msg-label">
                <span>
                  {msg.sender !== "server" && <strong>{msg.sender}</strong>}
                </span>

                <span className="msg-time">{msg.time}</span>
              </div>
              <p className="msg-text">{msg.text}</p>
            </div>
          );
        })}
      </div>
      <div id="chat-editor">
        <textarea
          className="text-box"
          value={textValue}
          onChange={handleChange}
          onKeyUp={onEnterKey}
          rows={2}
          placeholder={"Type here..."}
        ></textarea>
        <button className="btn" onClick={handleClick}>
          Send
        </button>
      </div>
    </div>
  );
}
