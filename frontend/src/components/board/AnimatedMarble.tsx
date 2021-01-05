import React from "react";
import { Animate } from "react-move";
import { Marble } from "../../models/marble.model";

const AnimatedMarble = (props: {
  marble: Marble;
  radius: number;
  position: { x: number; y: number };
  marbleClicked: () => void;
}) => (
  <Animate
    show={true}
    start={{ x: [props.position.x], y: [props.position.y] }}
    // enter={{ x: [100], y: [100] }}
    update={{
      x: [props.position.x],
      y: [props.position.y],
      timing: { duration: 1000, ease: (x: number) => {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        
        return x < 0.5
          ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
          : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;}},
    }}
  >
    {(pos) => {
      console.log(pos);
      return (
        <circle
          key={`marble-${props.marble.mid}`}
          className={`step occupied occupied-${props.marble.color}`}
          cx={pos.x}
          cy={pos.y}
          r={props.radius}
          onClick={props.marbleClicked}
        />
      );
    }}
  </Animate>
);
export default AnimatedMarble;
