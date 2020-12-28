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

import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import TopBar from "./components/topbar/Topbar";
import Menu from "./components/menu/Menu";
import Game from "./components/game/Game";
import UserLogin from "./components/userlogin/UserLogin";
import About from "./components/menu/About";

// import { postData, API_URL } from './paths'
import { socket } from "./api/socket";
import UserCreate from "./components/userlogin/UserCreate";

import { userLogin } from "./api/userlogin";
import { getFromBackend, postToBackend } from "./api/fetch_backend";
import { MainAppProps, MainAppState } from "./models/app.model";
import { ResponseData, GetPlayerResponse } from "./models/response-data.model";
import UserSettings from "./components/userlogin/UserSettings";

class App extends Component<MainAppProps, MainAppState> {
  constructor(props: MainAppProps) {
    super(props);
    this.state = {
      socketConnected: false, // connection to socket.io of the backend
      player: null,
      gameID: null, // currently joined game
      gameToken: "", // JSON web token encoding current game

      errorMessage: "",
      showMenu: true, // top menu containing global chat and lobbies
    };

    this.clearSocket = this.clearSocket.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
    this.getPlayer = this.getPlayer.bind(this);
    this.changeAvatar = this.changeAvatar.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.joinGame = this.joinGame.bind(this);
    this.joinGameSocket = this.joinGameSocket.bind(this);
    this.leaveGame = this.leaveGame.bind(this);
  }

  componentDidMount() {
    /* On mount, try to obtain player credentials and start socketio

        getPlayer() is only successful if an access token already exists from
        a previous login. */

    this.getPlayer();
    this.startSocketIO();
  }

  startSocketIO() {
    /* Connect to the backend socket.io instance
        
        The socket connection state is indicated by the green or red circle in 
        the top left corner. */

    socket.on("connect", () => {
      console.debug("socket.io connection successful");
      this.setState({ socketConnected: true });
    });
    socket.on("disconnect", () => {
      console.debug("socket.io connection lost.");
      this.setState({ socketConnected: false });
    });
    socket.on("error", (data: any) => {
      console.error(data);
      this.setState({ errorMessage: data.detail });
    });
  }

  async clearSocket() {
    // if the connection is blocked force a reconnection
    await getFromBackend("clear_socket");
    // socket.close()
    socket.close();
    setTimeout(function () {
      socket.open();
    }, 1000); // need a delay to not crash backend!
  }

  toggleMenu() {
    this.setState({
      showMenu: !this.state.showMenu,
      errorMessage: "",
    });
  }

  async getPlayer() {
    /* Try to get the player name and id from the backend 
        
        This only works if a valid authentication cookie is present in the 
        request. If it is successful, check if the player is currently in a
        game. If that is the case, join the game socket instance using the
        game_token that was received. */

    const data = (await getFromBackend("users/me")) as GetPlayerResponse;
    if (data.code) {
      console.log("Unable to get player data | " + data.message);
    } else {
      // successfully obtained player data
      socket.open();
      this.setState({
        player: {
          username: data.username,
          uid: data.uid,
          avatar: data.avatar,
        },
      });
      // check if the player is currently playing
      if (data.current_game && data.game_token != null) {
        this.joinGameSocket(data.game_token);
        this.setState({ showMenu: false });
      }
    }
  }

  async changeAvatar(avatar: string) {
    if (!this.state.player) return;

    const data = (await postToBackend("users/me/avatar", avatar)) as ResponseData

    if (!data.code) {
      const me = (await getFromBackend("users/me")) as GetPlayerResponse;

      this.setState({ player: { ...this.state.player, avatar: me.avatar } });
    }
  }

  async createUser(
    username: string,
    password: string,
    avatar: string,
    successCallback: () => void,
    errorCallback: (message: string) => void
  ) {
    // creates a user in the backend but does not log in
    const data = await postToBackend("create_user", {
      username: username,
      password: password,
      avatar: avatar,
    });

    if (data.code) {
      // something went wrong
      console.log(data.code + " | " + data.message);
      errorCallback(data.message ?? "");
    } else {
      successCallback();
    }
  }

  async login(
    username: string,
    password: string,
    errorCallback: (message: string) => void
  ) {
    /* Try to log user into backend
        
        The player name and password are sent to API_URL/token. If the credentials
        are valid, an acces token is issued by the backend.
        */
    const data = (await userLogin(username, password)) as ResponseData;

    if (data.code) {
      // something went wrong
      console.log(data.message);
      errorCallback(data.message ?? "");
    } else {
      this.getPlayer();
    }
  }

  async logout() {
    socket.close();

    const data = await getFromBackend("logout");

    if (data.code) {
      console.warn("Unable to logout | " + data.message);
    } else {
      this.setState({
        player: null,
        gameID: null,
      });
    }
  }

  async joinGame(gameID: string) {
    const data = await postToBackend(`games/${gameID}/join`, this.state.player);

    if (data.code) {
      console.warn(`Unable to join game [${data.message}]`);
    } else {
      if (data.game_token != null) {
        this.joinGameSocket(data.game_token);
      }
    }
  }

  async joinGameSocket(gameToken: string) {
    // joining the game is only completed once the game socket has been joined
    socket.emit("join_game_socket", {
      player: this.state.player,
      game_token: gameToken,
    });
    socket.on("join_game_success", (data: any) => {
      this.setState({
        gameID: data.game_id ?? "",
      });
    });
    socket.on("game_started", () => {
      this.setState({ showMenu: false });
    });
  }

  async leaveGame() {
    this.state.player &&
      socket.emit("leave_game", {
        game_id: this.state.gameID,
        player_id: this.state.player.uid,
      });
    socket.on("leave_game_success", () => {
      this.setState({ gameID: null });
    });
  }

  render() {
    return (
      <Router>
        <div className="App">
          <TopBar
            socketConnected={this.state.socketConnected}
            player={this.state.player}
            logout={this.logout}
            clearSocket={this.clearSocket}
            showMenu={this.state.showMenu}
            toggleMenu={this.toggleMenu}
          />
          {this.state.errorMessage && (
            <span className="error">{this.state.errorMessage}</span>
          )}
          <Switch>
            <Route
              path="/"
              exact
              render={() => (
                <div id="main-page">
                  {this.state.showMenu && (
                    <Menu
                      player={this.state.player}
                      joinGame={this.joinGame}
                      joinedGame={this.state.gameID}
                      joinGameSocket={this.joinGameSocket}
                      leaveGame={this.leaveGame}
                      closeMenu={() => this.setState({ showMenu: false })}
                    />
                  )}{" "}
                  {this.state.player && this.state.gameID !== null && (
                    <Game
                      player={this.state.player}
                      gameID={this.state.gameID}
                    />
                  )}
                </div>
              )}
            />
            <Route
              path="/users/login"
              exact
              render={() => (
                <UserLogin player={this.state.player} login={this.login} />
              )}
            />
            <Route
              path="/users/create"
              exact
              component={() => <UserCreate createUser={this.createUser} />}
            />
            <Route
              path="/users/settings"
              exact
              component={() => <UserSettings player={this.state.player} changeAvatar={this.changeAvatar} />}
            />
            <Route path="/about" exact render={() => <About />} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
