import React from "react";
import { AvatarProps } from "../../models/avatar.model";

export default function Avatar(props: AvatarProps) {
  const size = 100,
    strokeWidth = 6;

  const radius = size / 2 - strokeWidth;

  return (
    <div className={props.className} onClick={props.clickHandler}>
      <p
        className={props.isMe ? "player-name me" : "player-name"}
        onClick={props.clickHandler}
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
                ? "avatar-image-border active"
                : "avatar-image-border"
            }
            stroke={"black"}
            strokeWidth={strokeWidth}
            cx={size / 2}
            cy={size / 2}
            r={radius+strokeWidth/2}
          />
          <image
            width={size}
            height={size}
            href={props.image}
            clipPath="url(#circleView)" // make it round
          />
        </svg>
      </div>
    </div>
  );
}
