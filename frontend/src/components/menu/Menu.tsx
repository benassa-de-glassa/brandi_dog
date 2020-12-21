import React from 'react'

import { MenuProps } from '../../models/menu.model'

import GameViewer from './GameViewer'
import GlobalChat from './GlobalChat'

export default function Menu(props: MenuProps) {
    return (
        <div id="menu-container" className='container'>
            <h3>Menu</h3>
            <button
                className='close'
                aria-label="Close"
                onClick={props.closeMenu}
            >
                <span aria-hidden="true">&times;</span>
            </button>
            <div id='menu-content'>
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