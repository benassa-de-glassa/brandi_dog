import React, { useState } from "react";
import { avatarPath, avatars } from "../../constants/constants";

import { UserSettingsProps } from "../../models/user.model";
import AvatarSelection from "./AvatarSelection";

export default function UserSettings(props: UserSettingsProps) {
  const [changeAvatar, setChangeAvatar] = useState(false);
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number | null>(
    null
  );

  const handleClick = () => {
    (selectedAvatarIndex !== null) && props.changeAvatar(avatars[selectedAvatarIndex]);
  };

  return (
    <div className="container user-container">
      {props.player ? (
        <div>
          <img
            src={`${avatarPath}/${props.player.avatar}.png`}
            className="avatar-large"
            alt={props.player.avatar}
          />
          <h3>{props.player.username}</h3>
          {!changeAvatar ? (
            <button className="btn" onClick={() => setChangeAvatar(true)}>
              Change spirit animal
            </button>
          ) : (
            <div>
              <AvatarSelection
                selectedAvatarIndex={selectedAvatarIndex}
                setSelectedAvatarIndex={setSelectedAvatarIndex}
              />
              <button className="btn btn-green" onClick={handleClick}>
                Change avatar
              </button>

              <button
                className="btn btn-danger ml-1"
                onClick={() => setChangeAvatar(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ) : (
        <p>Log in first.</p>
      )}
    </div>
  );
}
