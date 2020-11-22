import React from 'react'

export default function Avatar(props) {
    // 
    console.log(props)

    return (
        <div className={props.className}>
            <p id={props.isMe? 'me' : ''} className='player-name'>{props.playername}</p>
            <img
                alt='avatar'
                className={props.isActive ? 'avatar active' : 'avatar'}
                src={props.image}
                ></img>
        </div>
    )
}