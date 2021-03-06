import React, { Component } from "react";

import Chat from "../chat/Chat";
import Board from "../board/Board";
import Controls from "../controls/Controls";

import { socket } from "../../api/socket";
import { postToBackend } from "../../api/fetch_backend";

import { possibleActions } from "../../constants/constants";

import {
  GameComponentProps,
  GameComponentState,
  GameState,
  PlayerState,
} from "../../models/game.model";

import { Marble } from "../../models/marble.model";
import { CardIF } from "../../models/card.model";
import { Action, ActionNumber } from "../../models/action.model";

class Game extends Component<GameComponentProps, GameComponentState> {
  constructor(props: GameComponentProps) {
    super(props);
    this.state = {
      numberOfPlayers: 4, // default to 4 players

      // updated by socket.io
      players: [],
      activePlayerIndex: null,
      playerIsActive: false,
      playerHasFinished: false,
      cards: [], // player cards
      marbles: [], // player marbles
      gameState: null, // see backend for numbers
      roundState: null, // see backend for numbers
      topCard: null,

      // updated by front-end
      switchingSeats: false,
      tooltipVisible: false,
      selectedCardIndex: null, // card that is selected by the user
      selectedCardRequiresTooltip: false,
      marblesToSelect: 0,
      selectedMarble: null,
      tooltipActions: [],
      marbleToSwitch: null,
      cardSwapConfirmed: false,
      cardBeingSwapped: 0, // index of the card that is being swapped to highlight it
      jokerCardValue: "A", // default, selects which card is imitated by the joker
      remainingStepsOf7: 7, // only allow choosing that many steps in the tooltip

      errorMessage: "", // display errors related to the game
    };

    this.resetState = this.resetState.bind(this);
    this.handleNewGameState = this.handleNewGameState.bind(this);
    this.handleNewPlayerState = this.handleNewPlayerState.bind(this);
    this.switchSeats = this.switchSeats.bind(this);
    this.setNewPosition = this.setNewPosition.bind(this);

    this.startGame = this.startGame.bind(this);
    this.swapCard = this.swapCard.bind(this);

    this.cardClicked = this.cardClicked.bind(this);
    this.marbleClicked = this.marbleClicked.bind(this);
    this.tooltipClicked = this.tooltipClicked.bind(this);
    this.fold = this.fold.bind(this);
    this.setJokerCardValue = this.setJokerCardValue.bind(this);
  }

  componentDidMount() {
    socket.on("game-state", (data: GameState) => {
      this.handleNewGameState(data);
    });
    socket.on("player-state", (data: PlayerState) => {
      this.handleNewPlayerState(data);
    });
  }

  componentWillUnmount() {
    socket.off("game-state");
    socket.off("player-state");
  }

  resetState() {
    // reset the state on the front-end specific keys
    this.setState({
      selectedCardIndex: null,
      selectedMarble: null,
      tooltipActions: [],
      marbleToSwitch: null,
      cardSwapConfirmed: false,
      jokerCardValue: "A",
      remainingStepsOf7: 7,
      errorMessage: "",
    });
  }

  handleNewGameState(data: GameState) {
    if (data.round_state === 4) {
      this.setState({ cardSwapConfirmed: false });
    }
    const players = data.order.map((uid) => data.players[uid]);

    let marbles: { [key: number]: Marble } = {};
    players.forEach((playerState: PlayerState) => {
      playerState.marbles.forEach((marble) => {
        marbles[marble.mid] = {
          ...marble,
          color: Math.floor(marble.mid / 4),
        };
      });
    });

    this.setState((prevState) => ({
      ...prevState,
      players: players,
      marbles: marbles,
      gameState: data.game_state,
      roundState: data.round_state,
      activePlayerIndex: data.active_player_index,
      topCard: data.top_card,
      playerIsActive:
        players[data.active_player_index]?.uid === this.props.player?.uid,
      cardSwapConfirmed: data.round_state < 2,
      numberOfPlayers: data.n_players as 4 | 6,
    }));
  }

  handleNewPlayerState(data: PlayerState) {
    this.setState({
      cards: data.hand,
      remainingStepsOf7: data.steps_of_seven,
    });
  }

  switchSeats(b: boolean) {
    // called by Controls component upon click
    this.setState({ switchingSeats: b });
  }

