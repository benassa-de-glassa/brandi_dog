import React from "react";
import { Story } from "@storybook/react/types-6-0";
import { ControlProps } from "../models/control.model";
import Controls from "../components/controls/Controls";

import "../css/main.css";

const Template: Story<ControlProps> = (args) => (
  <div style={{ display: "flex" }}>
    <Controls {...args} />
  </div>
);

let params = {
  title: "Controls",
  component: Controls,
};

export default params;

export const g1 = Template.bind({});
export const g2r1 = Template.bind({});
export const g2r2 = Template.bind({});
export const g2r3 = Template.bind({});
export const g2r4 = Template.bind({});


g2r1.args = {
  numberOfPlayers: 4,
  players: [
    { username: "Bene", uid: 0, avatar: "dolphin" },
    { username: "Lara", uid: 1, avatar: "lama" },
    { username: "Thilo", uid: 2, avatar: "tiger" },
    { username: "Alex", uid: 3, avatar: "eagle" },
  ],
  selectedCard: {uid: 0, color: "hearts", value: "Ja", actions: ["switch"]},

  roundState: 1,
  gameState: 2,
  
  cards: [
    { uid: 0, color: "hearts", value: "Ja", actions: ["switch"] },
    { uid: 1, color: "clubs", value: "K", actions: ["switch"] },
    { uid: 2, color: "diamonds", value: "9", actions: ["switch"] },
  ],
  startGame: () => {},
  switchSeats: () => {},

  errorMessage: "",
  setJokerCardValue: () => {},
  fold: () => {},
  swapCard: () => {},
  cardClicked: () => {},

  switchingSeats: false,
  jokerCardValue: "A",
  playerIsActive: true,
};

g1.args = {...g2r1.args, gameState: 1}
g2r2.args = {...g2r1.args, roundState: 2}
g2r3.args = {...g2r1.args, roundState: 3}
g2r4.args = {...g2r1.args, roundState: 4}
