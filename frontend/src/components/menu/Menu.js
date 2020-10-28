import React from 'react'

import GameViewer from './GameViewer'
import GlobalChat from './GlobalChat'
import './menu.css'


export default function Menu(props) {
    return (
        <div className='menu-container'>
            <p className='title ml-1'>Menu</p>
            <button
                id="close-tooltip"
                type="button"
                className='close'
                aria-label="Close"
                onClick={props.closeMenu}
            >
                <span aria-hidden="true">&times;</span>
            </button>
            <div id='menu-flex-container'>
                <GameViewer
                    playerLoggedIn={props.playerLoggedIn}
                    player={props.player}
                    joinGame={props.joinGame}
                    joinedGame={props.joinedGame}
                    joinGameSocket={props.joinGameSocket}
                    leaveGame={props.leaveGame}
                />
                <GlobalChat
                    playerLoggedIn={props.playerLoggedIn}
                    player={props.player}
                />
            </div>
        </div>
    )
}