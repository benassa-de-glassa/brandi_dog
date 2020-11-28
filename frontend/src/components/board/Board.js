import React, { useState } from 'react'

import Tooltip from './Tooltip'
import Avatar from './Avatar'
import Card from '../card/Card'

import './board.css'
import './avatar.css'

const boardData = require("./boarddata4.json")

function Board(props) {
    const height = 800;
    const width = 800;

    const [tooltip, setTooltip] = useState(
        {
            visible: false,
            x: 0, y: 0,
            anchor: { x: 'left', y: 'top' },
            text: ''
        }
    )

    var playerList = [...props.playerList, '', '', '', ''] // make sure this list is at least 4 long.. players are added to the beginning

    var homeOccupation = new Array(16);
    var stepOccupation = new Array(64);
    var houseOccupation = new Array(16);

    // place the marbles
    props.marbleList.forEach(marble => {
        // marble.color = marbleColors[parseInt(Math.floor(marble.mid / 4))] 
        // negative positions correspond to home
        if (marble.position < 0) {
            homeOccupation[-(marble.position + 1)] = marble
        } else if (marble.position >= 1000) {
            houseOccupation[marble.position - 1000] = marble
        }
        else {
            stepOccupation[marble.position] = marble
        }
    });

    const radius = 12;
    const outerRadius = 18;

    function onStepClick(data) {
        let marble
        let homeClicked = false
        if (data.id < 0) {
            // get the marble from the home
            homeClicked = true
            marble = homeOccupation[-data.id - 1]
        } else if (data.id >= 1000) {
            // Test
            // need to be able to move the marbles in the house too
            marble = houseOccupation[data.id - 1000]
        }
        else {
            marble = stepOccupation[data.id]
        }
        if (marble !== undefined) {
            // homeClicked indicates if the player wants to go out or not
            props.marbleClicked(marble, homeClicked)
        }

        // show tooltip
        if (props.tooltipActions && marble !== undefined && !homeClicked) {
            let xPercent = parseFloat(data.x) // e.g. makes 35.3 out of '35.3%'
            let yPercent = parseFloat(data.y)
            // show the tooltip to the left (top) or the right (bottom) of the step
            // depending on the location, e.g. show it to the right if a step in the
            // left half of the board is clicked
            setTooltip({
                visible: true,
                x: xPercent < 50
                    ? 'calc(' + data.x + ' + 10px)'
                    : 'calc(' + (100 - xPercent) + '% + 10px)',
                y: yPercent < 50
                    ? 'calc(' + data.y + ' + 10px)'
                    : 'calc(' + (100 - yPercent) + '% + 10px)',
                anchor: {
                    x: parseInt(data.x) < 50 ? 'left' : 'right',
                    y: parseInt(data.y) < 50 ? 'top' : 'bottom'
                }
            })
        }
    }

    function playerBoxClicked(index) {
        console.debug(`${index} clicked`)
        // index is 0, 1, 2, or 3
        if (props.switchingSeats) {
            props.setNewPosition(index)
        }
    }

    function closeTooltip() {
        setTooltip({ visible: false })
    }

    return (
        <div id='board-container'>
            <div className="svg-container">
                {playerList[0] &&
                    <Avatar
                        className='player-box top-right'
                        image='avatars/lama.png'
                        textOnTop={true}
                        playername={playerList[0].username}
                        isMe={playerList[0].uid === props.player.uid}
                        isActive={props.activePlayerIndex === 0}
                        clickHandler={() => playerBoxClicked(0)}
                    />
                } {playerList[1] &&
                    <Avatar
                        className='player-box top-left'
                        image='avatars/penguin.png'
                        textOnTop={true}
                        playername={playerList[1].username}
                        isMe={playerList[1].uid === props.player.uid}
                        isActive={props.activePlayerIndex === 1}
                        clickHandler={() => playerBoxClicked(1)}
                    />
                } {playerList[2] &&
                    <Avatar
                        className='player-box bottom-left'
                        image='avatars/squirrel.png'
                        textOnTop={false}
                        playername={playerList[2].username}
                        isMe={playerList[2].uid === props.player.uid}
                        isActive={props.activePlayerIndex === 2}
                        clickHandler={() => playerBoxClicked(2)}
                    />
                } {playerList[3] &&
                    <Avatar
                        className='player-box bottom-right'
                        image='avatars/panda.png'
                        textOnTop={false}
                        playername={playerList[3].username}
                        isMe={playerList[3].uid === props.player.uid}
                        isActive={props.activePlayerIndex === 3}
                        clickHandler={() => playerBoxClicked(3)}
                    />
                }
                <svg id="board" className="svg-content-responsive" viewBox={"0 0 " + width + " " + height}>
                    {/* build steps for the path around the board */}
                    {boardData.steps.map(
                        data =>
                            <circle
                                key={data.id}
                                className={stepOccupation[data.id]
                                    ? "step occupied occupied-" + stepOccupation[data.id].color
                                    : "step"
                                }
                                id={"step-" + data.id}
                                cx={data.x}
                                cy={data.y}
                                r={radius}
                                onClick={() => onStepClick(data)}
                            />
                    )}
                    {/* draw outer circles */}
                    {boardData.outer.map(
                        data =>
                            <circle
                                key={"out " + data.x + " " + data.y}
                                className={"out out-" + data.color}
                                id={"step-" + data.id}
                                cx={data.x}
                                cy={data.y}
                                r={outerRadius}
                            />
                    )}
                    {/* draw homes */}
                    {boardData.homes.map(
                        data =>
                            <circle
                                key={"home " + data.x + " " + data.y}
                                className={homeOccupation[-data.id - 1]
                                    ? "step occupied occupied-" + homeOccupation[-data.id - 1].color
                                    : "step"
                                }
                                id={"home" + data.color + "-" + data.id}
                                cx={data.x}
                                cy={data.y}
                                r={radius}
                                onClick={() => onStepClick(data)}
                            />
                    )}
                    {/* draw houses */}
                    {boardData.houses.map(
                        data =>
                            <circle
                                key={"house " + data.x + " " + data.y}
                                className={houseOccupation[data.id - 1000]
                                    ? "step occupied occupied-" + houseOccupation[data.id - 1000].color
                                    : "step"
                                }
                                id={"house" + data.color + "-" + data.id}
                                cx={data.x}
                                cy={data.y}
                                r={radius}
                                onClick={() => onStepClick(data)}
                            />
                    )}
                </svg>
                {props.topCard !== null &&
                        <Card
                            value={props.topCard.value}
                            color={props.topCard.color}
                        />
                    }
                {props.tooltipActions.length && tooltip.visible &&
                    <Tooltip tooltip={tooltip}
                        tooltipActions={props.tooltipActions}
                        tooltipClicked={props.tooltipClicked}
                        closeTooltip={closeTooltip}
                        selectedCard={props.selectedCard}
                    />
                }
            </div>
        </div>
    )
}

export default Board;
