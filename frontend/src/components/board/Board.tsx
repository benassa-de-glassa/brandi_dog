import React, { useState } from "react";

import Tooltip from "./Tooltip";
import Avatar from "./Avatar";
import Card from "../card/Card";

import {
  BoardProps,
  BoardTooltipState,
  BoardCoordinates,
  Step,
} from "../../models/board.model";

import { Marble } from "../../models/marble.model";

import boardDataJSON from "./boarddata4.json";
import boardData6JSON from "./boarddata6.json";

import { avatarPath } from "../../constants/constants";

function Board(props: BoardProps) {
  const height = 800;
  const width = 800;

  const boardData =
    props.numberOfPlayers === 4 ? boardDataJSON : boardData6JSON;

  const [tooltip, setTooltip] = useState<BoardTooltipState>({
    stepPosition: null,
    visible: false,
    x: "0",
    y: "0",
    anchor: { x: "left", y: "top" } as BoardCoordinates,
    text: "",
  });

  let homeOccupation = new Array(4 * props.numberOfPlayers);
  let stepOccupation = new Array(16 * props.numberOfPlayers);
  let houseOccupation = new Array(4 * props.numberOfPlayers);

  // place the marbles
  props.marbleList.forEach((marble: Marble) => {
    // marble.color = marbleColors[parseInt(Math.floor(marble.mid / 4))]
    // negative positions correspond to home
    if (marble.position < 0) {
      homeOccupation[-(marble.position + 1)] = marble;
    } else if (marble.position >= 1000) {
      houseOccupation[marble.position - 1000] = marble;
    } else {
      stepOccupation[marble.position] = marble;
    }
  });

  const radius = props.numberOfPlayers === 4 ? 12 : 10;
  const outerRadius = props.numberOfPlayers === 4 ? 18 : 15;

  function onStepClick(data: Step) {
    if (data.id == null) {
      return;
    }
    let marble: Marble;
    let homeClicked: boolean = false;
    if (data?.id < 0) {
      // get the marble from the home
      homeClicked = true;
      marble = homeOccupation[-data.id - 1];
    } else if (data.id >= 1000) {
      // Test
      // need to be able to move the marbles in the house too
      marble = houseOccupation[data.id - 1000];
    } else {
      marble = stepOccupation[data.id];
    }
    if (marble !== undefined) {
      // homeClicked indicates if the player wants to go out or not
      props.marbleClicked(marble, homeClicked);
    }

    // show tooltip
    if (props.tooltipActions && marble !== undefined && !homeClicked) {
      let xPercent = parseFloat(data.x); // e.g. makes 35.3 out of '35.3%'
      let yPercent = parseFloat(data.y);
      // show the tooltip to the left (top) or the right (bottom) of the step
      // depending on the location, e.g. show it to the right if a step in the
      // left half of the board is clicked
      setTooltip({
        stepPosition: data.id,
        visible: true,
        x:
          xPercent < 50
            ? "calc(" + data.x + " + 10px)"
            : "calc(" + (100 - xPercent) + "% + 10px)",
        y:
          yPercent < 50
            ? "calc(" + data.y + " + 10px)"
            : "calc(" + (100 - yPercent) + "% + 10px)",
        anchor: {
          x: parseInt(data.x) < 50 ? "left" : "right",
          y: parseInt(data.y) < 50 ? "top" : "bottom",
        },
      } as BoardTooltipState);
    }
  }

  function playerBoxClicked(index: number) {
    console.debug(`${index} clicked`);
    // index is 0, 1, 2, or 3
    if (props.switchingSeats) {
      props.setNewPosition(index);
    }
  }

  function closeTooltip() {
    setTooltip({ visible: false } as BoardTooltipState);
  }

  const boardClicked = (event: any) => {
    // close tooltip if the user clicks somewhere else on the board
    if (!tooltip.visible) return;

    let board = document.getElementById("board");
    event.target === board && closeTooltip();
  };

  return (
    <div id="board-container">
      <div
        className={`svg-container${props.numberOfPlayers === 4 ? "" : "-6"}`}
      >
        {props.playerList.map((player, i) => (
          <Avatar
            key={`avatar-${i}`}
            className={`player-box players-${props.numberOfPlayers} player-${i}`}
            image={`${avatarPath}/${player.avatar}.png`}
            textOnTop={i < 2}
            playerName={player.username}
            isMe={player.uid === props.player?.uid}
            isActive={i === props.activePlayerIndex}
            clickHandler={async () => playerBoxClicked(i)}
          />
        ))}
        <svg
          onClick={boardClicked}
          id="board"
          className="svg-content-responsive"
          viewBox={"0 0 " + width + " " + height}
        >
          {/* build steps for the path around the board */}
          {boardData.steps.map((data) => (
            <circle
              key={data.id}
              className={[
                "step",
                stepOccupation[data.id]
                  ? `occupied occupied-${stepOccupation[data.id].color}`
                  : false,
                tooltip.visible && data.id === tooltip.stepPosition
                  ? "selected"
                  : false,
              ]
                .filter((e) => e) // remove false entries
                .join(" ")}
              id={"step-" + data.id}
              cx={data.x}
              cy={data.y}
              r={radius}
              onClick={() => onStepClick(data)}
            />
          ))}
          {/* draw outer circles */}
          {boardData.outer.map((data) => (
            <circle
              key={"out " + data.x + " " + data.y}
              className={"out out-" + data.color}
              // id={"step-" + data.id}
              cx={data.x}
              cy={data.y}
              r={outerRadius}
            />
          ))}
          {/* draw homes */}
          {boardData.homes.map((data) => (
            <circle
              key={"home " + data.x + " " + data.y}
              className={
                homeOccupation[-data.id - 1]
                  ? "step occupied occupied-" +
                    homeOccupation[-data.id - 1].color
                  : "step"
              }
              id={"home" + data.color + "-" + data.id}
              cx={data.x}
              cy={data.y}
              r={radius}
              onClick={() => onStepClick(data)}
            />
          ))}
          {/* draw houses */}
          {boardData.houses.map((data) => (
            <circle
              key={"house " + data.x + " " + data.y}
              className={
                houseOccupation[data.id - 1000]
                  ? "step occupied occupied-" +
                    houseOccupation[data.id - 1000].color
                  : "step"
              }
              id={"house" + data.color + "-" + data.id}
              cx={data.x}
              cy={data.y}
              r={radius}
              onClick={() => onStepClick(data)}
            />
          ))}
        </svg>
        {props.topCard !== null && (
          <Card value={props.topCard.value} color={props.topCard.color} />
        )}
        {props.tooltipActions.length && tooltip.visible && (
          <Tooltip
            tooltip={tooltip}
            tooltipActions={props.tooltipActions}
            tooltipClicked={props.tooltipClicked}
            closeTooltip={closeTooltip}
          />
        )}
      </div>
    </div>
  );
}

export default Board;