  async setNewPosition(index: number) {
    const response = await postToBackend(
      `games/${this.props.gameID}/player_position`,
      index
    );
    if (response.code) {
      // something went wrong
      console.warn(`[${response.code}] ${response.message}`);
      this.setState({ errorMessage: response.message });
    } else {
      this.setState({ switchingSeats: false });
    }
  }

  cardClicked(index: number) {
    // deselect selected step & reset error message
    this.setState({
      selectedMarble: null,
      errorMessage: "",
    });
    if (index === this.state.selectedCardIndex) {
      // deselect the card if it is clicked again
      this.setState({
        selectedCardIndex: null,
        marblesToSelect: 0,
        selectedCardRequiresTooltip: false,
      });
    } else {
      const selectedCard = this.state.cards[index];
      this.setState({
        selectedCardIndex: index,
        marblesToSelect: selectedCard.value === "Ja" ? 2 : 1,
      });
    }
  }

  async swapCard() {
    const index = this.state.selectedCardIndex;

    if (index === null) {
      return;
    }

    const selectedCard = this.state.cards[index];

    const response = await postToBackend(
      `games/${this.props.gameID}/swap_cards`,
      {
        uid: selectedCard.uid,
        value: selectedCard.value,
        color: selectedCard.color,
      }
    );

    if (response.code) {
      // something went wrong
      console.warn(`[${response.code}] ${response.message}`);
      this.setState({ errorMessage: response.message });
    } else {
      this.setState({
        cardSwapConfirmed: true,
        cardBeingSwapped: index,
      });
    }
  }

  async fold() {
    const response = await postToBackend(
      `games/${this.props.gameID}/fold`,
      this.props.player
    );

    if (response.code) {
      console.warn(`[${response.code}] ${response.message}`);
      this.setState({ errorMessage: response.message });
    } else {
      this.resetState();
    }
  }

  setJokerCardValue(value: CardIF["value"]) {
    this.setState({ jokerCardValue: value });
  }

  async tooltipClicked(action: Action) {
    if (this.state.selectedCardIndex === null || !this.state.selectedMarble) {
      return;
    }
    let selectedCard = this.state.cards[this.state.selectedCardIndex];

    this.performAction(this.state.selectedMarble, selectedCard, action);
  }

  async performAction(marble: Marble, card: CardIF, action: Action) {
    // performs an action selected marble
    const response = await postToBackend(`games/${this.props.gameID}/action`, {
      card: {
        uid: card.uid,
        value: card.value,
        color: card.color,
        actions: card.actions,
      },
      action: action,
      mid: marble.mid,
    });

    if (response.code) {
      // something went wrong
      this.setState({ errorMessage: response.message });
      console.warn(`[${response.code}] ${response.message}`);
    }
    // else
    this.setState({
      tooltipActions: [],
      tooltipVisible: false,
      errorMessage: "",
      selectedMarble: null,
    });

    // don't deselect the selected card if there are still sevens to be played
    if (this.state.remainingStepsOf7 === -1) {
      this.setState({ selectedCardIndex: null });
    }
  }

  async performSwitch(card: CardIF, marble1: Marble, marble2: Marble) {
    // reset stored marble in case of errors
    this.setState({ marbleToSwitch: null });

    const response = await postToBackend(`games/${this.props.gameID}/action`, {
      card: {
        uid: card.uid,
        value: card.value,
        color: card.color,
        actions: card.actions,
      },
      action: "switch",
      mid: marble1.mid,
      mid_2: marble2.mid,
    });
    if (response.code) {
      this.setState({ errorMessage: response.message });
      console.warn(`[${response.code}] ${response.message}`);
    } else {
      this.setState({ errorMessage: "" });
    }
  }

