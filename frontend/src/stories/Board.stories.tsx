import React from "react";
import { Story } from "@storybook/react/types-6-0";
import { BoardProps } from "../models/board.model";
import Board from "../components/board/Board";

import "../css/main.css";

const Template: Story<BoardProps> = (args) => (
  <div style={{ display: "flex" }}>
    <Board {...args} />
  </div>
);

let params = {
  title: "Board",
  component: Board,
};

export default params;

export const Primary = Template.bind({});

Primary.args = {
  numberOfPlayers: 4,
  player: {username: "bene", uid: 0, avatar: "dolphin"},
  playerList: [
    { username: "Bene", uid: 0, avatar: "dolphin" },
    { username: "Lara", uid: 1, avatar: "lama" },
    { username: "Thilo", uid: 2, avatar: "tiger" },
    { username: "Alex", uid: 3, avatar: "eagle" },
  ],
  marbleList: [
    {position: 0, mid: 1, color: "0"},
    {position: 1, mid: 1, color: "0"},
    {position: 2, mid: 1, color: "0"},
    {position: 3, mid: 1, color: "0"},
  ],
  selectedCard: null,
  selectedMarble: null,
  marbleClicked: () => {},
  tooltipActions: [1,2,3,4,5,6,7],
  setNewPosition: async () => {},
  switchingSeats: false,
  activePlayerIndex: 0,
  tooltipClicked: async () => false,
  topCard: {value: "9", color: "spades", uid: 0, actions: [9]},
};
