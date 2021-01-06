import React from "react";
import { AvatarProps } from "../../models/avatar.model";

export default function Avatar(props: AvatarProps) {
  const size = 100,
    strokeWidth = 6;

  const radius = size / 2 - strokeWidth;

  const clickHandler = () => {
    if (props.clickable) {
      props.clickHandler();
    }
  };

  return (
    <div
      className={`player-box players-${props.numberOfPlayers} player-${props.playerIndex}`}
    >
      <p
        className={[
          "player-name",
          props.isMe && "me",
          props.clickable && !props.isMe &&"clickable",
        ]
          .filter((e) => e)
          .join(" ")}
        onClick={clickHandler}
      >
        {props.isHost ? `! ${props.playerName}` : props.playerName}
      </p>
      <div className="svg-container">
        <svg viewBox={`0 0 ${size} ${size}`} className="svg-content-responsive">
          <defs>
            <clipPath id="circleView">
              <circle cx={size / 2} cy={size / 2} r={radius} />
            </clipPath>
          </defs>

          <circle
            className={
              props.isActive
                ? `avatar-image-border player-${props.playerIndex} active`
                : `avatar-image-border player-${props.playerIndex}`
            }
            stroke={"black"}
            strokeWidth={strokeWidth}
            cx={size / 2}
            cy={size / 2}
            r={radius + strokeWidth / 2}
          />
          <image
            className={props.clickable && !props.isMe ? "clickable" : ""}
            width={size}
            height={size}
            href={props.image}
            clipPath="url(#circleView)" // make it round
            onClick={clickHandler}
          />
        </svg>
      </div>
    </div>
  );
}
