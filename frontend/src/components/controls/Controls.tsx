/*
The Controls component handles the cards, and user input which is not handled
by clicking on the board itself, i.e. 
- starting the game
- switching seats
- swapping cards
- selecting cards
- folding

Additionally it is the component where error messages and user information is
displayed. 
*/

import React, { useState, Fragment } from "react";

import { possibleActions } from "../../constants/constants";
import { ControlProps } from "../../models/control.model";
import { CardValue } from "../../models/card.model";
import Hand from "./Hand";

const cards = Object.keys(possibleActions);

const possibleMoves = {
  A: "Click on a marble to go out, or move either one or eleven steps.",
  2: "Click on a marble to move two steps.",
  3: "Click on a marble to move three steps.",
  4: "Click on a marble to move four steps forward or backward.",
  5: "Click on a marble to move five steps.",
  6: "Click on a marble to move six steps.",
  7: "Click on a marble to move seven steps. Each step can be performed individually on your different marbles.",
  8: "Click on a marble to move eight steps.",
  9: "Click on a marble to move nine steps.",
  10: "Click on a marble to move ten steps.",
  Ja:
    "Choose an arbitrary marble to switch with one of yours. You cannot exchange locked marbles.",
  Q: "Click on a marble to move 12 steps.",
  K: "Click on a marble to go out, or move 13 steps.",
  Jo: "The joker can imitate any card. Select a card value below.",
};

/*
0 Round has not yet started.
1 Round has started and cards have been dealt but not yet exchanged within the team.
2 Round has started and cards to be exchanged have been dealt but not yet been shown to the teammate.
3 Round has started and cards have been exchanged between teammates.
4 Round has started and cards have not yet been dealt.
5 Round has finished.
*/

const roundStateText = [
  "Round has not yet started.",
  "Round has started, dealing cards.",
  "Exchange a card with your partner.",
  "Waiting for card exchange.",
  "Game on.",
  "Wrapping up.",
];

const Controls = (props: ControlProps) => {
  const [aboutToFold, setAboutToFold] = useState(false);

  let possibleMoveString = props.selectedCard
    ? possibleMoves[props.selectedCard.value]
    : "";

  return (
    <div className="controls-box">
      <div className="instruction-box">
        {props.errorMessage && (
          <div className="error">{props.errorMessage}</div>
        )}
        {typeof props.gameState !== "undefined" &&
          props.gameState !== null &&
          props.gameState < 2 &&
          props.players.length > 1 && (
            <div className="mb-1">
              <button
                className="btn mb-1"
                disabled={props.switchingSeats}
                onClick={() => props.switchSeats(true)}
              >
                Change seat
              </button>
              {props.switchingSeats && (
                <button
                  className="btn btn-danger ml-1"
                  onClick={() => props.switchSeats(false)}
                >
                  Cancel
                </button>
              )}
              {props.switchingSeats && (
                <p className="mb-1">Click on another player to change seats.</p>
              )}
              {props.players.length === props.numberOfPlayers && (
                <button
                  className="btn btn-green"
                  onClick={() => props.startGame()}
                >
                  Start game
                </button>
              )}
            </div>
          )}
        {props.roundState !== null && (
          <div className="mb-1">{roundStateText[props.roundState]}</div>
        )}
        {props.players.length < 4 && <div>Waiting for players.</div>}
      </div>
      <div className="instruction-box">
        {props.roundState === 2 ? (
          <span className="instruction-text">Click on a card to swap.</span>
        ) : (
          <span className="instruction-text">{possibleMoveString}</span>
        )}
      </div>
      <Hand
        roundState={props.roundState}
        cards={props.cards}
        cardClicked={props.cardClicked}
        selectedCardIndex={props.selectedCardIndex}
        cardBeingSwapped={props.cardBeingSwapped}
        cardSwapConfirmed={props.cardSwapConfirmed}
      />

      {props.selectedCard &&
        props.selectedCard.value === "Jo" &&
        props.roundState !== 2 && (
          // joker is selected, and it's not to be swapped at the beginning of a round
          <select
            onChange={(event) =>
              props.setJokerCardValue(event.target.value as CardValue)
            }
          >
            {cards.map((card) => (
              <option key={card} value={card}>
                {card}
              </option>
            ))}
          </select>
        )}
      {props.roundState === 2 && (
        <button
          className="btn"
          onClick={props.swapCard}
          disabled={props.selectedCardIndex === null || props.cardSwapConfirmed}
        >
          Confirm
        </button>
      )}
      <div id="fold-buttons">
        {props.playerIsActive && props.roundState === 4 && !aboutToFold && (
          // allows the player to fold if it's his turn and the cards have been exchanged
          <button
            className="btn btn-danger"
            onClick={() => setAboutToFold(true)}
          >
            Fold
          </button>
        )}
        {props.playerIsActive && props.roundState === 4 && aboutToFold && (
          // allows the player to fold if it's his turn and the cards have been exchanged
          <Fragment>
            <button
              className="btn btn-danger"
              onClick={() => {
                props.fold();
                setAboutToFold(false);
              }}
            >
              Confirm
            </button>

            <button className="btn" onClick={() => setAboutToFold(false)}>
              Cancel
            </button>
            <span id="fold-confirmation">Do you really want to fold?</span>
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default Controls;
