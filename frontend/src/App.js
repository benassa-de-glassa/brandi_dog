import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Route, 
    Switch
} from 'react-router-dom'

import './App.css';
import './mycss.css'

import TopBar from './components/topbar/Topbar'
import Menu from './components/menu/Menu'
import Game from './components/game/Game'
import UserLogin from './components/userlogin/UserLogin'
import About from './components/about/About'

import { postData, API_URL_WITHOUT_V1 } from './paths'
import { socket } from './socket'
import UserCreate from './components/userlogin/UserCreate';


class App extends Component {
    constructor() {
        super();
        this.state = {
            socketConnected: false, // connection to socket.io of the backend
            playerLoggedIn: false,  // player has signed in with a name
            showMenu: true,         // top menu containing global chat and lobbies
            player: {
                username: "",
                uid: null
            },
            gameID: null,           // currently joined game
            gameToken: '',          // jwt
            errorMessage: ''
        }

        this.toggleMenu = this.toggleMenu.bind(this)
        this.getPlayer = this.getPlayer.bind(this)
        this.login = this.login.bind(this)
        this.logout = this.logout.bind(this)
        this.playerQuit = this.playerQuit.bind(this)
        this.joinGame = this.joinGame.bind(this)
        this.joinGameSocket = this.joinGameSocket.bind(this)
        this.leaveGame = this.leaveGame.bind(this)
    }

    startSocketIO() {
        // connect to the backend socket.io instance
        // the socket connection state is indicated by the green or red circle
        // const socket = getSocket()
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

    componentDidMount() {
        this.getPlayer()    // try to log in using a httponly cookie
        this.startSocketIO()
    }

    toggleMenu() {
        this.setState({ 
            showMenu: !this.state.showMenu,
            errorMessage: ''
        })
    }

    async getPlayer() {
        // try to get the player name and id from the backend. For this to work a 
        // valid authorization cookie has to be sent. 
        let url = new URL('users/me', API_URL_WITHOUT_V1)
        const playerResponse = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        })
        const player = await playerResponse.json()
        if (playerResponse.status === 200) {
            socket.open()
            this.setState({
                playerLoggedIn: true,
                player: {
                    username: player.username,
                    uid: player.uid
                }
            })
            // player is already in a game
            if (player.current_game) {
                this.joinGameSocket(player.game_token)
                this.setState({ showMenu: false })
            }
        } else {
            console.error(player)
        }
    }

async login(username, password, errorCallback) {
    // sends player name to API_URL/login
    // expects { name: str, id: str } in return

    const data = new URLSearchParams(
        {
            'grant_type': 'password',
            'username': username,
            'password': password
        }
    )

    let url = new URL('token', API_URL_WITHOUT_V1)
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include', // ONLY FOR DEBUG PURPOSES
        body: data
    })
    const responseJson = await response.json()
    if (response.status === 200) {
        this.getPlayer()
    } else {
        console.warn(response.status, responseJson)
        try {
            errorCallback(responseJson.detail)
        } catch (error) {
            console.log(error)
        }
    }
}

async logout() {
    socket.close()
    let url = new URL('logout', API_URL_WITHOUT_V1)
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    })
    if (response.status === 200) {
        this.playerQuit()
    }
}

playerQuit() {
    this.setState({
        playerLoggedIn: false,
        player: { name: "", uid: null },
        gameID: null
    })
}

async joinGame(gameID) {
    const response = await postData(
        'games/' + gameID + '/join',
        this.state.player
    )
    const responseJson = await response.json()
    if (response.status === 200) {
        this.joinGameSocket(responseJson.game_token)
    } else {
        console.warn(responseJson)
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
        this.setState({ showMenu: false})
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

async createUser(username, password, successCallback, errorCallback) {
    // creates a user but does not login
    let data = { username: username, password: password }

    let url = new URL('create_user', API_URL_WITHOUT_V1)
    let response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ONLY FOR DEBUG PURPOSES
        body: JSON.stringify(data)
    })
    let responseJson = await response.json()
    if (response.status === 200) {  
        successCallback()
    } else {
        console.error(responseJson)
        errorCallback(responseJson.detail)
    }
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
                showMenu={this.state.showMenu}
                toggleMenu={this.toggleMenu}
            />
            { this.state.errorMessage &&
            <span class='error'>{this.state.errorMessage}</span>
            }
            <Switch>
                <Route path='/' exact render = {() => 
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
                <Route path='/users/login' exact render = {() => 
                    <UserLogin 
                        playerLoggedIn={this.state.playerLoggedIn}
                        login={this.login}
                    />
                } />
                <Route path='/users/create' exact component = {() => 
                    <UserCreate 
                        createUser={this.createUser}
                    />
                } />
                <Route path='/about' exact render = {() => <About />} />
            </Switch>
        </div>
        </Router>
    )
};
}

export default App;
