import React from 'react'

import './avatar.css'

export default function Avatar(props) {
    return (
        <div className={props.className}
            onClick={props.clickHandler}
        >
            <p
                id={props.isMe ? 'me' : ''}
                className='player-name'
                onClick={props.clickHandler}
            >{props.isHost ? `! ${props.playername}` : props.playername}</p>
            <img
                alt='avatar'
                className={props.isActive ? 'avatar active' : 'avatar'}
                src={props.image}
            ></img>
        </div>
    )
}