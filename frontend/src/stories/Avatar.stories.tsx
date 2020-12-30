import React from "react";
import { Story } from "@storybook/react/types-6-0";
import { AvatarProps } from "../models/avatar.model";
import Avatar from "../components/board/Avatar";

import "../css/main.css"

const Template: Story<AvatarProps> = (args) => <Avatar {...args} />;

let params = {
    title: "Avatar",
    component: Avatar,
}

export default params;

export const Primary = Template.bind({});

Primary.args = {
  className: "",
  clickHandler: () => {
    console.log("clicked");
  },
  isMe: true,
  playerName: "testname",
  isActive: true,
  image:"/users/avatars/lama.png",
  textOnTop: true,
};

