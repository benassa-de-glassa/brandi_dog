import React, { useEffect, useState } from "react";

import { ChatProps, Message } from "../../models/chat.model";

import { socket } from "../../api/socket";

export default function Chat(props: ChatProps) {
  const [textValue, setTextValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // scroll to bottom of the chat to display any new messages
    let objDiv: any = document.getElementById("message-box");
    objDiv.scrollTop = objDiv.scrollHeight;
  }, [messages]);

  useEffect(
    () => {
      // subscribe to the socket.io for game specific chat messages
      socket.on("chat_message", (data: Message) => {
        setMessages((m) => [...m, data]);
      });
    },
    [] /* subscribe only once*/
  );

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
    if (!textValue) return;
    socket.emit("chat_message", {
      sender: props.player?.username,
      text: textValue,
      game_id: props.gameID,
    });
    setTextValue("");
  };

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
      <div id="chat-editor">
        <form onSubmit={handleSubmit}>
          <textarea
            className="text-box"
            value={textValue}
            onChange={handleChange}
            onKeyUp={onEnterKey}
            rows={2}
            placeholder={"Type here..."}
          ></textarea>
          <button type="submit" className="btn">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
