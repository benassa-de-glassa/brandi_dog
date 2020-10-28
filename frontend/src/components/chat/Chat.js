import React, {Component} from 'react'

import './chat.css'
import { socket } from '../../socket'

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textValue: "",
      messages: [
        {sender: 'server', time: '', text: 'Welcome to Boomer Dog'},
      ],
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.onEnterKey = this.onEnterKey.bind(this)
    this.addMessage = this.addMessage.bind(this)
  }

  handleChange(event) {
    this.setState({textValue: event.target.value});  
  }

  handleClick() {
    if (this.state.textValue.trim()) {
      socket.emit('chat_message', {
        sender: this.props.player.username,
        text: this.state.textValue,
        game_id: this.props.gameID
      })
    }
    this.setState({textValue: ''})
  }

  onEnterKey(event) {
    event.preventDefault()
    if (event.key === 'Enter' && event.shiftKey === false ) {
      this.handleClick()
    }
  }

  componentDidUpdate() {
    var objDiv = document.getElementById("message-box");
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  componentDidMount() {
    socket.on('chat_message', data => {
      this.addMessage(data)
    })
  }

  addMessage(data) {
    this.setState( prevState => ({
      messages: [...prevState.messages, data]
    }))
    console.log(this.state.messages)
  }

  render() {
    return (
      <div className='chatbox'>
        <div id='message-box' className='message-box'>
        {this.state.messages.map( msg => {
          // color server messages differently
          if (msg.sender === 'server') {
            return(
              <div className="message server-message" key={msg.time}>
                <div className="message-text">
                  <span className="mr-auto">{msg.text}
                  </span><span className="message-time float-right">{msg.time}
                  </span>
                </div>
              </div>
            )
          } else {
            let messageClass = msg.sender === this.props.player.username ? 'message user' : 'message'
            return(
              <div className={messageClass} key={msg.time}>
                <div className="message-text">
                  <p className="message-text"><span><strong>{msg.sender}</strong></span><span className="message-time float-right">{msg.time}</span></p>
                  <p className="message-text">{msg.text}</p>
                </div>
              </div>
            )
          }
        })}
        </div>
        <div className='editor-box'>
          <form>
            <textarea 
              className="text-box"
              value={this.state.textValue}
              onChange={this.handleChange}
              onKeyUp={this.onEnterKey}
              rows="2" 
              placeholder="Type your message here...">
            </textarea>
            <button type='button' onClick={this.handleClick}>Send</button>
          </form>
        </div>
      </div>
      )
  }
}
  
export default Chat;
  