import React from "react";
import { AvatarSelectionProps } from "../../models/user.model";

import {avatars, avatarPath} from "../../constants/constants"

const AvatarSelection = (props: AvatarSelectionProps) => (
  <div id="avatar-selection">
    <span>Choose your spirit animal</span>
    <div id="avatar-display">
    {avatars.map((avatar, i) => (
      <img
        key={`avatar-${i}`}
        className={i === props.selectedAvatarIndex ? "selected" : ""}
        onClick={() => props.setSelectedAvatarIndex(i)}
        src={`${avatarPath}/${avatar}.png`}
        alt={`avatar-${i}`}
      ></img>
    ))}
    </div>
  </div>
);

export default AvatarSelection;
