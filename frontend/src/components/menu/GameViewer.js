import React, { useState, useEffect } from 'react'

import { socket } from '../../api/socket'
import { getFromBackend, postToBackend } from '../../api/fetch_backend'


var GameViewer = function (props) {
    const [gameList, setGameList] = useState([])
    const [createGame, setCreateGame] = useState(false)
    const [input, setInput] = useState("")
    const [boardSize, setBoardSize] = useState(4)
    const [selectedRow, setSelectRow] = useState()
    const [error, setError] = useState("")


    const updateGameList = async function () {
        // this function is only called after pressing the update button
        // manually as the game list is updated using socket.io
        let data = await getFromBackend('games')
        if (data.code) {
            // something did not work
            console.warn(data.message)
        } else {
            setGameList(data)
        }
    }

    // let react control the input
    const handleCreateGameInput = event => {
        setError('')
        setInput(event.target.value)
    }

    const handleCreateGameSubmit = async event => {
        event.preventDefault() // don't use the default submit
        var relURL = 'games'

        const data = await postToBackend(relURL,
            {
                game_name: input,
                n_players: parseInt(boardSize)
            })
        if (data.game_token) {
            props.joinGameSocket(data.game_token)
            setCreateGame(false)
        } else {
            setError(data.detail)
        }
    }

    const handleBoardSizeChange = async event => {
        setBoardSize(event.target.value)
    }

    // like componendDidMount
    useEffect(() => {
        updateGameList()
        socket.on('game-list', games => {
            setGameList(games)
        })
    }, [])

    return (
        <div id="game-viewer">
            <span className='subtitle mb-1'>Game List</span>
            <span className='mb-1'>Click on a game to join, or create a new game.</span>
            {error &&
                <p className='error'>{error}</p>
            }
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
                    {gameList.map((game, index) =>
                        <tr key={game.game_name} onClick={() => { setSelectRow(index); setError('') }}
                            className={(index === selectedRow ? "selected-row " : "") + (game.game_id === props.joinedGame ? 'joined-row' : "")}>
                            <td>{game.game_name}</td>
                            <td>{game.host.username}</td>
                            <td>{game.n_players}</td>
                            <td>
                                { // reduce only works if game.players is not empty
                                    game.players && Object.values(game.players).map(
                                        player =>
                                            player.username === props.player.username
                                                ? <strong key={player.username}>{player.username}</strong>
                                                : player.username
                                    ).reduce((accu, elem) => {
                                        return accu === null ? [elem] : [...accu, ', ', elem]
                                    }, null)}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <span className='mt-1'>
                <button type='button' className='mr-1'
                    onClick={() => props.joinGame(gameList[selectedRow].game_id)}
                    disabled={!props.playerLoggedIn || selectedRow === undefined || props.joinedGame}
                >Join</button>
                <button type='button' className='mr-1 danger'
                    onClick={props.leaveGame}
                    disabled={!props.joinedGame}>Leave</button>
                <button type='button' className='mr-1' onClick={updateGameList} >Update</button>
                <button
                    type='button' className='mr-1' onClick={() => setCreateGame(true)}
                    disabled={props.joinedGame || !props.playerLoggedIn}
                >New lobby</button>
            </span>
            {
                createGame &&
                <div id='player-create-container'>
                    <p className='title'>Create game</p>
                    <form id='form-player-create' className='mt-1 mr-2' onSubmit={handleCreateGameSubmit}>
                        <span>
                            <label className='create-game-label w-150 mr-1'>
                                Enter a name </label>
                            <input type='text' className='mr-1' value={input} onChange=
                                {handleCreateGameInput} placeholder='Enter game name' />
                        </span>
                        <span>
                            <span className='create-game-label w-150 mr-1'>Number of players</span>
                            <input type='radio' id='4p' name='n-of-players' value={4} defaultChecked onChange={handleBoardSizeChange} />
                            <label for='4p'>4</label>
                            <input type='radio' id='6p' name='n-of-players' value={6} onChange={handleBoardSizeChange} />
                            <label for='6p'>6</label><br />
                        </span>

                        <button type='submit'>Create Game</button>
                    </form>
                </div>
            }

        </div>
    )
}

export default GameViewer;