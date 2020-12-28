import React, { FunctionComponent, useState, useEffect } from "react";

import { GameViewerProps } from "../../models/menu.model";

import { socket } from "../../api/socket";
import { getFromBackend, postToBackend } from "../../api/fetch_backend";

const GameViewer: FunctionComponent<GameViewerProps> = (props) => {
  const [gameList, setGameList] = useState<any>([]);
  const [createGame, setCreateGame] = useState(false);
  const [input, setInput] = useState("");
  const [boardSize, setBoardSize] = useState<number>(4);
  const [selectedRow, setSelectRow] = useState<number | undefined>();
  const [error, setError] = useState("");

  const updateGameList = async function () {
    // this function is only called after pressing the update button
    // manually as the game list is updated using socket.io
    let data: any = await getFromBackend("games");
    if (data.code) {
      // something did not work
      console.warn(data.message);
      setError(data.message);
    } else {
      setError("");
      setGameList(data);
    }
  };

  // let react control the input
  const handleCreateGameInput = (event: any) => {
    setError("");
    setInput(event.target.value);
  };

  const handleCreateGameSubmit = async (event: any) => {
    event.preventDefault(); // don't use the default submit
    var relURL = "games";

    const data = await postToBackend(relURL, {
      game_name: input,
      n_players: boardSize,
    });
    if (data.game_token) {
      props.joinGameSocket(data.game_token);
      setCreateGame(false);
      setBoardSize(4); // back to default value
      setError("");
    } else {
      setError(data.detail);
    }
  };

  const handleBoardSizeChange = async (event: any) => {
    setBoardSize(event.target.value);
  };

  // like componendDidMount
  useEffect(() => {
    updateGameList();
    socket.on("game-list", (games: any) => {
      setGameList(games);
    });
  }, []);

  return (
    <div id="game-viewer">
      <h3>Game List</h3>
      <p>Click on a game to join, or create a new game.</p>
      <table id="game-list-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Host</th>
            <th>Size</th>
            <th>Players</th>
          </tr>
        </thead>
        <tbody>
          {gameList.map((game: any, index: number) => (
            <tr
              key={game.game_name}
              onClick={() => {
                setSelectRow(index);
                setError("");
              }}
              className={
                (index === selectedRow ? "selected-row " : "") +
                (game.game_id === props.joinedGame ? "joined-row" : "")
              }
            >
              <td>{game.game_name}</td>
              <td>{game.host.username}</td>
              <td>{game.n_players}</td>
              <td>
                {
                  // reduce only works if game.players is not empty
                  game.players &&
                    Object.values(game.players)
                      // make the players own name bold
                      .map((player: any) =>
                        player.username === props.player?.username ? (
                          <strong key={player.username}>
                            {player.username}
                          </strong>
                        ) : (
                          player.username
                        )
                      ) // recuce the array of names to one single string
                      .reduce((accu, elem) => {
                        return accu === null ? [elem] : [...accu, ", ", elem];
                      }, null)
                }
              </td>
            </tr>
          ))}
          {!gameList.length && (
            <tr>
              <td colSpan={4}>No games found.</td>
            </tr>
          )}
        </tbody>
      </table>
      {error && <div className="error">{error}</div>}
      <span className="button-row">
        <button
          className="btn"
          onClick={() =>
            typeof selectedRow !== "undefined" &&
            props.joinGame(gameList[selectedRow].game_id)
          }
          disabled={
            (!props.player ||
              selectedRow === undefined ||
              props.joinedGame) as boolean
          }
        >
          Join
        </button>
        <button
          className="btn danger"
          onClick={props.leaveGame}
          disabled={!props.joinedGame}
        >
          Leave
        </button>
        <button className="btn" onClick={updateGameList}>
          Update
        </button>
        <button
          className="btn btn-green"
          onClick={() => setCreateGame(true)}
          disabled={(props.joinedGame || !props.player) as boolean}
        >
          New game
        </button>
      </span>
      {createGame && (
        <div id="player-create-container">
          <h3>Create game</h3>
          <form
            id="form-player-create"
            className="mt-1 mr-2"
            onSubmit={handleCreateGameSubmit}
          >
            <div>
              <label className="create-game-label">Enter a name</label>
              <input
                type="text"
                className="mr-1"
                value={input}
                onChange={handleCreateGameInput}
                placeholder="Enter game name"
              />
            </div>
            <div>
              <span className="create-game-label">Number of players</span>
              <span id="radio-board-size">
                <span className="radio-option">
                  <input
                    type="radio"
                    id="4p"
                    name="n-of-players"
                    value={4}
                    defaultChecked
                    onChange={handleBoardSizeChange}
                  />
                  <label htmlFor="4p">4</label>
                </span>
                <span className="radio-option">
                  <input
                    type="radio"
                    id="6p"
                    name="n-of-players"
                    value={6}
                    onChange={handleBoardSizeChange}
                  />
                  <label htmlFor="6p">6</label>
                </span>
              </span>
            </div>

            <button className="btn btn-green" type="submit">
              Create Game
            </button>

            <button
              className="btn btn-danger ml-1"
              onClick={() => setCreateGame(false)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default GameViewer;
