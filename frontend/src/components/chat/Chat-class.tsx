import React, { Component } from "react";

import { socket } from "../../api/socket";
import { ChatProps, ChatState, Message } from "../../models/chat.model";

class Chat extends Component<ChatProps, ChatState> {
  constructor(props: ChatProps) {
    super(props);
    this.state = {
      textValue: "",
      messages: [],
    } as ChatState;
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.onEnterKey = this.onEnterKey.bind(this);
    this.addMessage = this.addMessage.bind(this);
  }

  handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ textValue: event.target.value ?? "" });
  }

  handleClick() {
    if (({ ...this.state } as ChatState).textValue.trim()) {
      socket.emit("chat_message", {
        sender: this.props.player.username,
        text: this.state.textValue,
        game_id: this.props.gameID,
      } as Message);
    }
    this.setState({ textValue: "" });
  }

  onEnterKey(event: React.KeyboardEvent) {
    event.preventDefault();
    if (event.key === "Enter" && event.shiftKey === false) {
      this.handleClick();
    }
  }

  // componentDidUpdate() {
  //   var objDiv = document.getElementById("message-box") ?? null;
  //   if (objDiv != null) {
  //     objDiv.scrollTop = objDiv.scrollHeight;
  //   }
  // }

  componentDidMount() {
    socket.on("chat_message", (data: Message) => {
      this.addMessage(data);
    });
  }

  addMessage(data: Message) {
    this.setState((prevState) => ({
      messages: [...prevState.messages, data],
    }));
    console.log(this.state.messages);
  }

  render() {
    return (
      <div className="chat-container">
        <div id="message-box" className="msg-box">
          {this.state.messages.map((msg) => {
          let msgClass =
            msg.sender === this.props.player.username ? "msg msg-user" : "msg";
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
        <div className="chat-editor">
          <form>
            <textarea
              className="text-box"
              value={this.state.textValue}
              onChange={this.handleChange}
              onKeyUp={this.onEnterKey}
              rows={2}
              placeholder="Type your message here..."
            ></textarea>
            <button className="btn" onClick={this.handleClick}>
              Send
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default Chat;
