import React, { useState, Fragment } from "react";

import { possibleActions } from "../../constants/constants";
import { ControlProps } from "../../models/control.model";
import { CardKey } from "../../models/card.model";
import Hand from "./Hand";

const cards = Object.keys(possibleActions);

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
  A: "Click on a marble to go out, or move either one or eleven steps.",
  _2: "Click on a marble to move two steps.",
  _3: "Click on a marble to move three steps.",
  _4: "Click on a marble to select your move.",
  _5: "Click on a marble to move five steps.",
  _6: "Click on a marble to move six steps.",
  _7:
    "Click on a marble to move seven steps. Each step needs to be performed individually on your marbles.",
  _8: "Click on a marble to move eight steps.",
  _9: "Click on a marble to move nine steps.",
  _10: "Click on a marble to move ten steps.",
  Ja:
    "Choose an arbitrary marble to switch with one of yours. You cannot exchange locked marbles.",
  Q: "Click on a marble to move 12 steps.",
  K: "Click on a marble to go out, or move 13 steps.",
  Jo: "Choose a card that the joker imitates.",
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
  "Round has not yet started. ",
  "Round has started and cards have not yet been dealt.",
  "Exchange a card with your partner.",
  "Waiting for card exchange.",
  "Game on.",
  "Wrapping up.",
];

export default function Controls(props: ControlProps) {
  const [aboutToFold, setAboutToFold] = useState(false);

  let possibleMoveString = props.selectedCard
    ? possibleMoves[props.selectedCard.value]
    : "";

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    // successCallback, errorCallback
    props.startGame();
  };

  const swapClicked = (event: React.MouseEvent) => {
    event.preventDefault();
    props.switchSeats();
  };

  return (
    <div className="controls-box">
      <div className="instruction-box">
        {props.errorMessage && (
          <div className="error">{props.errorMessage}</div>
        )}
        {props.roundState && (
          <span className="mb-1">{roundStateText[props.roundState]}</span>
        )}
        {props.players.length < 4 && <span>Waiting for players.</span>}
        {typeof props.gameState !== "undefined" &&
          props.gameState !== null &&
          props.gameState < 2 && (
            <div>
              <button className="btn" onClick={swapClicked}>
                Change seat
              </button>
              {props.players.length === props.numberOfPlayers && (
                <button className="btn btn-green" onClick={handleClick}>
                  Start game
                </button>
              )}
              {props.switchingSeats && (
                <p>Click on another player to change seats.</p>
              )}
            </div>
          )}
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
              props.setJokerCardValue(
                event.target.value as keyof typeof CardKey
              )
            }
          >
            {cards.map((card) => (
              <option key={card} value={card}>{card}</option>
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

            <button
              className="btn"
              onClick={() => setAboutToFold(false)}
            >
              Cancel
            </button>
            <span id="fold-confirmation">Do you really want to fold?</span>
          </Fragment>
        )}
      </div>
    </div>
  );
}
