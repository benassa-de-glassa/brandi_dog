import React from "react";
import { AvatarProps } from "../../models/avatar.model";

export default function Avatar(props: AvatarProps) {
  const size = 70,
    strokeWidth = 7;

  const radius = size / 2 - strokeWidth;

  return (
    <div className={props.className} onClick={props.clickHandler}>
      <p
        className={props.isMe ? "player-name me" : "player-name"}
        onClick={props.clickHandler}
      >
        {props.isHost ? `! ${props.playerName}` : props.playerName}
      </p>
      {/* <img
                alt='avatar'
                className={props.isActive ? 'avatar active' : 'avatar'}
                src={props.image}
            ></img> */}
      <svg width={size} height={size}>
        <defs>
          <clipPath id="circleView">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="#FFFFFF" />
          </clipPath>
        </defs>

        <circle
          className={
            props.isActive
              ? "avatar-image-border active"
              : "avatar-image-border"
          }
          //   stroke={"black"}
          //   stroke-width={strokeWidth}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <image
          x={strokeWidth}
          y={strokeWidth}
          width={size - 2 * strokeWidth}
          height={size - 2 * strokeWidth}
          href={props.image}
          clip-path="url(#circleView)"
        />
      </svg>
    </div>
  );
}
