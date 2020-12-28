import React, { FunctionComponent } from "react";

export const ConnectionIndicator: FunctionComponent<{
  socketConnected: boolean;
}> = (props: { socketConnected: boolean }) => {
  return (
    <svg
      className="ml-2"
      height="15"
      width="20"
      name={
        props.socketConnected
          ? "socket connection established"
          : "socket connection failed"
      }
    >
      <circle
        cx="7.5"
        cy="7.5"
        r="7.5"
        stroke="black"
        strokeWidth="2"
        fill={props.socketConnected ? "green" : "red"}
      />
    </svg>
  );
};
