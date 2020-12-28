import React from 'react'
import { AvatarProps } from '../../models/avatar.model'

export default function Avatar(props: AvatarProps) {
    return (
        <div className={props.className}
            onClick={props.clickHandler}
        >
            <p
                className={props.isMe ? 'player-name me' : 'player-name'}
                onClick={props.clickHandler}
            >{props.isHost ? `! ${props.playerName}` : props.playerName}</p>
            <img
                alt='avatar'
                className={props.isActive ? 'avatar active' : 'avatar'}
                src={props.image}
            ></img>
        </div>
    )
}