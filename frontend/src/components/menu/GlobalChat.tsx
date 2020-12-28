import React, { useEffect, useState } from "react";

import { GlobalChatProps } from "../../models/menu.model";

import { socket } from "../../api/socket";
import { GlobalMessage } from "../../models/chat.model";

export default function GlobalChat(props: GlobalChatProps) {
  const [textValue, setTextValue] = useState("");
  const [messages, setMessages] = useState<GlobalMessage[]>([
    { sender: "server", time: "", message_id: -1, text: "Welcome to Boomer Dog" },
  ]);

  useEffect(() => {
    // scroll to bottom of the chat to display any new messages 
    let objDiv: any = document.getElementById("global-message-box");
    objDiv.scrollTop = objDiv.scrollHeight;
  }, [messages]);

  useEffect(() => {
    // subscribe to the socket.io for global chat messages
    socket.on("global_chat_message", (data: GlobalMessage) => {
      console.log(data)
      setMessages((m) => [...m, data]);
    });

    return () => {socket.off("global_chat_message")}
  }, [] /* subscribe only once */);

  const handleChange = (event: any) => {
    setTextValue(event.target.value);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    submit();
  };

  const onEnterKey = (event: any) => {
    if (event.key === "Enter" && event.shiftKey === false) {
      submit();
    }
  };

  const submit = () => {
    if (!props.player || !textValue) return;
    socket.emit("global_chat_message", {
      sender: props.player.username,
      text: textValue,
    });
    setTextValue("");
  }
  
  return (
    <div id="global-chat-container" className="chat-container">
      <h3>Global chat</h3>
      <div id="global-message-box" className="msg-box">
        {messages.map((msg) => {
          let msgClass =
            msg.sender === props.player?.username ? "msg msg-user" : "msg";
          if (msg.sender === "server") {
            msgClass = "msg msg-server";
          }
          return (
            <div className={msgClass} key={msg.message_id}>
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
        <form onSubmit={handleSubmit}>
          <textarea
            className="text-box"
            value={textValue}
            onChange={handleChange}
            onKeyUp={onEnterKey}
            rows={2}
            placeholder={
              props.player
                ? "Type your message here..."
                : "Log in to send message."
            }
            disabled={!props.player}
          ></textarea>
          <button
            type="submit"
            className="btn"
            disabled={!props.player}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
