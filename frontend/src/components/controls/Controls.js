import React, { useState, Fragment } from 'react'

import Hand from './Hand'
import './controls.css'

import { possibleActions } from '../../config'

const cards = Object.keys(possibleActions)

/*
action_options values can be the following:
        0: get started
        1: move up 1
        2: move up 2
        3: move up 3
        4: move up 4
        -4: move 4 back
        5: move up 5
        6: move up 6
        7: move up 7 times 1
        8: move up 8
        9: move up 9
        10: move up 10
        11: move up 11
        12: move up 12
        13: move up 14
        switch: switch marble position with opponents marble
*/

const possibleMoves = {
    'A': 'Click on a marble to go out, or move either one or eleven steps.',
    '2': 'Click on a marble to move two steps.',
    '3': 'Click on a marble to move three steps.',
    '4': 'Click on a marble and its destination to move four steps forwards or backwards.',
    '5': 'Click on a marble to move five steps.',
    '6': 'Click on a marble to move six steps.',
    '7': 'Click on a marble to move seven steps. Each step needs to be performed individually on your marbles.',
    '8': 'Click on a marble to move eight steps.',
    '9': 'Click on a marble to move nine steps.',
    '10': 'Click on a marble to move ten steps.',
    'Ja': 'Choose an arbitrary marble to switch with one of yours. You cannot exchange locked marbles.',
    'Q': 'Click on a marble to move 12 steps.',
    'K': 'Click on a marble to go out, or move 13 steps.',
    'Jo': 'Choose a card that the joker imitates.'
}

const roundStateText = [
    'Round has not yet started. ',
    'Round has started and cards have not yet been dealt. ',
    'Round has started and cards have been dealt but not yet exchanged within the team. ',
    'Round has started and cards to be exchanged have been dealt but not yet been shown to the teammate. ',
    'Round has started and cards have been exchanged between teammates. ',
    'Round has finished. '
]

function Controls(props) {
    var [error, setError] = useState('')
    var [aboutToFold, setAboutToFold] = useState(false)

    // var selectedCardString, 
    var possibleMoveString

    if (props.selectedCard !== undefined) {
        // selectedCardString = props.selectedCard.color + '' + props.selectedCard.value
        possibleMoveString = possibleMoves[props.selectedCard.value]
    } else {
        // selectedCardString = ''
        possibleMoveString = ''
    }

    const handleClick = event => {
        event.preventDefault()
        // successCallback, errorCallback
        props.startGame(() => setError(''), setError)
    }

    const swapClicked = event => {
        event.preventDefault()
    }

    return (
        <div className="controls-box">
            <div className="instruction-box">
                <p className='error'>{props.errorMessage}</p>
                <span className='mb-1'>{roundStateText[props.roundState]}</span>
                {props.players.length < 4 &&
                    <span>Waiting for players.</span>}
                {props.gameState < 2 && props.players.length === 4 &&
                    <div>
                        {error &&
                            <p className='error'>{error}</p>
                        }
                        <button className='green my-1 mr-1' onClick={handleClick}>Start game</button>
                        <button className='elegant my-1' onClick={swapClicked}>Change seat</button>
                    </div>
                }
            </div><div className="instruction-box">
                {props.roundState === 2
                    ? <span className="instruction-text">Click on a card to swap.</span>
                    : <span className="instruction-text">{possibleMoveString}</span>
                }
            </div>
            <Hand
                roundState={props.roundState}
                cards={props.cards}
                cardClicked={props.cardClicked}
                selectedCardIndex={props.selectedCardIndex}
                cardBeingSwapped={props.cardBeingSwapped}
                cardSwapConfirmed={props.cardSwapConfirmed}
            />

            {props.selectedCard && props.selectedCard.value === 'Jo' && props.roundState !== 2 &&
                // joker is selected, and it's not to be swapped at the beginning of a round
                <select onChange={event => props.setJokerCard(event.target.value)}>
                    {cards.map(card =>
                        <option value={card}>{card}</option>
                    )}
                </select>
            }
            {props.roundState === 2 &&
                <button className='button ml-1'
                    onClick={props.swapCard}
                    disabled={props.selectedCardIndex === null || props.cardSwapConfirmed}>
                    Confirm
                </button>
            }
            <div id="fold-buttons">
                {props.playerIsActive && props.roundState === 4 && !aboutToFold &&
                    // allows the player to fold if it's his turn and the cards have been exchanged
                    <button className='button ml-1 danger'
                        onClick={() => setAboutToFold(true)}>
                        Fold
                    </button>
                }
                {props.playerIsActive && props.roundState === 4 && aboutToFold &&
                    // allows the player to fold if it's his turn and the cards have been exchanged
                    <Fragment>
                        <button className='button ml-1 danger'
                            onClick={() => {
                                props.fold()
                                setAboutToFold(false)
                            }}>
                            Confirm
                    </button>

                        <button className='button ml-1'
                            onClick={() => setAboutToFold(false)}>
                            Cancel
                    </button>
                        <span id='fold-confirmation'>Do you really want to fold?</span>
                    </Fragment>
                }
            </div>
        </div>
    )
}

export default Controls;
