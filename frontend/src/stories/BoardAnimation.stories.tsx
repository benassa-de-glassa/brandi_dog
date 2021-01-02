import React from "react";
import { Story } from "@storybook/react/types-6-0";
import { State, Store } from "@sambego/storybook-state";
import { BoardProps } from "../models/board.model";

import "../css/main.css";
import BoardAnimation from "../components/board/BoardAnimation";
import { Marble } from "../models/marble.model";

const params = {
  title: "BoardAnimation",
  component: BoardAnimation,
};
export default params;

const store = new Store({
  marbleList: [
    { position: 0, mid: 1, color: "0" },
    { position: 1, mid: 2, color: "0" },
    { position: 2, mid: 3, color: "0" },
    { position: 3, mid: 4, color: "0" },
    { position: 1002, mid: 5, color: "0" },
    { position: -1, mid: 7, color: "0" },
  ],
  tooltipVisible: false,
});

const Template: Story<BoardProps> = (args) => (
  <div style={{ width: "600px", display: "flex" }}>
    <State store={store}>
      <BoardAnimation {...args} />
    </State>
  </div>
);

export const Primary = Template.bind({});

Primary.args = {
  numberOfPlayers: 4,
  player: { username: "bene", uid: 0, avatar: "dolphin" },
  playerList: [
    { username: "Bene", uid: 0, avatar: "dolphin" },
    { username: "Lara", uid: 1, avatar: "seal" },
    { username: "Thilo", uid: 2, avatar: "tiger" },
    { username: "Alex", uid: 3, avatar: "eagle" },
  ],
  marbleList: store.get("marbleList"),
  selectedCard: null,
  selectedMarble: null,
  marbleClicked: (marble: Marble, homeClicked: boolean) => {
    let marbles = store.get("marbleList").filter((m) => m !== marble);
    store.set({
      marbleList: [...marbles, { ...marble, position: (marble.position + 4) % 64 }],
    });
  },
  tooltipActions: [1, 2, 3, 4, 5, 6, 7],
  setNewPosition: async () => {},
  switchingSeats: false,
  activePlayerIndex: 0,
  tooltipClicked: async () => false,
  tooltipVisible: store.get("tooltipVisible"),
  showTooltip: (b: boolean) => {
    store.set({ tooltipVisible: b });
    console.log(store.get("tooltipVisible"));
  },
  topCard: { value: "9", color: "spades", uid: 0, actions: [9] },
};
