/* Here the backend connection and most important states are handled. 

1) General methods
------------------

startSocketIO
    connects to the backend socket server

clearSocket
    clear stored socket id in backend to allow reconnecting

toggleMenu

render

2) user methods
---------------
getPlayer
    HTTP GET request to backend, retrieve player information

createUser
    HTTP POST request to backend 

login
    HTTP POST form submit to backend

logout
    HTTP GET request to backend

3) game methods
---------------
joinGame
    HTTP POST request to backend

joinGameSocket
    emit game join request to backend socket server

leaveGame
    emit game leave request to backend socket server
*/

import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch
} from 'react-router-dom'

import './css/App.css'
import './css/mycss.css'

import TopBar from './components/topbar/Topbar'
import Menu from './components/menu/Menu'
import Game from './components/game/Game'
import UserLogin from './components/userlogin/UserLogin'
import About from './components/about/About'

// import { postData, API_URL } from './paths'
import { socket } from './api/socket'
import UserCreate from './components/userlogin/UserCreate';

import { userLogin } from './api/userlogin.js'
import { getFromBackend, postToBackend } from './api/fetch_backend'

class App extends Component {
    constructor() {
        super();
        this.state = {
            socketConnected: false, // connection to socket.io of the backend
            playerLoggedIn: false,  // player has signed in with a name
            player: {
                username: "",
                uid: null
            },
            gameID: null,           // currently joined game
            gameToken: '',          // JSON web token encoding current game

            errorMessage: '',
            showMenu: true          // top menu containing global chat and lobbies
        }

        this.clearSocket = this.clearSocket.bind(this)
        this.toggleMenu = this.toggleMenu.bind(this)
        this.getPlayer = this.getPlayer.bind(this)
        this.login = this.login.bind(this)
        this.logout = this.logout.bind(this)
        this.joinGame = this.joinGame.bind(this)
        this.joinGameSocket = this.joinGameSocket.bind(this)
        this.leaveGame = this.leaveGame.bind(this)
    }

    componentDidMount() {
        /* On mount, try to obtain player credentials and start socketio

        getPlayer() is only successful if an access token already exists from
        a previous login. */

        this.getPlayer()
        this.startSocketIO()
    }

    startSocketIO() {
        /* Connect to the backend socket.io instance
        
        The socket connection state is indicated by the green or red circle in 
        the top left corner. */

        socket.on('connect', () => {
            console.debug('socket.io connection successful')
            this.setState({ socketConnected: true })
        })
        socket.on('disconnect', () => {
            console.debug('socket.io connection lost.');
            this.setState({ socketConnected: false })
        })
        socket.on('error', data => {
            console.error(data)
            this.setState({ errorMessage: data.detail })
        })
    }

    async clearSocket() {
        // if the connection is blocked force a reconnection
        getFromBackend('clear_socket')
        // socket.close()
        socket.close()
        setTimeout(function () {socket.open()}, 1000) // need a delay to not crash backend!
    }

    toggleMenu() {
        this.setState({
            showMenu: !this.state.showMenu,
            errorMessage: ''
        })
    }

    async getPlayer() {
        /* Try to get the player name and id from the backend 
        
        This only works if a valid authentication cookie is present in the 
        request. If it is successful, check if the player is currently in a
        game. If that is the case, join the game socket instance using the
        game_token that was received. */

        const data = await getFromBackend('users/me')
        if (data.code) {
            console.log('Unable to get player data | ' + data.message)
        } else {
            // successfully obtained player data
            socket.open()
            this.setState({
                playerLoggedIn: true,
                player: {
                    username: data.username,
                    uid: data.uid
                }
            })
            // check if the player is currently playing
            if (data.current_game) {
                this.joinGameSocket(data.game_token)
                this.setState({ showMenu: false })
            }
        }
    }

    async createUser(username, password, successCallback, errorCallback) {
        // creates a user in the backend but does not log in
        const data = postToBackend('create_user', {
            username: username,
            password: password
        })

        if (data.code) {
            // something went wrong
            console.log(data.code + ' | ' + data.message)
            errorCallback(data.message)
        } else {
            successCallback()
        }
    }

    async login(username, password, errorCallback) {
        /* Try to log user into backend
        
        The player name and password are sent to API_URL/token. If the credentials
        are valid, an acces token is issued by the backend.
        */
        const data = await userLogin(username, password)

        if (data.code) {
            // something went wrong
            console.log(data.message)
            errorCallback(data.message)
        } else {
            this.getPlayer()
        }
    }

    async logout() {
        socket.close()

        const data = getFromBackend('logout')

        if (data.code) {
            console.warn('Unable to logout | ' + data.message)
        } else {
            this.setState({
                playerLoggedIn: false,
                player: { name: "", uid: null },
                gameID: null
            })
        }
    }

    async joinGame(gameID) {
        const data = postToBackend(`games/${gameID}/join`, this.state.player)

        if (data.code) {
            console.warn(`Unable to join game [${data.message}]`)
        } else {
            this.joinGameSocket(data.game_token)
        }
    }

    async joinGameSocket(game_token) {
        // joining the game is only completed once the game socket has been joined
        socket.emit('join_game_socket', {
            player: this.state.player,
            game_token: game_token
        })
        socket.on('join_game_success', data => {
            this.setState({
                gameID: data.game_id
            })
        })
        socket.on('game_started', () => {
            this.setState({ showMenu: false })
        })
    }

    async leaveGame() {
        socket.emit('leave_game',
            {
                game_id: this.state.gameID,
                player_id: this.state.player.uid
            }
        )
        socket.on('leave_game_success', () => {
            this.setState({ gameID: null })
        })
    }



    render() {
        return (
            <Router>
                <div className="App">
                    <TopBar
                        socketConnected={this.state.socketConnected}
                        playerLoggedIn={this.state.playerLoggedIn}
                        player={this.state.player}
                        login={this.login}
                        logout={this.logout}
                        clearSocket={this.clearSocket}
                        showMenu={this.state.showMenu}
                        toggleMenu={this.toggleMenu}
                    />
                    {this.state.errorMessage &&
                        <span class='error'>{this.state.errorMessage}</span>
                    }
                    <Switch>
                        <Route path='/' exact render={() =>
                            <div className='main-page'>
                                {
                                    this.state.showMenu &&
                                    <Menu
                                        playerLoggedIn={this.state.playerLoggedIn}
                                        player={this.state.player}
                                        joinGame={this.joinGame}
                                        joinedGame={this.state.gameID}
                                        joinGameSocket={this.joinGameSocket}
                                        leaveGame={this.leaveGame}
                                        closeMenu={() => this.setState({ showMenu: false })}
                                    />
                                } {
                                    this.state.playerLoggedIn && this.state.gameID !== null &&
                                    <Game player={this.state.player} gameID={this.state.gameID} />
                                }
                            </div>
                        } />
                        <Route path='/users/login' exact render={() =>
                            <UserLogin
                                playerLoggedIn={this.state.playerLoggedIn}
                                login={this.login}
                            />
                        } />
                        <Route path='/users/create' exact component={() =>
                            <UserCreate
                                createUser={this.createUser}
                            />
                        } />
                        <Route path='/about' exact render={() => <About />} />
                    </Switch>
                </div>
            </Router>
        )
    };
}

export default App;
