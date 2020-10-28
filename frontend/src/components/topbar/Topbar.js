import React, { Fragment } from 'react'

import { Link, withRouter } from 'react-router-dom'

function TopBar(props) {
    return (
        <header>
            <svg className='ml-2' height="20" width="20" title={props.socketConnected ? 'socket connection established' : 'socket connection failed'}>
                <circle cx="10" cy="10" r="10" stroke="black" strokeWidth="2" 
                    fill={props.socketConnected ? "green" : "red"}
                />
            </svg>
            { !props.socketConnected && props.playerLoggedIn &&
                <input type='button' className='top-bar-link ml-2 white' value='Try to reconnect' />
            }
            <span className='topbar'>
                <Link
                    id='title'
                    className='top-bar-link ml-2 mr-2'
                    to='/'
                >Boomer Dog{'\u2122'}
                </Link>

                <Link className="top-bar-link ml-2" to='/about'>About</Link>

                {props.location.pathname === '/' 
                    ?
                    <input type="button" className="top-bar-link ml-2 mr-2" 
                        value={props.showMenu ? 'Hide Menu' : 'Menu'} onClick={props.toggleMenu} />
                    :
                    <Link className="top-bar-link ml-2" to='/'>Home</Link>
                }

                {props.playerLoggedIn
                    ?
                    <span className="ml-auto mr-2">
                        Playing as  <span className='bold'>{props.player.username} (#{props.player.uid})</span>

                        <input type="button" className="top-bar-link ml-2 mr-2 mt-1 mb-1" value="Logout" onClick={props.logout} />
                    </span>
                    :
                    <Fragment>
                        <Link className='top-bar-link mr-2 ml-auto' to='/users/login'>Login</Link>
                        <Link className='top-bar-link mr-2' to='/users/create'>Create User</Link>
                    </Fragment>
                }
            </span>
        </header>
    )
}

export default withRouter(TopBar);