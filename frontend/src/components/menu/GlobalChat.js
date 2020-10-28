import React, { Component } from 'react'

import { socket } from '../../socket'
// import { get, postData } from '../../paths'

class GlobalChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textValue: "",
      messages: [
        { sender: 'server', time: '', text: 'Welcome to Boomer Dog' },
      ],
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.onEnterKey = this.onEnterKey.bind(this)
    this.addMessage = this.addMessage.bind(this)
  }

  handleChange(event) {
    this.setState({ textValue: event.target.value });
  }

  handleClick() {
    socket.emit('global_chat_message', {
      sender: this.props.player.username,
      text: this.state.textValue
    })
    this.setState({ textValue: '' })
  }

  onEnterKey(event) {
    if (event.key === 'Enter' && event.shiftKey === false) {
      this.handleClick()
    }
  }

  componentDidUpdate() {
    var objDiv = document.getElementById("global-message-box");
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  componentDidMount() {
    socket.on('global_chat_message', data => {
      console.log('received')
      this.addMessage(data)
    })
  }

  addMessage(data) {
    this.setState(prevState => ({
      messages: [...prevState.messages, data]
    }))
    console.log(this.state.messages)
  }

  render() {
    return (
      <div id='global-chat-container'>
        <span className='subtitle mb-1'>Global chat</span>
        <div id='global-message-box' className='message-box'>
          {this.state.messages.map(msg => {
            // color server messages differently
            if (msg.sender === 'server') {
              return (
                <div className="message server-message" key={msg.time}>
                  <div className="message-text">
                    <span className="mr-auto">{msg.text}
                    </span><span className="float-right">{msg.time}
                    </span>
                  </div>
                </div>
              )
            } else {
              let messageClass = msg.sender === this.props.player.username ? 'message user' : 'message'
              return (
                <div className={messageClass} key={msg.time}>
                  <div className="message-text">
                    <p className="message-text"><span><strong>{msg.sender}</strong></span><span className="float-right">{msg.time}</span></p>
                    <p className="message-text">{msg.text}</p>
                  </div>
                </div>
              )
            }
          })}
        </div>
        <div id='global-chat-editor'>
          <form>
            <textarea
              className="text-box"
              value={this.state.textValue}
              onChange={this.handleChange}
              onKeyUp={this.onEnterKey}
              rows="2"
              placeholder={this.props.playerLoggedIn ? "Type your message here..." : "Log in to send message."}
              disabled={!this.props.playerLoggedIn}>
            </textarea>
            <button type='button' onClick={this.handleClick} disabled={!this.props.playerLoggedIn}>Send</button>
          </form>
        </div>
      </div>
    )
  }
}

export default GlobalChat;