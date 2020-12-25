import React, { useEffect, useState } from "react";

import { GlobalChatProps } from "../../models/menu.model";

import { socket } from "../../api/socket";

export default function GlobalChat(props: GlobalChatProps) {
  const [textValue, setTextValue] = useState("");
  const [messages, setMessages] = useState([
    { sender: "server", time: "", text: "Welcome to Boomer Dog" },
  ]);

  const handleChange = (event: any) => {
    setTextValue(event.target.value);
  };

  const handleClick = () => {
    socket.emit("global_chat_message", {
      sender: props.player.username,
      text: textValue,
    });
    setTextValue("");
  };

  const onEnterKey = (event: any) => {
    if (event.key === "Enter" && event.shiftKey === false) {
      handleClick();
    }
  };

  useEffect(() => {
    let objDiv: any = document.getElementById("global-message-box");
    objDiv.scrollTop = objDiv.scrollHeight;
  }, [messages]);

  useEffect(() => {
    socket.on("global_chat_message", (data: any) => {
      setMessages((m) => [...m, data]);
    });
  }, [props.playerLoggedIn]);

  return (
    <div id="global-chat-container" className="chat-container">
      <h3>Global chat</h3>
      <div id="global-message-box" className="msg-box">
        {messages.map((msg) => {
          let msgClass =
            msg.sender === props.player.username ? "msg msg-user" : "msg";
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
      <div id="global-chat-editor">
        <form>
          <textarea
            className="text-box"
            value={textValue}
            onChange={handleChange}
            onKeyUp={onEnterKey}
            rows={2}
            placeholder={
              props.playerLoggedIn
                ? "Type your message here..."
                : "Log in to send message."
            }
            disabled={!props.playerLoggedIn}
          ></textarea>
          <button
            className="btn"
            onClick={handleClick}
            disabled={!props.playerLoggedIn}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
