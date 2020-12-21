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
    <div id="global-chat-container">
      <span className="subtitle mb-1">Global chat</span>
      <div id="global-message-box" className="message-box">
        {messages.map((msg) => {
          // color server messages differently
          if (msg.sender === "server") {
            return (
              <div className="message server-message" key={msg.time}>
                <div className="message-text">
                  <span className="mr-auto">{msg.text}</span>
                  <span className="float-right">{msg.time}</span>
                </div>
              </div>
            );
          } else {
            let messageClass =
              msg.sender === props.player.username ? "message user" : "message";
            return (
              <div className={messageClass} key={msg.time}>
                <div className="message-text">
                  <p className="message-text">
                    <span>
                      <strong>{msg.sender}</strong>
                    </span>
                    <span className="float-right">{msg.time}</span>
                  </p>
                  <p className="message-text">{msg.text}</p>
                </div>
              </div>
            );
          }
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
            type="button"
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
