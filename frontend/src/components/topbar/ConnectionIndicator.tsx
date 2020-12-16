import React, { FunctionComponent } from "react";

export const ConnectionIndicator: FunctionComponent<{
  socketConnected: boolean;
}> = (props: { socketConnected: boolean }) => {
  return (
    <svg
      className="ml-2"
      height="20"
      width="20"
      name={
        props.socketConnected
          ? "socket connection established"
          : "socket connection failed"
      }
    >
      <circle
        cx="10"
        cy="10"
        r="10"
        stroke="black"
        strokeWidth="2"
        fill={props.socketConnected ? "green" : "red"}
      />
    </svg>
  );
};
