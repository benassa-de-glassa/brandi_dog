import React, { useEffect, useState } from "react";

import Tooltip from "./Tooltip";
import Avatar from "./Avatar";
import Card from "../card/Card";
import AnimatedMarble from "./AnimatedMarble";

import {
  BoardProps,
  BoardTooltipState,
  BoardData,
} from "../../models/board.model";

import { Marble } from "../../models/marble.model";

import { avatarPath } from "../../constants/constants";

// board properties
const boardSize = { height: 800, width: 800 };

// index of homes are negative numbers counting down from -1 ...
// ... index of houses are positive starting at 1000
const homeIndex = (id: number) => -id - 1;
const houseIndex = (id: number) => id - 1000;

const Board = (props: BoardProps) => {
  const [boardData, setBoardData] = useState({} as BoardData);
  const [radius, setRadius] = useState({ inner: 12, outer: 18 });

  // dynamically load relevant board data
  useEffect(() => {
    async function loadBoardData() {
      const data = await import(`./boarddata${props.numberOfPlayers}.json`);
      setBoardData(data);

      // make the steps smaller for more players
      !(props.numberOfPlayers === 4) && setRadius({ inner: 10, outer: 15 });
    }
    loadBoardData();
  }, [props.numberOfPlayers]);

  const getStepPosition = (id: number) => {
    let step;
    if (id < 0) step = boardData.homes[homeIndex(id)];
    else if (id >= 1000) step = boardData.houses[houseIndex(id)];
    else step = boardData.steps[id];
    return {
      x: step.x,
      y: step.y,
    };
  };

  const [tooltip, setTooltip] = useState<BoardTooltipState>({
    stepPosition: null,
    visible: false,
    x: "0",
    y: "0",
    anchor: { x: "left", y: "top" },
    text: "",
  });

  const marbleClicked = (marble: Marble) => {
    // second argument is homeClicked, all homes have negative ids
    props.marbleClicked(marble, marble.position < 0);

    // show tooltip
    if (props.tooltipActions) {
      const { x, y } = getStepPosition(marble.position);

      let xPercent = (x * 100) / boardSize.width;
      let yPercent = (y * 100) / boardSize.height;

      // show the tooltip to the left (top) or the right (bottom) of the step
      // depending on the location, e.g. show it to the right if a step in the
      // left half of the board is clicked
      setTooltip({
        ...tooltip,
        stepPosition: marble.position,
        x:
          xPercent < 50
            ? `calc(${xPercent}% + 10px)`
            : `calc(${100 - xPercent}% + 10px)`,
        y:
          yPercent < 50
            ? `calc(${yPercent}% + 10px)`
            : `calc(${100 - yPercent}% + 10px)`,
        // make sure the tooltip has enough space
        anchor: {
          x: x < boardSize.width / 2 ? "left" : "right",
          y: y < boardSize.height / 2 ? "top" : "bottom",
        },
      });
    }
  };

  function playerBoxClicked(index: number) {
    if (props.switchingSeats) {
      props.setNewPosition(index);
    }
  }

  const boardClicked = (event: any) => {
    // close tooltip if the user clicks somewhere else on the board
    if (!tooltip.visible) return;

    let board = document.getElementById("board");
    event.target === board && props.showTooltip(false);
  };

  return (
    <div id="board-container">
      <div className="svg-container">
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
        {boardData.steps && (
          <svg
            onClick={boardClicked}
            id="board"
            className="svg-content-responsive"
            viewBox={`0 0 ${boardSize.width} ${boardSize.height}`}
          >
            {/* build steps for the path around the board */}
            {boardData.steps.map((data) => (
              <circle
                key={data.id}
                className="step"
                id={"step-" + data.id}
                cx={data.x}
                cy={data.y}
                r={radius.inner}
              />
            ))}
            {/* draw homes */}
            {boardData.homes.map((data) => (
              <circle
                key={"home " + data.x + " " + data.y}
                className="step"
                id={"home" + data.color + "-" + data.id}
                cx={data.x}
                cy={data.y}
                r={radius.inner}
              />
            ))}
            {/* draw houses */}
            {boardData.houses.map((data) => (
              <circle
                key={"house " + data.x + " " + data.y}
                className="step"
                id={"house" + data.color + "-" + data.id}
                cx={data.x}
                cy={data.y}
                r={radius.inner}
              />
            ))}
            {/* draw outer circles */}
            {boardData.outer.map((data) => (
              <circle
                key={"out " + data.x + " " + data.y}
                className={"out out-" + data.color}
                cx={data.x}
                cy={data.y}
                r={radius.outer}
              />
            ))}
            {Object.values(props.marbles).map((marble) => (
              <AnimatedMarble
                key={marble.mid}
                selected={marble.mid === props.selectedMarble?.mid || marble.mid === props.marbleToSwitch?.mid}
                marble={marble}
                radius={radius.inner}
                position={getStepPosition(marble.position)}
                marbleClicked={() => marbleClicked(marble)}
              />
            ))}
          </svg>
        )}
        {props.topCard !== null && (
          <Card value={props.topCard.value} color={props.topCard.color} />
        )}
        {props.tooltipVisible && (
          <Tooltip
            tooltip={tooltip}
            tooltipActions={props.tooltipActions}
            tooltipClicked={props.tooltipClicked}
            tooltipVisible={props.tooltipVisible}
            closeTooltip={() => props.showTooltip(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Board;