  marbleClicked(marble: Marble, homeClicked: boolean = false) {
    // check if a card is selected
    if (this.state.selectedCardIndex !== null) {
      let selectedCard = this.state.cards[this.state.selectedCardIndex];

      if (!selectedCard) {
        console.error("Selected card is", selectedCard);
        return;
      }
      // define variables that are overwritten in case a joker is played
      let selectedCardValue = selectedCard.value;
      let selectedCardActions = selectedCard.actions;

      if (selectedCardValue === "Jo") {
        selectedCardValue = this.state.jokerCardValue;
        selectedCardActions = possibleActions[selectedCardValue];
      }

      if (selectedCardActions.includes(0) && homeClicked) {
        // (try) to go out
        this.performAction(marble, selectedCard, 0);
        return;
      }
      // home is not clicked
      // remove the 0 from the options to see if a tooltip is needed
      // this is the case for the cards '4', 'A', and '7'
      let playableActions = selectedCardActions.filter(
        (action) => action !== 0
      );

      // if the card is a 7 only show the remaining steps as playable (e.g. [71, 72, 73] if 4 steps were already completed)
      if (selectedCardValue === "7" && this.state.remainingStepsOf7 !== -1) {
        playableActions = playableActions.filter(
          (action) => action <= 70 + this.state.remainingStepsOf7
        );
      }

      if (selectedCardValue === "Ja") {
        if (this.state.marbleToSwitch !== null) {
          // there is already another marble selected => (try to) swap those two
          this.performSwitch(selectedCard, this.state.marbleToSwitch, marble);
          this.setState({ marbleToSwitch: null });
        } else if (marble === this.state.marbleToSwitch) {
          // deselect the currently selected marble if it is clicked twice
          this.setState({ marbleToSwitch: null });
        } else {
          // no other marble has been selected, select this one
          this.setState({ marbleToSwitch: marble });
        }
      } else if (playableActions.length === 1) {
        // clicked on a marble on the field while a card with only one
        // possible action
        this.performAction(marble, selectedCard, playableActions[0]);
      } else {
        // clicked on a marble on the field for which multiple actions
        // are possible
        this.setState({
          tooltipActions: playableActions as ActionNumber[],
          selectedMarble: marble,
          tooltipVisible: true,
        });
      }
    }
  }

  async startGame() {
    const response = await postToBackend(
      `games/${this.props.gameID}/start`,
      this.props.player
    );

    if (response.code) {
      // something went wrong
      this.setState({ errorMessage: response.message });
      console.warn(`[${response.code}] ${response.message}`);
    } else {
      this.setState({ errorMessage: "" });
    }
  }

  render() {
    return (
      <div id="game-container" className="container">
        <div id="game-content">
          <Board
            numberOfPlayers={this.state.numberOfPlayers}
            gameState={this.state.gameState}
            player={this.props.player}
            playerList={this.state.players}
            activePlayerIndex={this.state.activePlayerIndex}
            marbles={this.state.marbles}
            selectedMarble={this.state.selectedMarble}
            marbleToSwitch={this.state.marbleToSwitch}
            tooltipActions={this.state.tooltipActions}
            tooltipClicked={this.tooltipClicked}
            tooltipVisible={this.state.tooltipVisible}
            showTooltip={(b) => this.setState({ tooltipVisible: b })}
            marbleClicked={this.marbleClicked}
            selectedCard={
              this.state.selectedCardIndex !== null
                ? this.state.cards[this.state.selectedCardIndex]
                : null
            }
            topCard={this.state.topCard}
            switchingSeats={this.state.switchingSeats}
            setNewPosition={this.setNewPosition}
            moves={[]}
          />
          <div id="right-container">
            <Controls
              players={this.state.players}
              numberOfPlayers={this.state.numberOfPlayers}
              playerIsActive={this.state.playerIsActive}
              gameState={this.state.gameState}
              roundState={this.state.roundState}
              cards={this.state.cards}
              cardClicked={this.cardClicked}
              selectedCardIndex={this.state.selectedCardIndex}
              selectedCard={
                this.state.selectedCardIndex !== null
                  ? this.state.cards[this.state.selectedCardIndex]
                  : null
              }
              startGame={this.startGame}
              // possibleMoves={this.state.possibleMoves}
              setJokerCardValue={this.setJokerCardValue}
              jokerCardValue={this.state.jokerCardValue}
              swapCard={this.swapCard}
              fold={this.fold}
              cardSwapConfirmed={this.state.cardSwapConfirmed}
              cardBeingSwapped={this.state.cardBeingSwapped}
              errorMessage={this.state.errorMessage}
              switchSeats={this.switchSeats}
              switchingSeats={this.state.switchingSeats}
            />
            <Chat player={this.props.player} gameID={this.props.gameID} />
          </div>
        </div>
      </div>
    );
  }
}

export default Game;
